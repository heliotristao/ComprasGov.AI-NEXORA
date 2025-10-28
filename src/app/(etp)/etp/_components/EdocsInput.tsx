"use client";
import { Input } from 'react';
export default function EdocsInput({ value, onChange }: { value?: string; onChange: (v: string)=>void }) {
  function normalize(v: string) {
    const up = v.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const digits = up.replace(/-/g, '');
    if (digits.length <= 4) return digits;
    return (digits.slice(0,4) + '-' + digits.slice(4,10)).slice(0, 11);
  }
  return (
    <div className="space-y-1">
      <input
        className="w-full rounded-lg border p-2 uppercase tracking-widest"
        value={value || ''}
        placeholder="2025-XXXXXX"
        onChange={(e:any)=> onChange(normalize(e.target.value))}
      />
      {value ? (<a className="text-sm underline text-blue-600" href={"https://edocs.es.gov.br/edocs/" + encodeURIComponent(value)} target="_blank" rel="noreferrer">Abrir no Edocs</a>) : null}
    </div>
  );
}
