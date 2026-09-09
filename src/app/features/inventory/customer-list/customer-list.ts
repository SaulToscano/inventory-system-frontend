import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { Customer, CustomerService } from '../services/customer';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
  providers: [ConfirmationService],
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule, 
    InputTextModule, SkeletonModule, DialogModule, ConfirmDialogModule
  ],
})
export class CustomerList implements OnInit {
  private customerService = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  customers: Customer[] = [];
  totalRecords: number = 0;
  rows: number = 10;
  loading: boolean = true;
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();

  displayModal: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;
  saving: boolean = false;

  // Formulario: name y email son requeridos por tu backend
  customerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], 
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
    this.customerService.getCustomers(page, size, this.searchQuery).subscribe({
      next: (res) => {
        this.customers = res.content;
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
    this.customerForm.reset();
    this.displayModal = true;
  }

  showEditModal(customer: Customer) {
    this.isEditing = true;
    this.editingId = customer.id;
    this.customerForm.patchValue(customer);
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
  }

  saveCustomer() {
    if (this.customerForm.invalid) return;
    this.saving = true;
    const data = this.customerForm.value;

    const request = this.isEditing 
      ? this.customerService.updateCustomer(this.editingId!, data)
      : this.customerService.createCustomer(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.hideModal();
        this.fetchData(0, this.rows);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente guardado' });
      },
      error: (err) => {
        this.saving = false;
        // Mostramos el mensaje de error que viene de tu backend (ej: "Ya existe un cliente con ese correo")
        const errorMsg = err.error?.message || 'No se pudo guardar el cliente';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
      }
    });
  }

  confirmDelete(customer: Customer) {
    this.confirmationService.confirm({
      message: `¿Eliminar al cliente "${customer.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.fetchData(0, this.rows);
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Cliente eliminado' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }
}
