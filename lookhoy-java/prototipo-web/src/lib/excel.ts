import type { Garment, SavedOutfit } from "@/types"
import { WARMTH_LABEL } from "@/types"

/*
 * Exportación a Excel (.xlsx) SIN librerías externas: un .xlsx es un ZIP con
 * archivos XML, así que lo armamos a mano (ZIP sin compresión + CRC32).
 * Así no hay que instalar nada nuevo con pnpm/npm.
 */

type Cell = string | number
export interface SheetData {
  name: string
  rows: Cell[][] // la fila 0 son los encabezados
}

/* ---------- ZIP mínimo (método "store") ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(data: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(entries: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder()
  const now = new Date()
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()

  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const e of entries) {
    const name = enc.encode(e.name)
    const size = e.data.length
    const crc = crc32(e.data)

    const local = new Uint8Array(30 + name.length + size)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x0800, true) // nombres en UTF-8
    lv.setUint16(8, 0, true) // sin compresión
    lv.setUint16(10, dosTime, true)
    lv.setUint16(12, dosDate, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, size, true)
    lv.setUint32(22, size, true)
    lv.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(e.data, 30 + name.length)

    const central = new Uint8Array(46 + name.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x0800, true)
    cv.setUint16(12, dosTime, true)
    cv.setUint16(14, dosDate, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, size, true)
    cv.setUint32(24, size, true)
    cv.setUint16(28, name.length, true)
    cv.setUint32(42, offset, true)
    central.set(name, 46)

    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralSize = centrals.reduce((n, c) => n + c.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)

  const out = new Uint8Array(offset + centralSize + end.length)
  let pos = 0
  for (const part of [...locals, ...centrals, end]) {
    out.set(part, pos)
    pos += part.length
  }
  return out
}

/* ---------- XML de la hoja de cálculo ---------- */
const xmlEscape = (s: string) =>
  s
    // caracteres de control que el XML no permite
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** Seguridad: evita inyección de fórmulas (valores que empiezan con = + - @), igual que la versión Java. */
export function sanitize(s: string): string {
  return s.length > 0 && "=+-@".includes(s[0]) ? `'${s}` : s
}

const colLetter = (i: number) => String.fromCharCode(65 + i) // hasta 26 columnas, de sobra aquí

function sheetXml(rows: Cell[][]): string {
  const widths: number[] = []
  rows.forEach((row) =>
    row.forEach((v, c) => {
      widths[c] = Math.max(widths[c] ?? 8, Math.min(60, String(v).length + 3))
    }),
  )
  const cols = widths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join("")

  const body = rows
    .map((row, r) => {
      const cells = row
        .map((v, c) => {
          const ref = `${colLetter(c)}${r + 1}`
          const style = r === 0 ? ' s="1"' : ""
          return typeof v === "number"
            ? `<c r="${ref}"${style}><v>${v}</v></c>`
            : `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(v)}</t></is></c>`
        })
        .join("")
      return `<row r="${r + 1}">${cells}</row>`
    })
    .join("")

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<cols>${cols}</cols><sheetData>${body}</sheetData></worksheet>`
  )
}

const STYLES_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts>` +
  `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFE4E7F7"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`

/** Arma el archivo .xlsx completo (bytes) a partir de una o más hojas. */
export function buildWorkbook(sheets: SheetData[]): Uint8Array {
  const enc = new TextEncoder()
  const xml = (s: string) => enc.encode(s)
  const head = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
  // Excel no permite : \ / ? * [ ] en nombres de hoja y limita a 31 caracteres
  const safeName = (n: string) => xmlEscape(n.replace(/[:\\/?*[\]]/g, " ").slice(0, 31))

  const contentTypes =
    `${head}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    sheets
      .map(
        (_, i) =>
          `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
      )
      .join("") +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`

  const rootRels =
    `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`

  const workbook =
    `${head}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>` +
    sheets.map((s, i) => `<sheet name="${safeName(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") +
    `</sheets></workbook>`

  const workbookRels =
    `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
      )
      .join("") +
    `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`

  return zip([
    { name: "[Content_Types].xml", data: xml(contentTypes) },
    { name: "_rels/.rels", data: xml(rootRels) },
    { name: "xl/workbook.xml", data: xml(workbook) },
    { name: "xl/_rels/workbook.xml.rels", data: xml(workbookRels) },
    { name: "xl/styles.xml", data: xml(STYLES_XML) },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: xml(sheetXml(s.rows)) })),
  ])
}

/* ---------- datos de LookHoy → hojas ---------- */
export function closetSheet(garments: Garment[]): SheetData {
  return {
    name: "Clóset",
    rows: [
      ["N°", "Prenda", "Categoría", "Estilo", "Abrigo", "Favorito"],
      ...garments.map((g, i): Cell[] => [
        i + 1,
        sanitize(g.name),
        g.category,
        g.style,
        WARMTH_LABEL[g.warmth],
        g.favorite ? "Sí" : "No",
      ]),
    ],
  }
}

export function historySheet(saved: SavedOutfit[]): SheetData {
  return {
    name: "Historial",
    rows: [
      ["N°", "Fecha", "Ocasión", "Prendas", "Temperatura (°C)", "Favorito"],
      ...saved.map((s, i): Cell[] => [
        i + 1,
        new Date(s.date).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }),
        sanitize(s.occasion),
        sanitize(s.pieces.map((p) => p.name).join(" · ")),
        s.tempC ?? "Sin dato",
        s.favorite ? "Sí" : "No",
      ]),
    ],
  }
}

/** Descarga lookhoy-YYYY-MM-DD.xlsx con el clóset y el historial. */
export function downloadExcel(garments: Garment[], saved: SavedOutfit[]) {
  const bytes = buildWorkbook([closetSheet(garments), historySheet(saved)])
  const blob = new Blob([bytes as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `lookhoy-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
