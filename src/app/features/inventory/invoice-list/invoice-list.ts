import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterModule } from '@angular/router';

import { Invoice, InvoiceService } from '../services/invoice';
import { CustomerService } from '../services/customer';
import { ProductService } from '../services/product';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    TableModule, ButtonModule, InputTextModule, SkeletonModule, 
    TagModule, SelectModule, DialogModule, InputNumberModule,
    CurrencyPipe, DatePipe
  ],
})
export class InvoiceList implements OnInit {
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  invoices: Invoice[] = [];
  customers: any[] = [];
  products: any[] = [];
  
  totalRecords: number = 0;
  rows: number = 10;
  loading: boolean = true;

  // Filtros
  searchQuery: string = '';
  selectedCustomerId: number | null = null;
  selectedProductId: number | null = null;
  searchSubject: Subject<string> = new Subject<string>();

  // Modal de Pago
  displayPaymentModal: boolean = false;
  savingPayment: boolean = false;
  selectedInvoice: Invoice | null = null;

  paymentForm: FormGroup = this.fb.group({
    method: ['CASH', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    bankReference: ['']
  });

  ngOnInit() {
    // Llenar catálogos para los filtros
    this.customerService.getCustomers(0, 1000).subscribe(res => {
      this.customers = [...res.content];
      this.cdr.markForCheck();
    });
    this.productService.getProducts(0, 1000).subscribe(res => {
      this.products = [...res.content];
      this.cdr.markForCheck();
    });

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
      this.searchQuery = val;
      this.fetchData(0, this.rows);
    });
  }

  onSearchInput(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  applyFilters() {
    this.fetchData(0, this.rows);
  }

  loadData(event: TableLazyLoadEvent) {
    const page = (event.first || 0) / (event.rows || 10);
    this.rows = event.rows || 10;
    this.fetchData(page, this.rows);
  }

  private fetchData(page: number, size: number) {
    this.loading = true;
    this.cdr.detectChanges();

    const cId = this.selectedCustomerId ?? undefined;
    const pId = this.selectedProductId ?? undefined;

    this.invoiceService.getInvoices(page, size, this.searchQuery, cId, pId).subscribe({
      next: (res) => {
        this.invoices = res.content;
        this.totalRecords = res.totalElements;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // --- ACCIONES DE FACTURA ---

  downloadPdf(invoiceId: number) {
    this.invoiceService.downloadPdf(invoiceId);
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIAL_PAID': return 'warn';
      case 'PENDING': return 'danger';
      default: return 'warn';
    }
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'PAID': return 'Pagado';
      case 'PARTIAL_PAID': return 'Pago Parcial';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  }

  // --- LÓGICA DEL MODAL DE PAGOS ---

  showPaymentModal(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.paymentForm.reset({
      method: 'CASH',
      amount: invoice.balanceDue, // Sugerimos liquidar el saldo total por defecto
      bankReference: ''
    });
    
    // Validamos que no pague más de lo que debe
    this.paymentForm.get('amount')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(invoice.balanceDue)]);
    this.paymentForm.get('amount')?.updateValueAndValidity();
    
    this.displayPaymentModal = true;
  }

  hidePaymentModal() {
    this.displayPaymentModal = false;
    this.selectedInvoice = null;
  }

  savePayment() {
    if (this.paymentForm.invalid || !this.selectedInvoice) return;
    this.savingPayment = true;

    this.invoiceService.addPayment(this.selectedInvoice.id, this.paymentForm.value).subscribe({
      next: () => {
        this.savingPayment = false;
        this.hidePaymentModal();
        this.fetchData(0, this.rows); // Recargamos para actualizar el saldo y el estado
        this.messageService.add({ severity: 'success', summary: 'Abono Registrado', detail: 'El pago se aplicó correctamente a la factura.' });
      },
      error: (err) => {
        this.savingPayment = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo registrar el pago.' });
      }
    });
  }
}
