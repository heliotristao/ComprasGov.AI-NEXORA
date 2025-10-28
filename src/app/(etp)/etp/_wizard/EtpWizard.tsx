"use client";
import { useEffect, useRef, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { etpStepSchemas } from '../_schemas/etpSchemas';
import Step1 from '../_steps/Step1';
import Step2 from '../_steps/Step2';
import Step3 from '../_steps/Step3';
import EtpStepper from '../_components/EtpStepper';
import AutosaveBadge from '../_components/AutosaveBadge';

export default function EtpWizard({ etp, initialStep }: any) {
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState<number>(initialStep || 1);
  const form = useForm<any>({
    defaultValues: etp.data ?? {},
    resolver: zodResolver(etpStepSchemas[step]),
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(etp.data ?? {});
    form.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const timer = useRef<any>(null);
  const onSoftChange = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const payload = form.getValues();
      try {
        await fetch(`/api/etp/${etp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step, patch: payload[`passo${step}`] ?? {} }),
        });
      } catch {}
    }, 1500);
  };

  const go = async (dir: 1 | -1) => {
    const ok = await form.trigger(`passo${step}`);
    if (!ok && dir === 1) return;
    const next = step + dir;
    setStep(next);
    const params = new URLSearchParams(search);
    params.set('step', String(next));
    router.replace(`?${params.toString()}`);
    fetch(`/api/etp/${etp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: next }),
    });
  };

  const stepNode = useMemo(() => {
    const props = { control: form.control, watch: form.watch, setValue: form.setValue, onSoftChange };
    if (step === 1) return <Step1 {...props} />;
    if (step === 2) return <Step2 {...props} />;
    return <Step3 {...props} />;
  }, [step]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <EtpStepper current={step} total={3} />
        <AutosaveBadge />
      </div>
      {stepNode}
      <div className="flex justify-between">
        <button className="rounded-lg border px-4 py-2" onClick={() => go(-1)} disabled={step===1}>Voltar</button>
        <div className="space-x-2">
          <button className="rounded-lg border px-4 py-2" onClick={() => window.open(`/api/etp/${etp.id}/export`, '_blank')}>Exportar JSON</button>
          <button className="rounded-lg bg-black text-white px-4 py-2" onClick={() => go(1)} disabled={step===3}>Avançar</button>
        </div>
      </div>
    </div>
  );
}
