import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { Product, ProductService, Category } from '../services/product';

import { SharedModule, MessageService, ConfirmationService } from 'primeng/api';
import { DataViewModule, DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  providers: [ConfirmationService],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, DataViewModule, ButtonModule, 
    SharedModule, SkeletonModule, SelectModule, InputTextModule,
    DialogModule, ConfirmDialogModule
  ],
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef); 
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  @ViewChild('dv') dataView!: DataView;

  products: Product[] = [];
  categories: Category[] = [];
  layout: 'list' | 'grid' = 'list';

  // Paginación
  totalRecords: number = 0;
  rows: number = 10;
  loading: boolean = true;

  // Filtros
  searchQuery: string = '';
  selectedCategory: number | null = null;
  searchSubject: Subject<string> = new Subject<string>();

  // --- VARIABLES DEL MODAL ---
  displayModal: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;
  saving: boolean = false;

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    details: [''],
    categoryId: [null, Validators.required]
  });

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = [...res];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchQuery = searchValue;
      this.applyFilters();
    });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  applyFilters() {
    if (this.dataView) {
      this.dataView.first = 0;
    }
    this.fetchData(0, this.rows);
  }

  loadData(event: any) {
    const page = event.first / event.rows;
    this.fetchData(page, event.rows);
  }

  private fetchData(page: number, size: number) {
    this.loading = true;
    this.cdr.detectChanges(); 

    this.productService.getProducts(page, size, this.searchQuery, this.selectedCategory).subscribe({
      next: (response) => {
        this.products = [...response.content]; 
        this.totalRecords = response.totalElements;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.productForm.reset();
    this.displayModal = true;
  }

  showEditModal(product: Product) {
    this.isEditing = true;
    this.editingId = product.id;
    this.productForm.patchValue({
      name: product.name,
      details: product.details,
      categoryId: product.category?.id
    });
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
    this.productForm.reset();
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    this.saving = true;
    const data = this.productForm.value;

    if (this.isEditing && this.editingId) {
      this.productService.updateProduct(this.editingId, data).subscribe({
        next: () => this.handleSuccess('Producto actualizado correctamente'),
        error: () => this.handleError('Error al actualizar el producto')
      });
    } else {
      this.productService.createProduct(data).subscribe({
        next: () => this.handleSuccess('Producto creado correctamente'),
        error: () => this.handleError('Error al crear el producto')
      });
    }
  }

  private handleSuccess(message: string) {
    this.saving = false;
    this.hideModal();
    this.fetchData(0, this.rows);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: message });
  }

  private handleError(message: string) {
    this.saving = false;
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  // --- LÓGICA DE ELIMINACIÓN ---
  confirmDelete(product: Product) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar "${product.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.fetchData(0, this.rows);
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Producto eliminado' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }
}
