"use client"

import * as React from "react"
import { X, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AIProcessingStatus } from "./ai-processing-status"
import { cn } from "@/lib/utils"

/**
 * Mensagem do chat
 */
export interface ChatMessage {
  /** ID único da mensagem */
  id: string
  /** Papel (usuário ou assistente) */
  role: "user" | "assistant"
  /** Conteúdo da mensagem */
  content: string
  /** Timestamp */
  timestamp: Date
}

/**
 * Props para o componente AIAssistant
 */
export interface AIAssistantProps {
  /** Se o assistente está aberto */
  isOpen: boolean
  /** Callback para fechar o assistente */
  onClose: () => void
  /** Mensagens do chat */
  messages: ChatMessage[]
  /** Callback para enviar mensagem */
  onSendMessage: (message: string) => void
  /** Se está processando */
  isProcessing?: boolean
  /** Placeholder do input */
  placeholder?: string
  /** Título customizado */
  title?: string
  /** Descrição customizada */
  description?: string
}

/**
 * Componente de assistente de IA (chat lateral) que segue o Design System NEXORA.
 * 
 * Exibe um painel lateral com chat para interação com a IA.
 * Versão simplificada focada em UI, a lógica de integração com API deve ser implementada externamente.
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const [messages, setMessages] = useState<ChatMessage[]>([])
 * 
 * const handleSend = (message: string) => {
 *   // Adicionar mensagem do usuário
 *   setMessages([...messages, { id: uuid(), role: "user", content: message, timestamp: new Date() }])
 *   // Chamar API da IA...
 * }
 * 
 * <AIAssistant
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   messages={messages}
 *   onSendMessage={handleSend}
 * />
 * ```
 */
export function AIAssistant({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isProcessing = false,
  placeholder = "Digite sua pergunta...",
  title = "Assistente IA",
  description = "Como posso ajudar você hoje?",
}: AIAssistantProps) {
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll para última mensagem
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <Card className="border-0 rounded-none shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Sparkles className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <CardTitle className="text-h4">{title}</CardTitle>
                  <CardDescription className="text-caption">{description}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 text-purple-300" />
              <p className="text-body-small">
                Inicie uma conversa com o assistente de IA
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-purple-50 text-purple-900 border border-purple-200"
                  )}
                >
                  <p className="text-body-small whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                <AIProcessingStatus message="Pensando..." size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <Card className="border-0 border-t rounded-none shadow-none">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                rows={2}
                disabled={isProcessing}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isProcessing}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-caption text-muted-foreground mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

