import { z } from 'zod';

export const edocsRegex = /^[0-9]{4}-[A-Z0-9]{6}$/;

export const passo1Schema = z.object({
  edocs: z.string().regex(edocsRegex, 'Formato: AAAA-XXXXXX (maiúsculo, letras/números)'),
  objeto: z.string().min(10, 'Descreva o objeto com ao menos 10 caracteres'),
  justificativa: z.string().min(15, 'Explique a necessidade'),
});

export const passo2Schema = z.object({
  requisitosTecnicos: z.array(z.string().min(3)).min(1, 'Inclua ao menos 1 requisito'),
  requisitosMinimos: z.array(z.string().min(3)).optional(),
});

export const passo3Schema = z.object({
  estimativaValor: z.number().nonnegative(),
  metodologiaPesquisa: z.enum(['ARP', 'Cotações', 'Histórico', 'Misto']),
  fontesPesquisa: z.array(z.string().url('URL inválida')).optional(),
});

export const etpStepSchemas: Record<number, z.ZodTypeAny> = {
  1: passo1Schema,
  2: passo2Schema,
  3: passo3Schema,
};

export const etpFullSchema = z.object({
  passo1: passo1Schema,
  passo2: passo2Schema.optional(),
  passo3: passo3Schema.optional(),
});
