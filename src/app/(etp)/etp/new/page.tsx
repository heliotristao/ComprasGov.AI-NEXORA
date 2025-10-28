export default function Page() {
  async function create(formData: FormData) {
    'use server';
  }
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold">Criar novo ETP</h2>
      <form action={create} className="space-y-3">
        <p>Use o botão abaixo para criar via API.</p>
        <a className="inline-block rounded bg-black px-4 py-2 text-white" href="/etp/novo" onClick={(e)=>{e.preventDefault(); fetch('/api/etp',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ edocs: '2025-ABC123' })}).then(r=>r.json()).then(d=>{ if(d.id) location.href='/etp/'+d.id; });}}>Criar ETP</a>
      </form>
    </div>
  );
}
