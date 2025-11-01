import {
  IMPACT_LEVELS,
  PROBABILITY_LEVELS,
  RiskMatrixRisk,
  distributeRisks,
  formatImpactLabel,
  formatProbabilityLabel,
  getSeverityHexColor,
} from "./matrix"

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89
const MARGIN_PT = 32

interface PdfPageImage {
  bytes: Uint8Array
  widthPx: number
  heightPx: number
}

function estimateCanvasHeight(risks: RiskMatrixRisk[]): number {
  const baseHeight = 1200
  const perRisk = 180
  return baseHeight + Math.max(0, risks.length - 4) * perRisk
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(/\s+/)
  let line = ""
  let y = startY

  for (const word of words) {
    const testLine = line.length > 0 ? `${line} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = word
      y += lineHeight
    } else {
      line = testLine
    }
  }

  if (line) {
    ctx.fillText(line, x, y)
    y += lineHeight
  }

  return y
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const clampedRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + clampedRadius, y)
  ctx.lineTo(x + width - clampedRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius)
  ctx.lineTo(x + width, y + height - clampedRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height)
  ctx.lineTo(x + clampedRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius)
  ctx.lineTo(x, y + clampedRadius)
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y)
  ctx.closePath()
}

function renderMatrixCanvas(description: string, risks: RiskMatrixRisk[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const width = 1400
  const height = estimateCanvasHeight(risks)
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Canvas API não disponível no navegador.")
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  const margin = 96
  const headerHeight = 160
  const gridHeight = 560
  const gridWidth = width - margin * 2 - 200
  const gridX = margin + 200
  const gridY = margin + headerHeight
  const cellWidth = gridWidth / IMPACT_LEVELS.length
  const cellHeight = gridHeight / PROBABILITY_LEVELS.length
  const grid = distributeRisks(risks)

  ctx.fillStyle = "#0f172a"
  ctx.font = "700 42px 'Inter', 'Segoe UI', sans-serif"
  ctx.textBaseline = "top"
  ctx.fillText("Matriz de Riscos", margin, margin)

  ctx.font = "500 22px 'Inter', 'Segoe UI', sans-serif"
  const descriptionLabel = "Descrição do Objeto"
  ctx.fillText(descriptionLabel, margin, margin + 64)

  ctx.font = "400 20px 'Inter', 'Segoe UI', sans-serif"
  ctx.fillStyle = "#1f2937"
  wrapCanvasText(ctx, description, margin, margin + 96, width - margin * 2, 28)
  ctx.textBaseline = "alphabetic"

  ctx.save()
  ctx.fillStyle = "#0f172a"
  ctx.font = "700 26px 'Inter', 'Segoe UI', sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("Impacto →", gridX + gridWidth / 2, gridY - 54)
  ctx.restore()

  ctx.save()
  ctx.translate(margin + 64, gridY + gridHeight / 2)
  ctx.rotate((-90 * Math.PI) / 180)
  ctx.textAlign = "center"
  ctx.fillStyle = "#0f172a"
  ctx.font = "700 26px 'Inter', 'Segoe UI', sans-serif"
  ctx.fillText("Probabilidade ↑", 0, 0)
  ctx.restore()

  ctx.font = "600 22px 'Inter', 'Segoe UI', sans-serif"
  ctx.fillStyle = "#0f172a"
  for (let column = 0; column < IMPACT_LEVELS.length; column += 1) {
    const label = IMPACT_LEVELS[column]
    ctx.textAlign = "center"
    ctx.fillText(label, gridX + column * cellWidth + cellWidth / 2, gridY - 24)
  }

  for (let row = 0; row < PROBABILITY_LEVELS.length; row += 1) {
    const label = PROBABILITY_LEVELS[row]
    ctx.textAlign = "right"
    ctx.fillText(label, gridX - 24, gridY + row * cellHeight + cellHeight / 2 - 12)
  }

  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  for (let row = 0; row < PROBABILITY_LEVELS.length; row += 1) {
    for (let column = 0; column < IMPACT_LEVELS.length; column += 1) {
      const cellRisks = grid[row][column]
      const x = gridX + column * cellWidth
      const y = gridY + row * cellHeight
      const hex = getSeverityHexColor(row, column)

      ctx.fillStyle = hex
      drawRoundedRect(ctx, x + 4, y + 4, cellWidth - 8, cellHeight - 8, 18)
      ctx.fill()

      ctx.lineWidth = 2
      ctx.strokeStyle = "#1118271f"
      drawRoundedRect(ctx, x + 4, y + 4, cellWidth - 8, cellHeight - 8, 18)
      ctx.stroke()

      ctx.fillStyle = cellRisks.length > 0 ? "#111827" : "#6b7280"
      ctx.font = cellRisks.length > 0
        ? "700 34px 'Inter', 'Segoe UI', sans-serif"
        : "500 24px 'Inter', 'Segoe UI', sans-serif"
      ctx.fillText(cellRisks.length > 0 ? `${cellRisks.length}` : "—", x + cellWidth / 2, y + cellHeight / 2 - 12)

      if (cellRisks.length > 0) {
        ctx.font = "400 18px 'Inter', 'Segoe UI', sans-serif"
        ctx.fillStyle = "#1f2937"
        ctx.fillText(
          cellRisks.length === 1 ? "risco" : "riscos",
          x + cellWidth / 2,
          y + cellHeight / 2 + 16
        )
      }
    }
  }

  let currentY = gridY + gridHeight + 72
  ctx.textBaseline = "alphabetic"
  ctx.textAlign = "left"
  ctx.fillStyle = "#0f172a"
  ctx.font = "700 32px 'Inter', 'Segoe UI', sans-serif"
  ctx.fillText("Detalhamento dos riscos", margin, currentY)
  currentY += 48

  ctx.font = "400 20px 'Inter', 'Segoe UI', sans-serif"
  ctx.fillStyle = "#1f2937"
  const maxWidth = width - margin * 2

  risks.forEach((risk, index) => {
    ctx.font = "600 22px 'Inter', 'Segoe UI', sans-serif"
    ctx.fillStyle = "#0f172a"
    currentY = wrapCanvasText(ctx, `${index + 1}. ${risk.risk_description}`, margin, currentY, maxWidth, 30)

    ctx.font = "500 18px 'Inter', 'Segoe UI', sans-serif"
    ctx.fillStyle = "#334155"
    const probabilityLabel = formatProbabilityLabel(risk.probability)
    const impactLabel = formatImpactLabel(risk.impact)
    currentY = wrapCanvasText(
      ctx,
      `Probabilidade: ${probabilityLabel}   |   Impacto: ${impactLabel}`,
      margin,
      currentY,
      maxWidth,
      26
    )

    ctx.font = "400 18px 'Inter', 'Segoe UI', sans-serif"
    ctx.fillStyle = "#1f2937"
    currentY = wrapCanvasText(ctx, `Mitigação: ${risk.mitigation_measure}`, margin, currentY, maxWidth, 26)

    currentY += 28
  })

  return canvas
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const length = binary.length
  const bytes = new Uint8Array(length)

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function createPdfStream(image: PdfPageImage): Blob {
  const { bytes, widthPx, heightPx } = image

  const maxWidth = A4_WIDTH_PT - MARGIN_PT * 2
  let renderWidth = maxWidth
  let renderHeight = (heightPx / widthPx) * renderWidth

  if (renderHeight > A4_HEIGHT_PT - MARGIN_PT * 2) {
    renderHeight = A4_HEIGHT_PT - MARGIN_PT * 2
    renderWidth = (widthPx / heightPx) * renderHeight
  }

  const translateX = (A4_WIDTH_PT - renderWidth) / 2
  const translateY = (A4_HEIGHT_PT - renderHeight) / 2

  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  let position = 0
  const offsets: number[] = []

  function append(data: Uint8Array) {
    chunks.push(data)
    position += data.length
  }

  function appendString(value: string) {
    append(encoder.encode(value))
  }

  function beginObject(id: number) {
    offsets[id] = position
    appendString(`${id} 0 obj\n`)
  }

  function endObject() {
    appendString("endobj\n")
  }

  appendString("%PDF-1.3\n")

  beginObject(1)
  appendString("<< /Type /Catalog /Pages 2 0 R >>\n")
  endObject()

  beginObject(2)
  appendString("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n")
  endObject()

  beginObject(3)
  appendString(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH_PT.toFixed(2)} ${A4_HEIGHT_PT.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\n`
  )
  endObject()

  beginObject(4)
  appendString(`<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\n`)
  appendString("stream\n")
  append(bytes)
  appendString("\nendstream\n")
  endObject()

  const contentStream = `q\n${renderWidth.toFixed(2)} 0 0 ${renderHeight.toFixed(2)} ${translateX.toFixed(2)} ${translateY.toFixed(2)} cm\n/Im0 Do\nQ\n`
  const contentBytes = encoder.encode(contentStream)

  beginObject(5)
  appendString(`<< /Length ${contentBytes.length} >>\nstream\n`)
  append(contentBytes)
  appendString("endstream\n")
  endObject()

  const xrefPosition = position
  appendString("xref\n0 6\n")
  appendString("0000000000 65535 f \n")
  for (let id = 1; id <= 5; id += 1) {
    const offset = offsets[id] ?? 0
    appendString(`${offset.toString().padStart(10, "0")} 00000 n \n`)
  }

  appendString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`)

  let totalLength = 0
  for (const chunk of chunks) {
    totalLength += chunk.length
  }

  const output = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }

  return new Blob([output], { type: "application/pdf" })
}

export async function exportRiskMatrixToPdf(options: { description: string; risks: RiskMatrixRisk[] }): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  const { description, risks } = options
  const canvas = renderMatrixCanvas(description, risks)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
  const [, base64] = dataUrl.split(",")

  if (!base64) {
    throw new Error("Falha ao gerar imagem do heatmap para exportação.")
  }

  const pdfBlob = createPdfStream({
    bytes: base64ToUint8Array(base64),
    widthPx: canvas.width,
    heightPx: canvas.height,
  })

  const url = URL.createObjectURL(pdfBlob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "matriz-de-riscos.pdf"
  anchor.click()
  URL.revokeObjectURL(url)
}
