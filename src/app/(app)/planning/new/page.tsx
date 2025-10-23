"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePlanning } from "@/hooks/api/usePlannings";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  year: z.string().min(4),
  name: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function NewPlanningPage() {
  const router = useRouter();
  const createPlanningMutation = useCreatePlanning();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

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
            <div className="mb-4">
              <Label htmlFor="year">Ano</Label>
              <Input id="year" {...register("year")} />
              {errors.year && <p className="text-red-500">{errors.year.message}</p>}
            </div>
            <div className="mb-4">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <Button type="submit" disabled={createPlanningMutation.isPending}>
              {createPlanningMutation.isPending ? "Salvando..." : "Salvar Planejamento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
