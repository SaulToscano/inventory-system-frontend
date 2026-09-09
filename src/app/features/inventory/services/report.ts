import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReportFilterRequest {
  dateFrom?: string | null;
  dateTo?: string | null;
  categoryId?: number | null;
  productId?: number | null;
  supplierId?: number | null;
  customerId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  // Obtiene los datos en formato JSON para la tabla de previsualización
  getReportData(reportType: string, filters: ReportFilterRequest): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/${reportType}`, filters);
  }

  // Obtiene el archivo PDF crudo (Blob) para forzar la descarga en el navegador
  downloadReportPdf(reportType: string, filters: ReportFilterRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/${reportType}/pdf`, filters, {
      responseType: 'blob'
    });
  }
}
