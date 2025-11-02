import { expect, test } from "@playwright/test"

const API_BASE = "**/api/tr"

function buildTrUrl(id: string, path = "") {
  return `${API_BASE}/${id}${path}`
}

function deepMerge(target: any, patch: any): any {
  if (typeof patch !== "object" || patch === null) {
    return target
  }

  const output = Array.isArray(target) ? [...target] : { ...target }
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMerge(target?.[key] ?? {}, value)
    } else {
      output[key] = value
    }
  }
  return output
}

test.describe("TR wizard", () => {
  test("supports fluxo de bens com autosave, IA e validação", async ({ page }) => {
    const documentId = "tr-bens-001"
    let storedData: Record<string, unknown> = { tipo: "bens" }

    await page.route(API_BASE, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: documentId }),
        })
        return
      }
      route.fallback()
    })

    await page.route(buildTrUrl(documentId), async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: documentId,
            tipo: "bens",
            step: 1,
            data: storedData,
            updatedAt: "2025-01-01T12:00:00Z",
          }),
        })
        return
      }
      route.fallback()
    })

    await page.route(buildTrUrl(documentId, "/autosave"), async (route) => {
      const body = (await route.request().postDataJSON()) as { step?: number; data?: Record<string, unknown> }
      if (body?.data) {
        storedData = deepMerge(storedData, body.data)
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: documentId,
          tipo: "bens",
          step: body?.step ?? 1,
          data: storedData,
          updatedAt: "2025-01-01T12:05:00Z",
        }),
      })
    })

    await page.route(`**/api/tr/${documentId}/generate/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "Conteúdo gerado automaticamente pela IA para apoiar a redação do TR.",
        }),
      })
    })

    await page.route(buildTrUrl(documentId, "/validate"), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          errors: ["Informe a estratégia de manutenção preventiva dos equipamentos."],
          warnings: ["Considere detalhar mais o cronograma de entregas."],
          infos: ["Adicione anexos com especificações técnicas do órgão."],
        }),
      })
    })

    await page.goto("/wizard/tr?tipo=bens")

    await expect(page.getByRole("heading", { name: "Termo de Referência" })).toBeVisible()

    await page.getByLabel("Código E-Docs").fill("2025-000123")
    await page.getByLabel("Objeto da contratação").fill("Aquisição de notebooks corporativos")

    const autosavePromise = page.waitForRequest(buildTrUrl(documentId, "/autosave"))
    await page.getByLabel("Justificativa da necessidade").fill(
      "Atualização do parque computacional para garantir produtividade e segurança da informação.",
    )
    await autosavePromise

    await page.getByLabel("Setor requisitante").fill("Diretoria de Tecnologia da Informação")

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByRole("button", { name: "Gerar com IA" }).first().click()
    await expect(page.getByRole("heading", { name: "Sugestão da IA" })).toBeVisible()
    await page.getByRole("button", { name: "Inserir" }).click()

    await page.getByLabel("Requisitos mínimos").fill(
      "Processador de última geração, 16GB de RAM, SSD de 512GB e certificação Energy Star.",
    )
    await page.getByLabel("Normas e referências").fill("ABNT NBR ISO/IEC 19752, Decreto 10.947/2022.")

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByLabel("Quantidade total estimada").fill("50")
    await page.getByLabel("Unidade de medida").fill("Unidade")
    await page.getByLabel("Justificativa da quantidade").fill(
      "Baseada na expansão de equipes e na substituição de equipamentos obsoletos.",
    )
    await page.getByLabel("Cronograma de entrega").fill("Entrega em dois lotes mensais a partir de fevereiro/2026.")

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByLabel("Tipo de garantia").fill("Garantia on-site de 36 meses com atendimento em até 24h.")
    await page.getByLabel("Prazo de garantia").fill("36 meses contados da assinatura do termo de recebimento definitivo.")
    await page.getByLabel("Assistência técnica").fill(
      "Atendimento nacional com peça original, suporte remoto e substituição preventiva quando necessário.",
    )

    await page.getByRole("button", { name: "Validar" }).click()
    await expect(page.getByText("Informe a estratégia de manutenção preventiva dos equipamentos.")).toBeVisible()
    await expect(page.getByText("Considere detalhar mais o cronograma de entregas.")).toBeVisible()
    await expect(page.getByText("Adicione anexos com especificações técnicas do órgão.")).toBeVisible()

    await page.reload()

    await expect(page.getByLabel("Objeto da contratação")).toHaveValue("Aquisição de notebooks corporativos")
  })

  test("suporta fluxo de serviços com geração de IA e retomada", async ({ page }) => {
    const documentId = "tr-serv-002"
    let storedData: Record<string, unknown> = { tipo: "servicos" }

    await page.route(API_BASE, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: documentId }),
        })
        return
      }
      route.fallback()
    })

    await page.route(buildTrUrl(documentId), async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: documentId,
            tipo: "servicos",
            step: 1,
            data: storedData,
            updatedAt: "2025-02-01T09:00:00Z",
          }),
        })
        return
      }
      route.fallback()
    })

    await page.route(buildTrUrl(documentId, "/autosave"), async (route) => {
      const body = (await route.request().postDataJSON()) as { step?: number; data?: Record<string, unknown> }
      if (body?.data) {
        storedData = deepMerge(storedData, body.data)
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: documentId,
          tipo: "servicos",
          step: body?.step ?? 1,
          data: storedData,
          updatedAt: "2025-02-01T09:05:00Z",
        }),
      })
    })

    await page.route(`**/api/tr/${documentId}/generate/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "Plano de ação sugerido para estruturar o serviço com foco em resultados.",
        }),
      })
    })

    await page.route(buildTrUrl(documentId, "/validate"), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ errors: [], warnings: [], infos: [] }),
      })
    })

    await page.goto("/wizard/tr?tipo=servicos")

    await page.getByLabel("Descrição do serviço").fill(
      "Serviço de suporte técnico especializado para sistemas corporativos críticos.",
    )
    await page.getByLabel("Objetivos estratégicos").fill(
      "Garantir alta disponibilidade das aplicações de negócio e reduzir incidentes críticos.",
    )

    const autosavePromise = page.waitForRequest(buildTrUrl(documentId, "/autosave"))
    await page.getByLabel("Requisitos técnicos").fill(
      "Equipe certificada ITIL, plantão 24x7 e monitoramento proativo das transações.",
    )
    await autosavePromise

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByLabel("Quantidade de profissionais").fill("8")
    await page.getByLabel("Carga horária prevista").fill("Cobertura integral com turnos de 12x36 e reserva técnica.")
    await page.getByLabel("Critérios de alocação").fill(
      "Distribuição por criticidade dos sistemas, com especialistas escalados conforme demanda.",
    )

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByRole("button", { name: "Gerar com IA" }).first().click()
    await page.getByRole("button", { name: "Inserir" }).click()

    await page.getByRole("button", { name: "Validar" }).click()
    await expect(page.getByText("Nenhum erro identificado nesta validação.")).toBeVisible()

    await page.reload()

    await expect(page.getByLabel("Requisitos técnicos")).toHaveValue(
      "Equipe certificada ITIL, plantão 24x7 e monitoramento proativo das transações.",
    )
  })
})
