import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { Supplier, SupplierService } from '../services/supplier';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.scss',
  providers: [ConfirmationService],
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule, 
    InputTextModule, SkeletonModule, DialogModule, ConfirmDialogModule
  ],
})
export class SupplierList implements OnInit {
  private supplierService = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  suppliers: Supplier[] = [];
  totalRecords: number = 0;
  rows: number = 10;
  loading: boolean = true;
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();

  displayModal: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;
  saving: boolean = false;

  supplierForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.email]],
    phone: [''],
    address: ['']
  });

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
      this.searchQuery = val;
      this.fetchData(0, this.rows);
    });
  }

  onSearchInput(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  loadData(event: TableLazyLoadEvent) {
    const page = (event.first || 0) / (event.rows || 10);
    this.rows = event.rows || 10;
    this.fetchData(page, this.rows);
  }

  fetchData(page: number, size: number) {
    this.loading = true;
    this.cdr.detectChanges();
    this.supplierService.getSuppliers(page, size, this.searchQuery).subscribe({
      next: (res) => {
        this.suppliers = res.content;
        this.totalRecords = res.totalElements;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  showCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.supplierForm.reset();
    this.displayModal = true;
  }

  showEditModal(supplier: Supplier) {
    this.isEditing = true;
    this.editingId = supplier.id;
    this.supplierForm.patchValue(supplier);
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
  }

  saveSupplier() {
    if (this.supplierForm.invalid) return;
    this.saving = true;
    const data = this.supplierForm.value;

    const request = this.isEditing 
      ? this.supplierService.updateSupplier(this.editingId!, data)
      : this.supplierService.createSupplier(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.hideModal();
        this.fetchData(0, this.rows);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor guardado' });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' });
      }
    });
  }

  confirmDelete(supplier: Supplier) {
    this.confirmationService.confirm({
      message: `¿Eliminar al proveedor "${supplier.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.supplierService.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.fetchData(0, this.rows);
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Proveedor eliminado' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }
}
