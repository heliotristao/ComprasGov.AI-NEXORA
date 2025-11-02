# Runbook Operacional - NEXORA-ComprasGov.AI

Este documento é um guia para a equipe de operações e desenvolvimento para diagnosticar e resolver problemas comuns no ambiente de produção, além de descrever procedimentos operacionais padrão.

---

## 1. Diagnóstico de Falhas Comuns

### 1.1. A geração de IA (ETP/TR) está lenta ou falhando

**Sintomas:**
*   Requisições para os endpoints de IA (`/api/v1/etp/generate-field`, `/api/v1/tr/generate-field`) estão resultando em `timeout` (HTTP 504) ou `Internal Server Error` (HTTP 500).
*   A interface do usuário exibe mensagens de erro ao tentar usar a funcionalidade "Gerar com IA".

**Procedimento de Diagnóstico:**

1.  **Verificar Logs do `planning-service`:**
    *   Procure por mensagens de erro relacionadas a `openai`, `httpx`, ou `langchain`.
    *   Filtre os logs pelo `trace_id` da requisição falha para correlacionar eventos.
    *   **Comando Exemplo:** `docker compose logs planning-service | grep "ERROR" | grep "trace_id=..."`

2.  **Verificar Status do Provedor de LLM:**
    *   Acesse a página de status da OpenAI (ou do provedor configurado) para verificar se há uma interrupção de serviço ativa.
    *   **URL:** [https://status.openai.com/](https://status.openai.com/)

3.  **Analisar Timeouts de Configuração:**
    *   Verifique as variáveis de ambiente do `planning-service` relacionadas a timeouts de HTTP (ex: `HTTP_CLIENT_TIMEOUT`). Se os valores forem muito baixos, a chamada para o LLM pode estar sendo interrompida prematuramente.

4.  **Verificar Conectividade de Rede:**
    *   A partir do container do `planning-service`, tente se conectar à API do provedor de LLM para descartar problemas de DNS ou firewall.
    *   **Comando Exemplo:** `docker compose exec planning-service ping api.openai.com`

### 1.2. A consolidação de DOCX/PDF (ETP/TR) falha

**Sintomas:**
*   O usuário tenta gerar o documento final (DOCX ou PDF), mas recebe uma mensagem de erro na interface.
*   O status do documento no banco de dados não é atualizado para "Consolidado".
*   Nenhum artefato é salvo no storage (S3).

**Procedimento de Diagnóstico:**

1.  **Verificar Logs do `planning-service`:**
    *   A consolidação é um processo assíncrono. Procure por logs de `celery` (se aplicável) ou logs de erro nos workers responsáveis pela tarefa.
    *   Busque por erros relacionados a `python-docx`, `reportlab`, ou `boto3` (para o upload ao S3).
    *   **Comando Exemplo:** `docker compose logs planning-service | grep "Consolidation failed"`

2.  **Verificar Permissões de Arquivo e Storage:**
    *   Confirme se o `planning-service` tem permissão de escrita no diretório temporário onde os arquivos são gerados.
    *   Verifique se as credenciais da AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) estão corretas e se a IAM Role associada tem permissão de escrita (`s3:PutObject`) no bucket de artefatos.

3.  **Verificar Status do `datahub-service`:**
    *   A consolidação depende do `datahub-service` para registrar os metadados do artefato. Verifique se o `datahub-service` está online e respondendo.
    *   **Comando Exemplo:** `docker compose logs datahub-service | grep "ERROR"`

### 1.3. As notificações (e-mail/webhook) não chegam

**Sintomas:**
*   Ações que deveriam disparar notificações (ex: aprovação de ETP) são concluídas com sucesso, mas o destinatário não recebe o e-mail ou a chamada do webhook.

**Procedimento de Diagnóstico:**

1.  **Verificar Logs do `notification-service`:**
    *   Este é o ponto central para diagnosticar falhas de notificação. Procure por logs de erro.
    *   **Comando Exemplo:** `docker compose logs notification-service | grep "ERROR"`

2.  **Verificar Status do Provedor de E-mail (Amazon SES):**
    *   Acesse o console da AWS e verifique o painel do SES (Simple Email Service).
    *   Procure por bounces, reclamações ou problemas de reputação que possam estar bloqueando a entrega.
    *   Verifique se o e-mail do remetente (`SES_SENDER_EMAIL`) está verificado e autorizado no SES.

3.  **Verificar Logs de Entrega do Webhook:**
    *   O `notification-service` deve logar o status code da resposta do endpoint de webhook.
    *   Se o status code for `4xx` ou `5xx`, o problema está no sistema de destino que deveria receber a notificação. Inspecione os logs do sistema de destino.

---

## 2. Procedimentos Operacionais

### 2.1. Como realizar o re-treinamento do modelo de preços do Mercado.AI

O re-treinamento é um processo manual que envolve a execução de scripts em ordem.

1.  **Executar o Coletor de Dados:**
    *   O `collector-service` é responsável por buscar novos dados de preços. Para acionar uma nova coleta:
    *   ```bash
        docker compose exec collector-service python app/scrapers/pncp_scraper.py
        ```

2.  **Executar o Script de Treinamento:**
    *   O `prediction-service` contém o script para treinar o modelo com os novos dados.
    *   ```bash
        docker compose exec prediction-service python app/ml/trainer.py
        ```
    *   Isso irá gerar um novo artefato de modelo serializado em `backend/prediction-service/app/ml/models/`.

3.  **Reiniciar o `prediction-service`:**
    *   Para que o serviço carregue o novo modelo em memória, ele precisa ser reiniciado.
    *   ```bash
        docker compose restart prediction-service
        ```

### 2.2. Como adicionar um novo template de documento

A adição de templates é feita através de scripts de *seeding* no banco de dados, pois ainda não há uma interface de administração para esta funcionalidade.

1.  **Criar o Arquivo de Template:**
    *   Adicione um novo arquivo `.json` ou `.py` no diretório `backend/planning-service/seeds/` que define a estrutura do novo template.

2.  **Escrever o Script de Seed:**
    *   Crie um script em `backend/planning-service/scripts/` (ex: `seed_new_template.py`) que lê o arquivo de definição e o insere no banco de dados na tabela `templates`.

3.  **Executar o Script:**
    *   ```bash
        docker compose exec planning-service python scripts/seed_new_template.py
        ```
