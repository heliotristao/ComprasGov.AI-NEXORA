import { expect, test } from "@playwright/test"

const SESSION_COOKIE = encodeURIComponent(
  JSON.stringify({
    token: "test-token",
    user: {
      id: "1",
      name: "Gestor Teste",
      email: "gestor@nexora.gov",
      roles: ["GESTOR"],
    },
  })
)

const LIST_ENDPOINT = "**/api/gestao/processos"
const METRICS_ENDPOINT = "**/api/gestao/processos/metrics"
const DETAILS_ENDPOINT = "**/api/gestao/processos/*"

const EDOCS_BASE_URL = (process.env.NEXT_PUBLIC_EDOCS_BASE_URL ?? "https://www.gov.br/compras/edocs").replace(/\/+$/, "")

function buildEdocsUrl(code: string) {
  return `${EDOCS_BASE_URL}/${code}`
}

const ALL_PROCESSES = [
  {
    id: "PROC-001",
    numero_edocs: "ABCD-123456",
    title: "Aquisição de plataforma analítica",
    status: "Pendente",
    status_label: "Pendente",
    type: "Pregão eletrônico",
    responsavel: "Ana Souza",
    unidade: "Diretoria de TI",
    updated_at: "2025-02-10T13:45:00Z",
    url: buildEdocsUrl("ABCD-123456"),
  },
  {
    id: "PROC-002",
    numero_edocs: "WXYZ-654321",
    title: "Contrato de suporte cloud",
    status: "Aprovado",
    status_label: "Aprovado",
    type: "Dispensa",
    responsavel: "Bruno Lima",
    unidade: "Superintendência de Operações",
    updated_at: "2025-02-12T09:15:00Z",
    url: buildEdocsUrl("WXYZ-654321"),
  },
]

const AVAILABLE_FILTERS = {
  status: ["Pendente", "Aprovado", "Rascunho"],
  type: ["Pregão eletrônico", "Dispensa"],
  unit: ["Diretoria de TI", "Superintendência de Operações"],
  responsible: ["Ana Souza", "Bruno Lima"],
}

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "nexora_session",
      value: SESSION_COOKIE,
      path: "/",
      domain: "127.0.0.1",
      httpOnly: false,
      secure: false,
    },
  ])
})

test("renders management dashboard with filters, table and drawer interactions", async ({ page }) => {
  await page.route(METRICS_ENDPOINT, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        activeProcesses: 32,
        pendingProcesses: 12,
        averageSla: 18.4,
        approvalRate: 78.2,
        trend: {
          active: [28, 30, 32],
          pending: [15, 14, 12],
          sla: [22, 20, 18],
          approval: [70, 74, 78],
        },
      }),
    })
  })

  await page.route(LIST_ENDPOINT, async (route) => {
    const url = new URL(route.request().url())
    const statusFilters = url.searchParams.getAll("status")

    const processes = statusFilters.length
      ? ALL_PROCESSES.filter((process) => statusFilters.includes(process.status))
      : ALL_PROCESSES

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        processes,
        meta: {
          total: processes.length,
          page: 1,
          page_size: processes.length,
        },
        filters: AVAILABLE_FILTERS,
      }),
    })
  })

  await page.route(DETAILS_ENDPOINT, async (route) => {
    const url = new URL(route.request().url())
    const segments = url.pathname.split("/").filter(Boolean)
    const processId = segments[segments.length - 1]

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: processId,
        numero_edocs: "ABCD-123456",
        title: "Aquisição de plataforma analítica",
        status: "Pendente",
        status_label: "Em avaliação",
        type: "Pregão eletrônico",
        responsavel: "Ana Souza",
        unidade: "Diretoria de TI",
        updated_at: "2025-02-10T13:45:00Z",
        description: "Processo para contratação de plataforma analítica com monitoramento de KPIs.",
        timeline: [
          {
            id: "evt-1",
            title: "Protocolo",
            date: "2025-02-01T09:30:00Z",
            actor: "Ana Souza",
            description: "Processo cadastrado no sistema e enviado para análise inicial.",
          },
          {
            id: "evt-2",
            title: "Envio para avaliação",
            date: "2025-02-05T16:10:00Z",
            actor: "Bruno Lima",
            status: "Aguardando parecer",
          },
        ],
        documents: [
          {
            id: "doc-1",
            name: "Estudo Técnico Preliminar",
            type: "ETP",
            url: "https://docs.gov.br/etp-2024.pdf",
          },
          {
            id: "doc-2",
            name: "Termo de Referência",
            type: "TR",
            url: "https://docs.gov.br/tr-2024.pdf",
          },
        ],
        related_links: [
          { label: "Painel de indicadores", url: "https://intranet.gov.br/painel" },
        ],
      }),
    })
  })

  await page.goto("/gestao")

  await expect(page.getByText("Núcleo de Gestão de Processos")).toBeVisible()
  await expect(page.getByText("Processos Ativos").first()).toBeVisible()
  await expect(page.getByText("32")).toBeVisible()
  await expect(page.getByText("78.2%")).toBeVisible()

  const edocsLink = page.locator("a", { hasText: "ABCD-123456" })
  await expect(edocsLink).toHaveAttribute("href", buildEdocsUrl("ABCD-123456"))

  await expect(page.getByText("Aquisição de plataforma analítica")).toBeVisible()
  await expect(page.getByText("Ana Souza")).toBeVisible()

  await page.getByText("Aquisição de plataforma analítica").click()

  await expect(page.getByRole("heading", { name: "Aquisição de plataforma analítica" })).toBeVisible()
  await expect(page.getByText("Processo cadastrado no sistema e enviado para análise inicial.")).toBeVisible()
  const downloadButton = page.getByRole("link", { name: "Baixar" }).first()
  await expect(downloadButton).toHaveAttribute("href", "https://docs.gov.br/etp-2024.pdf")

  await page.getByRole("button", { name: "Fechar" }).click()
  await expect(page.getByRole("heading", { name: "Aquisição de plataforma analítica" })).not.toBeVisible()

  const [filterRequest] = await Promise.all([
    page.waitForRequest((request) => request.url().includes("/api/gestao/processos") && request.url().includes("status=Aprovado")),
    page.getByRole("checkbox", { name: "Filtrar por status Aprovado" }).click(),
  ])
  expect(filterRequest.url()).toContain("status=Aprovado")

  await expect(page.getByText("Contrato de suporte cloud")).toBeVisible()
  await expect(page.getByText("Bruno Lima")).toBeVisible()
})
