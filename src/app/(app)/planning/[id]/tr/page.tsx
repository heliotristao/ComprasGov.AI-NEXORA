import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type TermOfReferencePageProps = {
  params: {
    id: string;
  };
};

export default function TermOfReferencePage({ params }: TermOfReferencePageProps) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Termo de Referência</h1>
        <p className="text-sm text-muted-foreground">
          Planejamento selecionado: {id}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Label htmlFor="technical-specifications" className="text-base font-semibold">
            Especificações Técnicas do Objeto
          </Label>
          <Button type="button">Gerar com IA</Button>
        </div>
        <Textarea
          id="technical-specifications"
          placeholder="Descreva aqui as especificações técnicas do objeto."
          className="min-h-[320px]"
        />
      </div>
    </div>
  );
}
