import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"

interface DocumentoETP {
  id: number
  plan_id: number
  template_id: number
  dados: Record<string, any>
  campos_obrigatorios_preenchidos: Record<string, boolean>
  progresso_percentual: number
  status: string
  campos_gerados_ia: string[]
  scores_confianca_ia: Record<string, number>
  created_by: number
  created_at: string
  updated_at: string
}

interface Template {
  id: number
  nome: string
  estrutura: {
    secoes: any[]
  }
  mapeamento_lei: Record<string, any>
  configuracao_documento: Record<string, any>
}

interface ValidacaoConformidade {
  valido: boolean
  campos_obrigatorios_faltantes: string[]
  avisos: string[]
  progresso_percentual: number
  detalhes: Record<string, any>
}

export function useETPDocument(documentoId: number) {
  const queryClient = useQueryClient()

  // Buscar documento
  const {
    data: documento,
    isLoading: loadingDocumento,
    error: errorDocumento
  } = useQuery<DocumentoETP>({
    queryKey: ["etp-documento", documentoId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/etp/${documentoId}`)
      return response.data
    },
    enabled: !!documentoId
  })

  // Buscar template
  const {
    data: template,
    isLoading: loadingTemplate
  } = useQuery<Template>({
    queryKey: ["template", documento?.template_id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/modelos-institucionais/${documento?.template_id}`)
      return response.data
    },
    enabled: !!documento?.template_id
  })

  // Mutation para atualizar dados
  const updateMutation = useMutation({
    mutationFn: async (dados: Record<string, any>) => {
      const response = await api.put(`/api/v1/etp/${documentoId}`, {
        dados
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etp-documento", documentoId] })
    }
  })

  // Mutation para validar conformidade
  const validarMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/api/v1/etp/${documentoId}/validar`)
      return response.data
    }
  })

  // Mutation para gerar campo com IA
  const gerarCampoMutation = useMutation({
    mutationFn: async (params: {
      secao_id: string
      campo_id: string
      contexto: Record<string, any>
      prompt_customizado?: string
    }) => {
      const response = await api.post(`/api/v1/etp/${documentoId}/gerar-campo`, params)
      return response.data
    }
  })

  // Mutation para aceitar conteúdo da IA
  const aceitarIAMutation = useMutation({
    mutationFn: async (params: {
      campo_id: string
      conteudo: string
      score_confianca: number
    }) => {
      const response = await api.post(
        `/api/v1/etp/${documentoId}/aceitar-ia/${params.campo_id}`,
        {
          conteudo: params.conteudo,
          score_confianca: params.score_confianca
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etp-documento", documentoId] })
    }
  })

  return {
    documento,
    template,
    isLoading: loadingDocumento || loadingTemplate,
    error: errorDocumento,
    
    // Ações
    atualizarDados: updateMutation.mutateAsync,
    validarConformidade: validarMutation.mutateAsync,
    gerarCampo: gerarCampoMutation.mutateAsync,
    aceitarConteudoIA: aceitarIAMutation.mutateAsync,
    
    // Estados das mutations
    isUpdating: updateMutation.isPending,
    isValidating: validarMutation.isPending,
    isGenerating: gerarCampoMutation.isPending
  }
}

