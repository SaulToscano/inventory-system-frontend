import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { StockEntry, StockEntryService } from '../services/stock-entry';
import { Product, ProductService } from '../services/product';
import { Supplier, SupplierService } from '../services/supplier';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stock-entry-list',
  standalone: true,
  templateUrl: './stock-entry-list.html',
  styleUrl: './stock-entry-list.scss',
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule, 
    InputTextModule, SkeletonModule, TagModule, CurrencyPipe, DatePipe,
    DialogModule, SelectModule, InputNumberModule, FormsModule
  ],
})
export class StockEntryList implements OnInit {
  private stockEntryService = inject(StockEntryService);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  entries: StockEntry[] = [];
  products: Product[] = [];
  suppliers: Supplier[] = [];
  
  totalRecords: number = 0;
  rows: number = 10;
  loading: boolean = true;
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();

  selectedProductId: number | null = null;
  selectedSupplierId: number | null = null;

  // Variables del Modal
  displayModal: boolean = false;
  saving: boolean = false;
  selectedFile: File | null = null;

  entryForm: FormGroup = this.fb.group({
    productId: [null, Validators.required],
    supplierId: [null, Validators.required],
    initialStock: [1, [Validators.required, Validators.min(1)]],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    // 1. Cargar productos de forma segura
    this.productService.getProducts(0, 1000).subscribe({
      next: (res) => {
        this.products = [...res.content];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando productos', err)
    });

    // 2. Cargar proveedores de forma segura
    this.supplierService.getSuppliers(0, 1000).subscribe({
      next: (res) => {
        this.suppliers = [...res.content];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando proveedores', err)
    });

    // 3. Configurar el buscador
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchQuery = searchValue;
      this.fetchData(0, this.rows);
    });
  }

  applyFilters() {
    // Al cambiar un filtro, regresamos a la página 0
    this.fetchData(0, this.rows);
  }

  onSearchInput(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  loadData(event: TableLazyLoadEvent) {
    const page = (event.first || 0) / (event.rows || 10);
    this.rows = event.rows || 10;
    this.fetchData(page, this.rows);
  }

  private fetchData(page: number, size: number) {
    this.loading = true;
    this.cdr.detectChanges();

    const pId = this.selectedProductId ?? undefined;
    const sId = this.selectedSupplierId ?? undefined;

    this.stockEntryService.getStockEntries(page, size, this.searchQuery, pId, sId).subscribe({
      next: (response) => {
        this.entries = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // --- LÓGICA DEL MODAL ---
  showCreateModal() {
    this.entryForm.reset({ initialStock: 1, purchasePrice: 0, salePrice: 0 });
    this.selectedFile = null;
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveEntry() {
    if (this.entryForm.invalid) return;
    this.saving = true;

    // 1. Preparamos el DTO exacto que espera Spring Boot
    const requestData = {
      productId: this.entryForm.value.productId,
      supplierId: this.entryForm.value.supplierId,
      initialStock: this.entryForm.value.initialStock,
      currentStock: this.entryForm.value.initialStock, // Al inicio, el stock actual es el inicial
      purchasePrice: this.entryForm.value.purchasePrice,
      salePrice: this.entryForm.value.salePrice,
      enteredBy: 'Admin' // TODO: Cambiar por el email/nombre del usuario logueado en Supabase
    };

    // 2. Construimos el FormData (Multipart)
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // 3. Enviamos al backend
    this.stockEntryService.createStockEntry(formData).subscribe({
      next: () => {
        this.saving = false;
        this.hideModal();
        this.fetchData(0, this.rows);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrada registrada' });
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar la entrada' });
      }
    });
  }
}
