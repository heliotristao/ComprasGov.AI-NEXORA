#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token;
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

async function fetchSchema(input) {
  try {
    const url = new URL(input);
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`Failed to download OpenAPI schema (${response.status} ${response.statusText})`);
    }
    return await response.json();
  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      const absolutePath = resolve(process.cwd(), input);
      return JSON.parse(readFileSync(absolutePath, 'utf8'));
    }
    throw error;
  }
}

async function loadSchema(input) {
  try {
    return await fetchSchema(input);
  } catch (error) {
    if (input.startsWith('http://localhost:8000')) {
      const scriptPath = resolve(process.cwd(), 'backend/api-gateway/scripts/export_openapi.py');
      const buffer = execSync(`python ${JSON.stringify(scriptPath)}`, {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      return JSON.parse(buffer.toString('utf8'));
    }
    throw error;
  }
}

function toPascalCase(value) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function resolveRef(ref) {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  if (!match) {
    throw new Error(`Unsupported $ref: ${ref}`);
  }
  return toPascalCase(match[1]);
}

function schemaToTs(schema) {
  if (!schema) {
    return 'unknown';
  }
  if (schema.$ref) {
    return resolveRef(schema.$ref);
  }
  if (schema.oneOf) {
    return schema.oneOf.map((item) => schemaToTs(item)).join(' | ');
  }
  if (schema.anyOf) {
    return schema.anyOf.map((item) => schemaToTs(item)).join(' | ');
  }
  if (schema.allOf) {
    return schema.allOf.map((item) => schemaToTs(item)).join(' & ');
  }
  if (schema.enum) {
    return schema.enum.map((value) => JSON.stringify(value)).join(' | ');
  }
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `${schemaToTs(schema.items)}[]`;
    case 'object': {
      const properties = schema.properties ?? {};
      const required = new Set(schema.required ?? []);
      const entries = Object.entries(properties).map(([key, value]) => {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
        return `  ${safeKey}${required.has(key) ? '' : '?'}: ${schemaToTs(value)};`;
      });
      if (schema.additionalProperties) {
        entries.push(`  [key: string]: ${schemaToTs(schema.additionalProperties)};`);
      }
      if (entries.length === 0) {
        return 'Record<string, unknown>';
      }
      return `{
${entries.join('\n')}
}`;
    }
    default:
      return 'unknown';
  }
}

function generateModels(components) {
  const schemas = components?.schemas ?? {};
  const declarations = [];
  for (const [name, schema] of Object.entries(schemas)) {
    const typeName = toPascalCase(name);
    const typeBody = schemaToTs(schema);
    declarations.push(`export type ${typeName} = ${typeBody};`);
  }
  if (declarations.length === 0) {
    return '';
  }
  return `${declarations.join('\n\n')}\n`;
}

function collectOperations(spec) {
  const operationsByTag = new Map();
  const paths = spec.paths ?? {};

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) continue;
      if (typeof operation !== 'object' || operation === null) continue;
      const tags = operation.tags?.length ? operation.tags : ['Default'];
      const entry = { path, method: method.toUpperCase(), operation };
      for (const tag of tags) {
        if (!operationsByTag.has(tag)) {
          operationsByTag.set(tag, []);
        }
        operationsByTag.get(tag).push(entry);
      }
    }
  }

  return operationsByTag;
}

function getResponseType(operation) {
  const responses = operation.responses ?? {};
  const successStatus = Object.keys(responses).find((status) => /^2\d\d$/.test(status));
  if (!successStatus) {
    return 'void';
  }
  const response = responses[successStatus];
  const content = response?.content ?? {};
  const mediaType = content['application/json'] ?? Object.values(content)[0];
  if (!mediaType) {
    return 'void';
  }
  return schemaToTs(mediaType.schema);
}

function buildParameterObject(operation) {
  const parameters = [...(operation.parameters ?? [])];
  const paramLines = [];
  const queryAssignments = [];
  const headerAssignments = [];
  const pathParams = [];

  for (const parameter of parameters) {
    const { name, required, schema, in: location } = parameter;
    const camelName = toCamelCase(name);
    const type = schemaToTs(schema);
    if (location === 'query') {
      paramLines.push(`    ${camelName}${required ? '' : '?'}: ${type};`);
      queryAssignments.push(`      ${JSON.stringify(name)}: params.${camelName},`);
    } else if (location === 'header') {
      paramLines.push(`    ${camelName}${required ? '' : '?'}: ${type};`);
      headerAssignments.push(`      ${JSON.stringify(name)}: params.${camelName},`);
    } else if (location === 'path') {
      paramLines.push(`    ${camelName}${required ? '' : '?'}: ${type};`);
      pathParams.push({ name, camelName });
    }
  }

  let bodyAssignment = '';
  if (operation.requestBody) {
    const requestBody = operation.requestBody;
    const mediaType = requestBody.content?.['application/json'] ?? Object.values(requestBody.content ?? {})[0];
    const bodyType = schemaToTs(mediaType?.schema);
    paramLines.push(`    body${requestBody.required ? '' : '?'}: ${bodyType};`);
    bodyAssignment = '      data: params.body,\n';
  }

  if (paramLines.length === 0) {
    return {
      signature: '',
      usage: { pathParams, queryAssignments, headerAssignments, bodyAssignment: '' },
    };
  }

  return {
    signature: `params: {\n${paramLines.join('\n')}\n  }, `,
    usage: { pathParams, queryAssignments, headerAssignments, bodyAssignment },
  };
}

