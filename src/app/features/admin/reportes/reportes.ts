import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportesAdminService } from '../../../core/admin/reportes-admin.service';
import { Button } from '../../../shared/ui/button/button';

const VIOLETA: [number, number, number] = [83, 33, 94];
const ROSA: [number, number, number] = [247, 191, 190];

async function cargarImagenBase64(url: string): Promise<string> {
  const respuesta = await fetch(url);
  const blob = await respuesta.blob();
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(blob);
  });
}

import { PageHeader } from '../../../shared/ui/page-header/page-header';
@Component({
  selector: 'app-admin-reportes',
  imports: [ReactiveFormsModule, Button, PageHeader],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class ReportesAdmin {
  private reportesSvc = inject(ReportesAdminService);
  private fb = inject(FormBuilder);

  generando = signal(false);

  form = this.fb.nonNullable.group({
    desde: [this.hace30Dias(), Validators.required],
    hasta: [this.hoy(), Validators.required],
  });

  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private hace30Dias(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }

  async generarReporte() {
    if (this.form.invalid) return;
    this.generando.set(true);
    try {
      const { desde, hasta } = this.form.getRawValue();
      const datos = await this.reportesSvc.generar(desde, hasta);
      const doc = new jsPDF();

      try {
        const logo = await cargarImagenBase64('brand/logo-mark.png');
        doc.addImage(logo, 'PNG', 14, 10, 20, 20);
      } catch {
        /* si no carga el logo, el reporte igual se genera sin él */
      }

      doc.setTextColor(...VIOLETA);
      doc.setFontSize(18);
      doc.text('La Cerda — Reporte de ventas y stock', 38, 20);
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Periodo: ${datos.desde} a ${datos.hasta}`, 38, 27);

      let y = 40;
      doc.setTextColor(...VIOLETA);
      doc.setFontSize(13);
      doc.text('Resumen del periodo', 14, y);
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      y += 7;
      doc.text(`Total vendido: Bs ${datos.totalVendido.toFixed(2)}`, 14, y);
      y += 6;
      doc.text(`Número de pedidos: ${datos.numeroPedidos}`, 14, y);
      y += 6;
      doc.text(
        `Producto más vendido: ${datos.masVendido ? `${datos.masVendido.nombre} (${datos.masVendido.cantidad} u.)` : '—'}`,
        14,
        y,
      );
      y += 6;
      doc.text(
        `Producto menos vendido: ${datos.menosVendido ? `${datos.menosVendido.nombre} (${datos.menosVendido.cantidad} u.)` : '—'}`,
        14,
        y,
      );
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Producto', 'Cantidad vendida', 'Subtotal (Bs)']],
        body: datos.ventasPorProducto.map((v) => [
          v.nombre,
          v.cantidad.toString(),
          v.subtotal.toFixed(2),
        ]),
        headStyles: { fillColor: VIOLETA },
        alternateRowStyles: { fillColor: [253, 241, 240] },
        styles: { fontSize: 9 },
      });

      const y2 =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
      doc.setFontSize(13);
      doc.setTextColor(...VIOLETA);
      doc.text('Stock actual por producto', 14, y2);

      autoTable(doc, {
        startY: y2 + 4,
        head: [['Categoría', 'Producto', 'Disponible']],
        body: datos.stockPorCategoria.map((s) => [s.categoria, s.producto, s.cantidad.toString()]),
        headStyles: { fillColor: ROSA, textColor: VIOLETA },
        styles: { fontSize: 9 },
      });

      doc.save(`la-cerda-reporte-${datos.desde}-a-${datos.hasta}.pdf`);
    } finally {
      this.generando.set(false);
    }
  }
}
