import { expect, test } from "@playwright/test"

const API_BASE = "**/api/etp"
const TEST_ETP_ID = "123"

function buildEtpUrl(path: string) {
  return `${API_BASE}/${TEST_ETP_ID}${path}`
}

test.describe("ETP wizard", () => {
  test("guides user through steps with autosave, AI generation and validation", async ({ page }) => {
    await page.route(API_BASE, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: TEST_ETP_ID }),
        })
        return
      }

      route.fallback()
    })

    await page.route(buildEtpUrl(""), async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: TEST_ETP_ID,
            step: 1,
            data: {},
            updatedAt: "2025-01-01T12:00:00Z",
          }),
        })
        return
      }

      route.fallback()
    })

    await page.route(buildEtpUrl("/autosave"), async (route) => {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: TEST_ETP_ID,
          step: body?.step ?? 1,
          data: body?.data ?? {},
          updatedAt: "2025-01-01T12:05:00Z",
        }),
      })
    })

    await page.route("**/api/etp/123/generate/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content:
            "A demanda atual compromete a continuidade dos serviços e exige aquisição imediata com ganhos operacionais comprovados.",
        }),
      })
    })

    await page.route(buildEtpUrl("/validate"), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          errors: ["Inclua o parecer jurídico antes da consolidação final."],
          warnings: ["Detalhe métricas de acompanhamento no cronograma."],
          infos: ["Considere anexar análise de riscos qualitativa."],
        }),
      })
    })

    await page.goto("/wizard/etp")

    await expect(page.getByRole("heading", { name: "Estudo Técnico Preliminar" })).toBeVisible()

    await page.getByLabel("Unidade requisitante").fill("Diretoria de TI")
    await page.getByLabel("Número E-Docs").fill("2025-000001")
    await page.getByLabel("Título do processo").fill("Aquisição de estações de trabalho")

    const autosavePromise = page.waitForRequest(buildEtpUrl("/autosave"))
    await page.getByLabel("Resumo executivo").fill(
      "Resumo inicial descrevendo objetivos estratégicos para modernizar a infraestrutura."
    )
    await autosavePromise

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByRole("button", { name: "Gerar com IA" }).first().click()

    await expect(page.getByRole("heading", { name: "Sugestão da IA" })).toBeVisible()
    await page.getByRole("button", { name: "Inserir" }).click()

    await page.getByLabel("Objetivos do projeto").fill(
      "Garantir a continuidade dos serviços essenciais e atender ao plano diretor de tecnologia."
    )
    await page.getByLabel("Fundamentação legal").fill(
      "Lei 14.133/2021, art. 18, inciso II, combinado com o Decreto 11.246/2022."
    )

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByLabel("Alternativas avaliadas").fill(
      "Locação de equipamentos, aquisição direta e parceria público-privada foram comparadas quanto a custo e prazo."
    )
    await page.getByLabel("Solução recomendada").fill(
      "Aquisição direta com garantia estendida por 36 meses, garantindo suporte e atualização tecnológica."
    )
    await page.getByLabel("Benefícios esperados").fill(
      "Melhora da produtividade das equipes e redução de 25% em chamados críticos."
    )

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByLabel("Análise de mercado").fill(
      "Pesquisa realizada com três fornecedores homologados, considerando preços do PNCP e contratos vigentes."
    )
    await page.getByLabel("Estimativa de investimento (R$)").fill("150000")
    await page.getByLabel("Cronograma previsto").fill(
      "Planejamento em janeiro, contratação em março e implantação concluída até junho."
    )
    await page.getByLabel("Riscos e mitigação").fill(
      "Risco de atraso na entrega mitigado com cláusulas contratuais e plano de contingência."
    )

    await page.getByRole("button", { name: "Avançar" }).click()

    await page.getByRole("button", { name: "Validar" }).click()

    await expect(page.getByText("Itens críticos que impedem o avanço do documento.")).toBeVisible()
    await expect(page.getByText("Inclua o parecer jurídico antes da consolidação final.")).toBeVisible()
    await expect(page.getByText("Detalhe métricas de acompanhamento no cronograma.")).toBeVisible()
    await expect(page.getByText("Considere anexar análise de riscos qualitativa.")).toBeVisible()

  })
})