function interpolatePath(path, pathParams) {
  let finalPath = path;
  for (const { name, camelName } of pathParams) {
    finalPath = finalPath.replace(`{${name}}`, '${params.' + camelName + '}');
  }
  return finalPath.includes('${') ? `\`${finalPath}\`` : JSON.stringify(finalPath);
}

function generateService(tag, entries) {
  const className = `${toPascalCase(tag)}Service`;
  const methods = entries
    .map(({ path, method, operation }) => {
      const operationId = operation.operationId ? toCamelCase(operation.operationId) : toCamelCase(`${method}_${path}`);
      const { signature, usage } = buildParameterObject(operation);
      const responseType = getResponseType(operation);
      const pathExpression = usage.pathParams.length ? interpolatePath(path, usage.pathParams) : JSON.stringify(path);
      const queryBlock = usage.queryAssignments.length
        ? `      params: {\n${usage.queryAssignments.join('\n')}\n      },\n`
        : '';
      const headerBlock = usage.headerAssignments.length
        ? `      headers: {\n${usage.headerAssignments.join('\n')}\n      },\n`
        : '';
      const bodyBlock = usage.bodyAssignment ?? '';

      return `  public static async ${operationId}(${signature}options: RequestOptions = {}): Promise<${responseType}> {\n    const data = await request<${responseType}>({\n      method: '${method}',\n      url: ${pathExpression},\n${queryBlock}${headerBlock}${bodyBlock}      ...options,\n    });\n    return data;\n  }`;
    })
    .join('\n\n');

  return `import { request, RequestOptions } from '../core/request';\n\nexport class ${className} {\n${methods}\n}\n`;
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args['--input'];
  const output = args['--output'];

  if (!input || !output) {
    console.error('Usage: openapi --input <schema> --output <dir> [--client axios]');
    process.exit(1);
  }

  const spec = await loadSchema(input);
  const outDir = resolve(process.cwd(), output);
  rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  const baseURL = spec.servers?.[0]?.url ?? 'http://localhost:8000';
  const version = spec.info?.version ?? '1.0.0';

  const openApiContent = `export interface OpenAPIConfig {\n  BASE: string;\n  VERSION: string;\n  TOKEN?: string | (() => string | undefined);\n}\n\nexport const OpenAPI: OpenAPIConfig = {\n  BASE: ${JSON.stringify(baseURL)},\n  VERSION: ${JSON.stringify(version)},\n};\n\nexport function getToken() {\n  return typeof OpenAPI.TOKEN === 'function' ? OpenAPI.TOKEN() : OpenAPI.TOKEN;\n}\n`;

  const requestContent = `import axios, { AxiosRequestConfig } from 'axios';\nimport { OpenAPI, getToken } from './OpenAPI';\n\nexport interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method'> {}\n\nexport async function request<T>(config: AxiosRequestConfig): Promise<T> {\n  const token = getToken();\n  const headers = {\n    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),\n    ...config.headers,\n  };\n\n  const response = await axios.request<T>({\n    baseURL: OpenAPI.BASE,\n    ...config,\n    headers,\n  });\n\n  return response.data;\n}\n`;

  ensureDir(join(outDir, 'core'));
  writeFileSync(join(outDir, 'core', 'OpenAPI.ts'), openApiContent);
  writeFileSync(join(outDir, 'core', 'request.ts'), requestContent);

  const modelsContent = generateModels(spec.components);
  if (modelsContent) {
    ensureDir(join(outDir, 'models'));
    writeFileSync(join(outDir, 'models', 'index.ts'), modelsContent);
  }

  const operationsByTag = collectOperations(spec);
  const serviceFiles = [];
  ensureDir(join(outDir, 'services'));
  for (const [tag, entries] of operationsByTag.entries()) {
    const serviceContent = generateService(tag, entries);
    serviceFiles.push({ tag, content: serviceContent });
    writeFileSync(join(outDir, 'services', `${toPascalCase(tag)}Service.ts`), serviceContent);
  }

  const indexExports = [];
  if (modelsContent) {
    indexExports.push("export * from './models';");
  }
  for (const { tag } of serviceFiles) {
    indexExports.push(`export * from './services/${toPascalCase(tag)}Service';`);
  }
  indexExports.push("export * from './core/OpenAPI';");
  indexExports.push("export { request, type RequestOptions } from './core/request';");
  writeFileSync(join(outDir, 'index.ts'), `${indexExports.join('\n')}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

