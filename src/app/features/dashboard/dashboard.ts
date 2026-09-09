import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ReportService } from '../inventory/services/report';
import { InvoiceService } from '../inventory/services/invoice';

import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [
    CommonModule, ChartModule, TableModule, ButtonModule, 
    TagModule, SkeletonModule, RouterModule, CurrencyPipe, DatePipe
  ],
})
export class Dashboard implements OnInit {
  private reportService = inject(ReportService);
  private invoiceService = inject(InvoiceService);
  private cdr = inject(ChangeDetectorRef);

  loading: boolean = true;

  // Métricas
  monthlyRevenue: number = 0;
  monthlyProfit: number = 0;
  totalDebt: number = 0;
  lowStockCount: number = 0;

  // Datos para tablas y gráficos
  recentInvoices: any[] = [];
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.initChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Calcular inicio y fin del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthFilters = {
      dateFrom: firstDay.toISOString(),
      dateTo: now.toISOString()
    };

    // Ejecutamos 4 peticiones a la vez usando forkJoin
    forkJoin({
      profitData: this.reportService.getReportData('profit', monthFilters),
      dueData: this.reportService.getReportData('due', {}), // Todo el adeudo histórico
      stockData: this.reportService.getReportData('stock', {}), // Todo el stock
      recentInvoices: this.invoiceService.getInvoices(0, 5) // Últimas 5 facturas
    }).subscribe({
      next: (results) => {
        // 1. Calcular Ingresos y Ganancias del mes
        this.monthlyRevenue = results.profitData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
        this.monthlyProfit = results.profitData.reduce((acc, curr) => acc + (curr.profit || 0), 0);
        
        // 2. Calcular Deuda Total (Cuentas por cobrar)
        this.totalDebt = results.dueData.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);
        
        // 3. Calcular Alertas de Stock (Productos con menos de 10 unidades)
        this.lowStockCount = results.stockData.filter(lote => lote.currentStock < 10).length;

        // 4. Últimas facturas
        this.recentInvoices = results.recentInvoices.content;

        // 5. Armar la Gráfica (Podemos agrupar por los últimos 5 días, pero por simplicidad mostraremos Costo vs Ganancia)
        const totalCost = this.monthlyRevenue - this.monthlyProfit;
        this.setupChart(this.monthlyProfit, totalCost);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando el dashboard', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  setupChart(profit: number, cost: number) {
    this.chartData = {
      labels: ['Resumen del Mes Actual'],
      datasets: [
        {
          label: 'Costo de Mercancía',
          backgroundColor: '#f87171', // Rojo suave
          data: [cost]
        },
        {
          label: 'Ganancia Neta (Profit)',
          backgroundColor: '#4ade80', // Verde suave
          data: [profit]
        }
      ]
    };
  }

  initChartOptions() {
    this.chartOptions = {
      plugins: { legend: { labels: { color: 'var(--text-color)' } } },
      scales: {
        x: {
          ticks: { color: 'var(--text-color-secondary)' },
          grid: { color: 'var(--surface-border)' }
        },
        y: {
          ticks: { color: 'var(--text-color-secondary)' },
          grid: { color: 'var(--surface-border)' }
        }
      }
    };
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' {
    return status === 'PAID' ? 'success' : status === 'PARTIAL_PAID' ? 'warn' : 'danger';
  }
}
