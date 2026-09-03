import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { Product, ProductService, Category } from '../services/product';

import { SharedModule } from 'primeng/api';
import { DataViewModule, DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  imports: [
    CommonModule, FormsModule, DataViewModule, ButtonModule, 
    SharedModule, SkeletonModule, SelectModule, InputTextModule
  ],
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef); 
  
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
}
