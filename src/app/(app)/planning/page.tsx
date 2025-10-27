'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PlanningPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de ETPs
    router.push('/etp');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecionando para Planejamento...</p>
      </div>
    </div>
  );
}

