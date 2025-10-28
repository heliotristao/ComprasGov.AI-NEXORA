
"use client";
import { useState } from "react";

interface PlanningForm {
  unidade: string;
  descricao: string;
  estimativa: number;
  edocs: string;
}

export default function PlanningWizard() {
  const [form, setForm] = useState<PlanningForm>({
    unidade: "",
    descricao: "",
    estimativa: 0,
    edocs: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_PLANNING_API_URL + "/plannings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Unidade Requisitante</span>
          <input
            className="w-full rounded-lg border p-2"
            value={form.unidade}
            onChange={(e) => setForm({ ...form, unidade: e.target.value })}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Número do e-Docs (AAAA-XXXXXX)</span>
          <input
            className="w-full rounded-lg border p-2 uppercase tracking-widest"
            value={form.edocs}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
              setForm({ ...form, edocs: v });
            }}
            pattern="^[0-9]{4}-[A-Z0-9]{6}$"
            placeholder="2025-ABC123"
            required
          />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-sm font-medium">Descrição resumida</span>
        <textarea
          className="w-full rounded-lg border p-2"
          rows={4}
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          required
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Estimativa (R$)</span>
        <input
          type="number"
          className="w-full max-w-xs rounded-lg border p-2"
          value={form.estimativa}
          onChange={(e) => setForm({ ...form, estimativa: Number(e.target.value) })}
          min={0}
          step={0.01}
          required
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Criar Planejamento"}
      </button>

      {result && (
        <pre className="mt-6 overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-white">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}
