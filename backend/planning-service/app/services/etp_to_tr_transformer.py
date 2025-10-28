"""
Serviço para transformar ETP em TR automaticamente
Herda dados do ETP aprovado e adapta para formato do TR
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.db.models.etp_modular import DocumentoETP
from app.db.models.termo_referencia import DocumentoTR
from app.db.models.templates_gestao import ModeloInstitucional
from app.services.etp_ai_service import ETPAIService


class ETPToTRTransformer:
    """
    Transforma ETP aprovado em TR, herdando e adaptando dados
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = ETPAIService(db)
    
    async def criar_tr_de_etp(
        self,
        etp_id: int,
        template_tr_id: int,
        user_id: int
    ) -> DocumentoTR:
        """
        Cria TR automaticamente a partir de ETP aprovado
        
        Args:
            etp_id: ID do ETP aprovado
            template_tr_id: ID do template de TR a ser usado
            user_id: ID do usuário criando o TR
        
        Returns:
            DocumentoTR criado
        """
        # Buscar ETP
        etp = self.db.query(DocumentoETP).filter(DocumentoETP.id == etp_id).first()
        if not etp:
            raise ValueError(f"ETP {etp_id} não encontrado")
        
        # Verificar se ETP está aprovado
        if etp.status != "aprovado":
            raise ValueError(f"ETP {etp_id} não está aprovado. Status atual: {etp.status}")
        
        # Buscar template TR
        template_tr = self.db.query(ModeloInstitucional).filter(
            ModeloInstitucional.id == template_tr_id
        ).first()
        if not template_tr:
            raise ValueError(f"Template TR {template_tr_id} não encontrado")
        
        # Buscar template ETP para obter mapeamento
        template_etp = self.db.query(ModeloInstitucional).filter(
            ModeloInstitucional.id == etp.template_id
        ).first()
        
        # Criar TR vazio
        tr = DocumentoTR(
            etp_id=etp_id,
            plan_id=etp.plan_id,
            template_id=template_tr_id,
            template_version=template_tr.versao,
            created_by=user_id,
            status="rascunho"
        )
        
        # Herdar dados do ETP
        dados_herdados = await self._herdar_dados_etp(etp, template_etp, template_tr)
        
        # Aplicar dados herdados ao TR
        for campo, valor in dados_herdados.items():
            setattr(tr, campo, valor)
        
        # Salvar TR
        self.db.add(tr)
        self.db.commit()
        self.db.refresh(tr)
        
        return tr
    
    async def _herdar_dados_etp(
        self,
        etp: DocumentoETP,
        template_etp: Optional[ModeloInstitucional],
        template_tr: ModeloInstitucional
    ) -> Dict[str, Any]:
        """
        Herda e transforma dados do ETP para o TR
        """
        dados_tr = {}
        
        # Obter mapeamento ETP → TR do template
        mapeamento = template_tr.estrutura.get("mapeamento_etp_para_tr", {})
        
        # 1. DEFINIÇÃO DO OBJETO
        # Herda descrição do objeto do ETP
        dados_tr["definicao_objeto"] = {
            "natureza": self._extrair_campo_etp(etp, "natureza_objeto", "Serviço"),
            "descricao_detalhada": self._extrair_campo_etp(etp, "descricao_objeto", ""),
            "quantitativos": self._extrair_campo_etp(etp, "quantitativos", []),
            "prazo_contrato": {
                "duracao": 12,
                "unidade": "meses"
            },
            "prorrogacao": {
                "permitida": True,
                "condicoes": "Mediante justificativa e disponibilidade orçamentária"
            }
        }
        
        # 2. FUNDAMENTAÇÃO DA CONTRATAÇÃO
        # Referencia o ETP
        dados_tr["fundamentacao"] = {
            "referencia_etp": f"ETP nº {etp.id}/{etp.created_at.year}",
            "extrato_etp": self._extrair_campo_etp(etp, "justificativa_necessidade", ""),
            "informacoes_sigilosas": False
        }
        
        # 3. DESCRIÇÃO DA SOLUÇÃO
        # Herda solução escolhida do ETP
        dados_tr["descricao_solucao"] = {
            "descricao_completa": self._extrair_campo_etp(etp, "solucao_escolhida", ""),
            "ciclo_vida": {
                "implantacao": "A ser detalhado",
                "operacao": "A ser detalhado",
                "manutencao": "A ser detalhado",
                "descontinuacao": "A ser detalhado"
            },
            "requisitos_tecnicos": self._extrair_campo_etp(etp, "requisitos_solucao", [])
        }
        
        # 4. REQUISITOS DA CONTRATAÇÃO
        # Herda requisitos do ETP
        requisitos_etp = self._extrair_campo_etp(etp, "requisitos_solucao", "")
        dados_tr["requisitos_contratacao"] = [
            {
                "categoria": "tecnico",
                "descricao": requisitos_etp,
                "obrigatorio": True,
                "criterio_aceitacao": "Conforme especificações técnicas"
            }
        ]
        
        # 5. MODELO DE EXECUÇÃO
        # Herda cronograma do ETP
        dados_tr["modelo_execucao"] = {
            "metodologia": "A ser detalhado",
            "etapas": self._converter_cronograma_para_etapas(
                self._extrair_campo_etp(etp, "cronograma", {})
            ),
            "local_execucao": "A ser definido",
            "recursos_necessarios": []
        }
        
        # 6. MODELO DE GESTÃO
        # Inicializa vazio para preenchimento
        dados_tr["modelo_gestao"] = {
            "equipe_fiscalizacao": [
                {
                    "papel": "gestor",
                    "responsabilidades": ["Gestão geral do contrato"]
                },
                {
                    "papel": "fiscal_tecnico",
                    "responsabilidades": ["Fiscalização técnica da execução"]
                }
            ],
            "instrumentos_controle": ["Relatórios mensais", "Vistorias periódicas"],
            "periodicidade_fiscalizacao": "Mensal",
            "relatorios_exigidos": [],
            "penalidades": []
        }
        
        # 7. MEDIÇÃO E PAGAMENTO
        dados_tr["medicao_pagamento"] = {
            "forma_medicao": "mensal",
            "descricao_medicao": "Medição mensal dos serviços executados",
            "criterios_medicao": ["Conformidade com especificações", "Prazos cumpridos"],
            "forma_pagamento": "Transferência bancária",
            "prazo_pagamento": 30,
            "glosa": {
                "aplicavel": True,
                "criterios": ["Não conformidade", "Atraso na execução"]
            },
            "retencao": {
                "aplicavel": False
            }
        }
        
        # 8. SELEÇÃO DO FORNECEDOR
        dados_tr["selecao_fornecedor"] = {
            "modalidade": "pregao",
            "forma": "eletronica",
            "criterio_julgamento": "menor_preco",
            "justificativa_criterio": "Objeto com especificações usuais de mercado",
            "exigencias_habilitacao": {
                "juridica": ["Ato constitutivo", "Inscrição no CNPJ"],
                "fiscal": ["Regularidade fiscal federal, estadual e municipal"],
                "economico_financeira": ["Certidão negativa de falência"],
                "tecnica": [],
                "qualificacao_tecnica": []
            },
            "exigencias_proposta": ["Proposta de preços", "Especificações técnicas"],
            "criterios_desempate": ["Sorteio"]
        }
        
        # 9. ESTIMATIVAS DE VALOR
        # Herda estimativa do ETP
        dados_tr["estimativas_valor"] = {
            "valor_total_estimado": self._extrair_campo_etp(etp, "estimativa_valor", 0.0),
            "itens": self._extrair_campo_etp(etp, "itens_orcamento", []),
            "memoria_calculo": self._extrair_campo_etp(etp, "memoria_calculo", "Conforme pesquisa de preços realizada"),
            "parametros_obtencao": "Pesquisa de mercado",
            "documentos_suporte": ["Cotações", "Preços de referência"],
            "sigilo": False
        }
        
        # 10. ADEQUAÇÃO ORÇAMENTÁRIA
        dados_tr["adequacao_orcamentaria"] = {
            "fonte_recursos": "A ser definido",
            "programa_trabalho": "A ser definido",
            "natureza_despesa": "A ser definido",
            "valor_disponivel": self._extrair_campo_etp(etp, "estimativa_valor", 0.0),
            "exercicio": etp.created_at.year,
            "plurianual": False,
            "previsao_exercicios_futuros": []
        }
        
        return dados_tr
    
    def _extrair_campo_etp(
        self,
        etp: DocumentoETP,
        campo_id: str,
        default: Any = None
    ) -> Any:
        """
        Extrai valor de um campo do ETP
        """
        if not etp.dados:
            return default
        
        # Procurar em todas as seções
        for secao_id, secao_dados in etp.dados.items():
            if campo_id in secao_dados:
                return secao_dados[campo_id]
        
        return default
    
    def _converter_cronograma_para_etapas(
        self,
        cronograma: Dict[str, Any]
    ) -> list:
        """
        Converte cronograma do ETP em etapas do TR
        """
        if not cronograma or not isinstance(cronograma, dict):
            return []
        
        etapas = []
        for i, (fase, dados) in enumerate(cronograma.items(), 1):
            etapas.append({
                "numero": i,
                "nome": fase,
                "descricao": dados.get("descricao", ""),
                "prazo": dados.get("prazo", 30),
                "entregaveis": dados.get("entregaveis", []),
                "criterios_aceitacao": dados.get("criterios", [])
            })
        
        return etapas

