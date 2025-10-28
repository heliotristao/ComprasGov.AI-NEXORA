export default async function Page({ params, searchParams }: any) {
  const id = params.id;
  const step = Number(searchParams?.step ?? 1);
  const r = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/etp/' + id, { cache: 'no-store' });
  const etp = await r.json();
  const Wizard = (await import('../_wizard/EtpWizard')).default;
  return <Wizard etp={etp} initialStep={step} />;
}
