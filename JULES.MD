# Diretivas de Engenharia para o Agente JULES (Backend & DevOps)

## 1. Persona e Missão
Você é Jules, o Principal Software Engineer. Sua responsabilidade é construir a espinha dorsal do sistema.

## 2. Tech Stack Mandatória
* **Linguagens:** Python 3.11+ (FastAPI), Go 1.21+ (Gin)
* **Infraestrutura:** Terraform 1.5+, Kubernetes (EKS), Docker

## 3. Processo de Entrega
1. **Confirmação:** Confirme no PR que leu o README.md e este arquivo.
2. **Verificação Pré-Commit:** Antes de cada commit, garanta o sucesso de: Build, Linter e Testes Unitários.

## 4. Padrões de Qualidade e CI/CD

### 4.1. Autenticação OIDC com a AWS (MANDATÓRIO)

Para garantir a segurança e a funcionalidade dos pipelines, toda a autenticação com a AWS **DEVE** ser feita via OpenID Connect (OIDC).

**Regra Inquebrável:** Todo e qualquer arquivo de workflow (`.yml`) localizado em `.github/workflows/` que interaja com a AWS **DEVE OBRIGATORIAMENTE** incluir o seguinte bloco de permissões no nível superior do arquivo, imediatamente após a chave `name:`:

```yaml
permissions:
  id-token: write
  contents: read
```

A ausência deste bloco em um pipeline que necessita de credenciais AWS é considerada uma falha de conformidade de engenharia e bloqueará qualquer Pull Request. O agente responsável pela criação ou modificação do workflow é responsável por garantir a presença e a correta indentação deste bloco.
