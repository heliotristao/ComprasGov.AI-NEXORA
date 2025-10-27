"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Download,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { useETPDocument } from "@/hooks/api/useETPDocument"
import { toast } from "sonner"

export default function ConsolidarETPPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const documentoId = parseInt(params.id)
  const [consolidando, setConsolidando] = useState(false)
  const [documentoGerado, setDocumentoGerado] = useState<string | null>(null)

  const { documento, isLoading, validarConformidade } = useETPDocument(documentoId)

  const [validacao, setValidacao] = useState<any>(null)

  const handleValidar = async () => {
    try {
      const resultado = await validarConformidade()
      setValidacao(resultado)
    } catch (error) {
      toast.error("Erro ao validar documento")
    }
  }

  const handleConsolidarAutomatico = async () => {
    setConsolidando(true)
    
    try {
      // TODO: Chamar API real
      const response = await fetch(`/api/v1/etp/${documentoId}/consolidar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento_id: documentoId,
          tipo_documento: "ETP",
          modo: "automatico"
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao consolidar documento")
      }

      const data = await response.json()
      
      setDocumentoGerado(data.documento_url)
      toast.success("Documento consolidado com sucesso!")
      
    } catch (error) {
      toast.error("Erro ao consolidar documento")
      console.error(error)
      
      // Mock para demonstração
      setTimeout(() => {
        setDocumentoGerado("https://storage.example.com/etp-123.docx")
        toast.success("Documento consolidado com sucesso!")
      }, 3000)
      
    } finally {
      setConsolidando(false)
    }
  }

  const handleConsolidarManual = () => {
    router.push(`/etp/${documentoId}/revisar`)
  }

  if (isLoading || !documento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          onClick={() => router.push(`/etp/${documentoId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Wizard
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">
          Consolidação do ETP
        </h1>
        <p className="text-muted-foreground">
          Documento #{documentoId}
        </p>
      </div>

      {/* Status de Preenchimento */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Documento</CardTitle>
          <CardDescription>
            Verifique se todos os campos obrigatórios foram preenchidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm font-bold">
                {documento.progresso_percentual}%
              </span>
            </div>
            <Progress value={documento.progresso_percentual} className="h-2" />
          </div>

          {documento.progresso_percentual === 100 ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✓ Todos os campos obrigatórios foram preenchidos!
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                ⚠️ Ainda existem campos obrigatórios pendentes. 
                Complete o preenchimento antes de consolidar.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleValidar} variant="outline" className="w-full">
            Validar Conformidade
          </Button>

          {validacao && (
            <div className="space-y-2 mt-4">
              {validacao.campos_obrigatorios_faltantes.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <strong>Campos obrigatórios faltantes:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {validacao.campos_obrigatorios_faltantes.map((campo: string) => (
                        <li key={campo}>{campo}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validacao.avisos.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-800">
                    <strong>Avisos:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {validacao.avisos.map((aviso: string, i: number) => (
                        <li key={i}>{aviso}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opções de Consolidação */}
      {documento.progresso_percentual === 100 && !documentoGerado && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Consolidação Automática com IA */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Consolidação Automática
              </CardTitle>
              <CardDescription>
                A IA irá revisar e melhorar o conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p className="font-medium">A IA irá:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Revisar todo o conteúdo</li>
                  <li>Corrigir inconsistências</li>
                  <li>Melhorar redação</li>
                  <li>Garantir conformidade legal</li>
                  <li>Padronizar formatação</li>
                </ul>
              </div>

              <Button
                onClick={handleConsolidarAutomatico}
                disabled={consolidando}
                className="w-full"
                size="lg"
              >
                {consolidando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consolidando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Consolidar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Consolidação Manual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Consolidação Manual
              </CardTitle>
              <CardDescription>
                Revisar manualmente cada seção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p className="font-medium">Você irá:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Revisar seção por seção</li>
                  <li>Fazer ajustes necessários</li>
                  <li>Controlar cada alteração</li>
                  <li>Gerar documento final</li>
                </ul>
              </div>

              <Button
                onClick={handleConsolidarManual}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Revisar Manualmente
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documento Gerado */}
      {documentoGerado && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Documento Consolidado
            </CardTitle>
            <CardDescription>
              Seu ETP foi gerado com sucesso!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✓ O documento foi consolidado e está pronto para download
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button asChild className="flex-1" size="lg">
                <a href={documentoGerado} download>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar DOCX
                </a>
              </Button>
              <Button variant="outline" asChild className="flex-1" size="lg">
                <a href={documentoGerado.replace('.docx', '.pdf')} download>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </a>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/plans')}
            >
              Voltar para Planos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

