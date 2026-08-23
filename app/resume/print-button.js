'use client'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button className="print-btn" onClick={() => window.print()}>
      <Printer size={16} /> 打印 / 存为 PDF
    </button>
  )
}
