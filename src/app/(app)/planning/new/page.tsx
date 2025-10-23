"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePlanning } from "@/hooks/api/usePlannings";
import { useGenerateNecessity } from "@/hooks/api/useGenerateNecessity";
import { useGenerateTechnicalViability } from "@/hooks/api/useGenerateTechnicalViability";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  year: z
    .string()
    .min(4, "Informe o ano com 4 dígitos.")
    .max(4, "Informe o ano com 4 dígitos."),
  name: z.string().min(1, "Informe o nome do planejamento."),
  necessity: z.string().min(1, "Descreva a justificativa da necessidade."),
  solution_comparison: z
    .string()
    .min(1, "Inclua o comparativo entre as soluções consideradas."),
  contract_quantities: z
    .string()
    .min(1, "Informe os quantitativos previstos para o contrato."),
  technical_viability: z
    .string()
    .min(1, "Descreva a análise de viabilidade técnica."),
  expected_results: z
    .string()
    .min(1, "Indique os resultados esperados com a contratação."),
});

type FormData = z.infer<typeof formSchema>;

const stepConfigurations: {
  title: string;
  fields: (keyof FormData)[];
}[] = [
  { title: "Informações Básicas", fields: ["year", "name"] },
  {
    title: "Justificativas e Soluções",
    fields: ["necessity", "solution_comparison"],
  },
  {
    title: "Quantitativos e Viabilidade",
    fields: ["contract_quantities", "technical_viability"],
  },
  { title: "Resultados Esperados", fields: ["expected_results"] },
];

export default function NewPlanningPage() {
  const router = useRouter();
  const createPlanningMutation = useCreatePlanning();
  const generateNecessityMutation = useGenerateNecessity();
  const generateTechnicalViabilityMutation = useGenerateTechnicalViability();
  const [currentStep, setCurrentStep] = useState(0);

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = formMethods;

  const handleGenerateTechnicalViability = () => {
    const problemDescription = getValues("necessity").trim();

    if (!problemDescription) {
      toast.error(
        "Preencha a justificativa da necessidade antes de gerar a viabilidade técnica.",
      );
      return;
    }

    generateTechnicalViabilityMutation.mutate(
      { problem_description: problemDescription },
      {
        onSuccess: (data) => {
          setValue("technical_viability", data.generated_text, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        },
        onError: () => {
          toast.error("Erro ao gerar viabilidade técnica.");
        },
      },
    );
  };

  const goToNextStep = () => {
    setCurrentStep((step) => Math.min(step + 1, stepConfigurations.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const onSubmit = (data: FormData) => {
    createPlanningMutation.mutate(data, {
      onSuccess: () => {
        alert("Planejamento criado com sucesso!");
        router.push("/planning");
      },
      onError: () => {
        alert("Erro ao criar planejamento.");
      },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Novo Planejamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-6 text-sm text-muted-foreground">
              Passo {currentStep + 1} de {stepConfigurations.length}: {" "}
              {stepConfigurations[currentStep]?.title}
            </p>

            <div className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano</Label>
                    <Input id="year" {...register("year")} />
                    {errors.year && (
                      <p className="text-sm text-red-500">{errors.year.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="necessity">Justificativa da Necessidade</Label>
                    <Textarea id="necessity" {...register("necessity")} />
                    {errors.necessity && (
                      <p className="text-sm text-red-500">{errors.necessity.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        generateNecessityMutation.mutate(
                          { problem_description: "teste" },
                          {
                            onSuccess: (data) => {
                              formMethods.setValue("necessity", data.necessity);
                            },
                            onError: () => {
                              toast.error("Erro ao gerar justificativa.");
                            },
                          }
                        )
                      }
                      disabled={generateNecessityMutation.isPending}
                    >
                      {generateNecessityMutation.isPending
                        ? "Gerando..."
                        : "Gerar com IA"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution_comparison">Comparativo de Soluções</Label>
                    <Textarea
                      id="solution_comparison"
                      {...register("solution_comparison")}
                    />
                    {errors.solution_comparison && (
                      <p className="text-sm text-red-500">
                        {errors.solution_comparison.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_quantities">Quantitativos do Contrato</Label>
                    <Textarea
                      id="contract_quantities"
                      {...register("contract_quantities")}
                    />
                    {errors.contract_quantities && (
                      <p className="text-sm text-red-500">
                        {errors.contract_quantities.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technical_viability">Viabilidade Técnica</Label>
                    <Textarea
                      id="technical_viability"
                      {...register("technical_viability")}
                    />
                    {errors.technical_viability && (
                      <p className="text-sm text-red-500">
                        {errors.technical_viability.message}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateTechnicalViability}
                      disabled={generateTechnicalViabilityMutation.isPending}
                    >
                      {generateTechnicalViabilityMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Gerando...
                        </span>
                      ) : (
                        "Gerar com IA"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected_results">Resultados Esperados</Label>
                    <Textarea id="expected_results" {...register("expected_results")} />
                    {errors.expected_results && (
                      <p className="text-sm text-red-500">
                        {errors.expected_results.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 0}
                onClick={goToPreviousStep}
              >
                Voltar
              </Button>
              {currentStep < stepConfigurations.length - 1 ? (
                <Button type="button" onClick={goToNextStep}>
                  Avançar
                </Button>
              ) : (
                <Button type="submit" disabled={createPlanningMutation.isPending}>
                  {createPlanningMutation.isPending ? "Salvando..." : "Salvar Planejamento"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
