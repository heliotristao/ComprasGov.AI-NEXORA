const Module = require('node:module');

const originalLoad = Module._load;

Module._load = function patchedModuleLoad(request, parent, isMain) {
  if (request === '@rushstack/eslint-patch' || request.startsWith('@rushstack/eslint-patch/')) {
    return {};
  }

  return originalLoad.call(this, request, parent, isMain);
};
