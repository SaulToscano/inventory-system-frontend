import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/paginated-response.model';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  details: string;
  category: Category;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getProducts(page: number, size: number, search?: string, categoryId?: number | null): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search); // Asegúrate de que tu Spring Boot acepte @RequestParam("search")
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<PaginatedResponse<Category>>(`${environment.apiUrl}/categories`)
      .pipe(
        map(response => response.content)
      );
  }
}
