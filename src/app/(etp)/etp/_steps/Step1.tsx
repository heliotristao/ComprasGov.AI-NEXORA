"use client";
import { Controller } from 'react-hook-form';
import EdocsInput from '../_components/EdocsInput';

export default function Step1({ control, onSoftChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Edocs (obrigatório)</label>
        <Controller name="passo1.edocs" control={control} render={({ field }) => (
          <EdocsInput value={field.value} onChange={(v)=>{ field.onChange(v); onSoftChange(); }} />
        )} />
      </div>
      <div>
        <label className="block text-sm font-medium">Objeto</label>
        <textarea className="w-full rounded-lg border p-2" rows={3} onChange={(e)=>{ control._updateFormState && control._updateFormState(); onSoftChange(); }} {...(control._fields?.['passo1.objeto']||{})} />
      </div>
      <div>
        <label className="block text-sm font-medium">Justificativa</label>
        <textarea className="w-full rounded-lg border p-2" rows={4} onChange={(e)=>{ control._updateFormState && control._updateFormState(); onSoftChange(); }} {...(control._fields?.['passo1.justificativa']||{})} />
      </div>
    </div>
  );
}
