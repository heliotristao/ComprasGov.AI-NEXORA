"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateTechnicalSpecs } from "@/hooks/api/useGenerateTechnicalSpecs";
import { usePlanning } from "@/hooks/api/usePlanning";
import {
  useTermsOfReference,
  useUpdateTermsOfReference,
} from "@/hooks/api/useTermsOfReference";

type TermOfReferencePageProps = {
  params: {
    id: string;
  };
};

export default function TermOfReferencePage({ params }: TermOfReferencePageProps) {
  const { id } = params;
  const { data: planning, isLoading, isError } = usePlanning(id);
  const {
    data: termsOfReference,
    isLoading: isLoadingTermsOfReference,
    isError: isTermsOfReferenceError,
  } = useTermsOfReference(id);
  const generateTechnicalSpecsMutation = useGenerateTechnicalSpecs();
  const updateTermsOfReferenceMutation = useUpdateTermsOfReference({
    trId: termsOfReference?.id,
    planningId: id,
  });
  const [technicalSpecsDraft, setTechnicalSpecsDraft] = useState<string | null>(
    null,
  );
  const technicalSpecs =
    technicalSpecsDraft ?? termsOfReference?.technical_specs ?? "";

  const handleGenerateTechnicalSpecs = () => {
    const problemDescription = (
      planning?.problem_description || planning?.description || ""
    ).trim();

    if (!problemDescription) {
      toast.error(
        "Não foi possível encontrar a descrição do problema para gerar as especificações.",
      );
      return;
    }

    generateTechnicalSpecsMutation.mutate(
      { problem_description: problemDescription },
      {
        onSuccess: (data) => {
          setTechnicalSpecsDraft(data.technical_specs);
        },
        onError: () => {
          toast.error("Erro ao gerar as especificações técnicas.");
        },
      },
    );
  };

  const handleSaveProgress = () => {
    if (!termsOfReference?.id) {
      toast.error("Não foi possível identificar o Termo de Referência.");
      return;
    }

    updateTermsOfReferenceMutation.mutate(
      { technical_specs: technicalSpecs },
      {
        onSuccess: (data) => {
          toast.success("Especificações técnicas salvas com sucesso.");
          setTechnicalSpecsDraft(data.technical_specs);
        },
        onError: () => {
          toast.error("Erro ao salvar as especificações técnicas.");
        },
      },
    );
  };

  if (isLoading || isLoadingTermsOfReference) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Termo de Referência</h1>
          <p className="text-sm text-muted-foreground">
            Planejamento selecionado: {id}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Carregando informações do planejamento...
        </p>
      </div>
    );
  }

  if (isError || isTermsOfReferenceError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Termo de Referência</h1>
          <p className="text-sm text-muted-foreground">
            Planejamento selecionado: {id}
          </p>
        </div>
        <p className="text-sm text-red-500">
          Ocorreu um erro ao carregar os dados do planejamento.
        </p>
      </div>
    );
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={handleGenerateTechnicalSpecs}
              disabled={
                generateTechnicalSpecsMutation.isPending ||
                !planning ||
                updateTermsOfReferenceMutation.isPending
              }
            >
              {generateTechnicalSpecsMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </span>
              ) : (
                "Gerar com IA"
              )}
            </Button>
            <Button
              type="button"
              onClick={handleSaveProgress}
              disabled={
                updateTermsOfReferenceMutation.isPending ||
                !technicalSpecs.trim() ||
                !termsOfReference?.id
              }
            >
              {updateTermsOfReferenceMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                "Salvar Progresso"
              )}
            </Button>
          </div>
        </div>
        <Textarea
          id="technical-specifications"
          placeholder="Descreva aqui as especificações técnicas do objeto."
          className="min-h-[320px]"
          value={technicalSpecs}
          onChange={(event) => setTechnicalSpecsDraft(event.target.value)}
        />
      </div>
    </div>
  );
}
