import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/paginated-response.model';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  customer: any;
  items: any[];
  payments: any[];
  totalGross: number;
  totalDiscount: number;
  netAmount: number;
  balanceDue: number;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoices`;

  getInvoices(page: number, size: number, search?: string, customerId?: number, productId?: number): Observable<PaginatedResponse<Invoice>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search) params = params.set('search', search);
    if (customerId) params = params.set('customerId', customerId.toString());
    if (productId) params = params.set('productId', productId.toString());
    return this.http.get<PaginatedResponse<Invoice>>(this.apiUrl, { params });
  }

  createInvoice(invoiceData: any): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoiceData);
  }

  addPayment(invoiceId: number, paymentData: any): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${invoiceId}/payments`, paymentData);
  }

  downloadPdf(invoiceId: number) {
    // Abrimos el PDF generado por Spring Boot en una nueva pestaña
    window.open(`${this.apiUrl}/${invoiceId}/pdf`, '_blank');
  }
}
