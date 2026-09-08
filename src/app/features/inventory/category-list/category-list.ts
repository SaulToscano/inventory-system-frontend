import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- IMPORTANTE

import { Category, CategoryService } from '../services/category';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, 
    ButtonModule, InputTextModule, SkeletonModule, DialogModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
})
export class CategoryList implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  totalRecords: number = 0;
  rows: number = 10;
  loading: boolean = true;
  
  searchQuery: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  skeletonRows = Array.from({ length: 5 }); 

  displayModal: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;
  saving: boolean = false;

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchQuery = searchValue;
      this.fetchData(0, this.rows);
    });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  loadData(event: TableLazyLoadEvent) {
    const page = (event.first || 0) / (event.rows || 10);
    this.rows = event.rows || 10;
    this.fetchData(page, this.rows);
  }

  private fetchData(page: number, size: number) {
    this.loading = true;
    this.cdr.detectChanges();

    this.categoryService.getCategories(page, size, this.searchQuery).subscribe({
      next: (response) => {
        this.categories = [...response.content];
        this.totalRecords = response.totalElements;
        this.loading = false;
        //this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.loading = false;
        //this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    });
  }

  showCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.categoryForm.reset();
    this.displayModal = true;
  }

  showEditModal(category: Category) {
    this.isEditing = true;
    this.editingId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
    this.categoryForm.reset();
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    this.saving = true;
    const categoryData = this.categoryForm.value;

    if (this.isEditing && this.editingId) {
      // Actualizar
      this.categoryService.updateCategory(this.editingId, categoryData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      // Crear
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess() {
    this.saving = false;
    this.hideModal();
    this.fetchData(0, this.rows); // Recargar la tabla
  }

  private handleError(err: any) {
    console.error('Error guardando categoría', err);
    this.saving = false;
  }

  confirmDelete(category: Category) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger', // Botón rojo
      accept: () => {
        // Lógica si el usuario hace clic en "Sí"
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            // Recargamos la tabla (volviendo a la página 0)
            this.fetchData(0, this.rows);
          },
          error: (err) => {
            // NOTA: Aquí podría dar error si la categoría tiene productos vinculados
            console.error('Error al eliminar la categoría', err);
          }
        });
      }
    });
  }
}
