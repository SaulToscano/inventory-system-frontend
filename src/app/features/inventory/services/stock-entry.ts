import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/paginated-response.model';
import { Product } from './product';

export interface Supplier {
  id: number;
  name: string;
}

export interface StockEntry {
  id: number;
  product: Product;
  supplier: Supplier;
  receiptUrl?: string;
  initialStock: number;
  currentStock: number;
  purchasePrice: number;
  salePrice: number;
  enteredBy: string;
  entryDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class StockEntryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stock-entries`;

  // Obtener historial paginado con filtros
  getStockEntries(page: number, size: number, search?: string, productId?: number, supplierId?: number): Observable<PaginatedResponse<StockEntry>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (productId) params = params.set('productId', productId.toString());
    if (supplierId) params = params.set('supplierId', supplierId.toString());

    return this.http.get<PaginatedResponse<StockEntry>>(this.apiUrl, { params });
  }

  // Preparado para cuando hagamos el modal (soporta FormData para el archivo)
  createStockEntry(formData: FormData): Observable<StockEntry> {
    return this.http.post<StockEntry>(this.apiUrl, formData);
  }
}
