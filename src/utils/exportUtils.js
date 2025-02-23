import { saveAs } from 'file-saver'
import XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportTableToExcel(data, filename) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes')
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, filename)
}

export function exportTableToPDF(data, filename) {
  const doc = new jsPDF()
  doc.autoTable({
    head: [Object.keys(data[0])],
    body: data.map((row) => Object.values(row)),
  })
  doc.save(filename)
}
