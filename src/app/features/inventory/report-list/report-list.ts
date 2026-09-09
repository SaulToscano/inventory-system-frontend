import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService, ReportFilterRequest } from '../services/report';
import { CategoryService } from '../services/category';
import { ProductService } from '../services/product';
import { SupplierService } from '../services/supplier';
import { CustomerService } from '../services/customer';

import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-report-list',
  standalone: true,
  templateUrl: './report-list.html',
  styleUrl: './report-list.scss',
  imports: [
    CommonModule, FormsModule, SelectModule, DatePickerModule, 
    ButtonModule, TableModule, CurrencyPipe, DatePipe
  ],
})
export class ReportList implements OnInit {
  private reportService = inject(ReportService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private customerService = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  // Tipos de Reporte
  reportTypes = [
    { label: 'Ventas Detalladas', value: 'sells' },
    { label: 'Ganancias Netas (Profit)', value: 'profit' },
    { label: 'Cuentas por Cobrar (Deudores)', value: 'due' },
    { label: 'Resumen de Facturación', value: 'invoices' },
    { label: 'Existencias (Stock Lotes)', value: 'stock' }
  ];

  // Estado del formulario
  selectedReportType: string = 'sells';
  dateRange: Date[] | null = null;
  selectedCategoryId: number | null = null;
  selectedProductId: number | null = null;
  selectedSupplierId: number | null = null;
  selectedCustomerId: number | null = null;

  // Catálogos
  categories: any[] = [];
  products: any[] = [];
  suppliers: any[] = [];
  customers: any[] = [];

  // Datos de la tabla
  reportData: any[] = [];
  loadingData: boolean = false;
  downloadingPdf: boolean = false;

  ngOnInit() {
    this.loadCatalogs();
  }

  loadCatalogs() {
    this.categoryService.getCategories(0, 1000).subscribe(res => this.categories = res.content);
    this.productService.getProducts(0, 1000).subscribe(res => this.products = res.content);
    this.supplierService.getSuppliers(0, 1000).subscribe(res => this.suppliers = res.content);
    this.customerService.getCustomers(0, 1000).subscribe(res => this.customers = res.content);
  }

  // Muestra u oculta filtros según el reporte seleccionado para no confundir al usuario
  showFilter(filterName: string): boolean {
    const type = this.selectedReportType;
    if (filterName === 'category' || filterName === 'product') {
      return ['sells', 'stock', 'profit'].includes(type);
    }
    if (filterName === 'supplier') {
      return type === 'stock';
    }
    if (filterName === 'customer') {
      return ['sells', 'profit', 'due', 'invoices'].includes(type);
    }
    return true;
  }

  // Prepara el payload convirtiendo las fechas al formato LocalDateTime
  private buildFilters(): ReportFilterRequest {
    let dateFrom = null;
    let dateTo = null;

    if (this.dateRange && this.dateRange.length > 0) {
      if (this.dateRange[0]) {
        dateFrom = new Date(this.dateRange[0]);
        dateFrom.setHours(0, 0, 0, 0); // Inicio del día
      }
      if (this.dateRange[1]) {
        dateTo = new Date(this.dateRange[1]);
        dateTo.setHours(23, 59, 59, 999); // Fin del día
      } else if (this.dateRange[0]) {
        // Si seleccionó un solo día en el rango, usamos ese mismo día como fin
        dateTo = new Date(this.dateRange[0]);
        dateTo.setHours(23, 59, 59, 999);
      }
    }

    return {
      dateFrom: dateFrom ? dateFrom.toISOString() : null,
      dateTo: dateTo ? dateTo.toISOString() : null,
      categoryId: this.showFilter('category') ? this.selectedCategoryId : null,
      productId: this.showFilter('product') ? this.selectedProductId : null,
      supplierId: this.showFilter('supplier') ? this.selectedSupplierId : null,
      customerId: this.showFilter('customer') ? this.selectedCustomerId : null,
    };
  }

  previewData() {
    this.loadingData = true;
    this.reportData = [];
    this.cdr.detectChanges();

    const filters = this.buildFilters();

    this.reportService.getReportData(this.selectedReportType, filters).subscribe({
      next: (data) => {
        this.reportData = data;
        this.loadingData = false;
        if (data.length === 0) {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No hay datos para estos filtros.' });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingData = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte.' });
        this.cdr.markForCheck();
      }
    });
  }

  downloadPdf() {
    this.downloadingPdf = true;
    const filters = this.buildFilters();

    this.reportService.downloadReportPdf(this.selectedReportType, filters).subscribe({
      next: (blob) => {
        // Crear una URL temporal para forzar la descarga del PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${this.selectedReportType}_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.downloadingPdf = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.downloadingPdf = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el PDF.' });
        this.cdr.markForCheck();
      }
    });
  }

  // Método helper para recalcular totales en el frontend y mostrarlos abajo
  calculateTotal(field: string): number {
    return this.reportData.reduce((acc, curr) => acc + (curr[field] || 0), 0);
  }
}
