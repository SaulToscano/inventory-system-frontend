import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InvoiceService } from '../services/invoice';
import { CustomerService } from '../services/customer';
import { CategoryService } from '../services/category';
import { ProductService } from '../services/product';
import { StockEntryService } from '../services/stock-entry';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker'; // O CalendarModule dependiendo de tu versión
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.scss',
  providers: [ConfirmationService],
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, 
    SelectModule, InputNumberModule, DatePickerModule, ConfirmDialogModule, TableModule
  ],
})
export class InvoiceCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private stockService = inject(StockEntryService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  customers: any[] = [];
  categories: any[] = [];
  productsByRow: { [rowIndex: number]: any[] } = {};
  lotsByRow: { [rowIndex: number]: any[] } = {};

  saving: boolean = false;
  
  // Totales globales
  totalGross: number = 0;
  totalDiscount: number = 0;
  netAmount: number = 0;

  invoiceForm: FormGroup = this.fb.group({
    customerId: [null, Validators.required],
    issueDate: [new Date(), Validators.required],
    items: this.fb.array([]),
    makePayment: [false], // Checkbox o switch para pagar ahora
    paymentMethod: ['CASH'],
    paymentAmount: [0],
    bankReference: ['']
  });

  get itemsFormArray() {
    return this.invoiceForm.get('items') as FormArray;
  }

  ngOnInit() {
    // Cargar catálogos base
    this.customerService.getCustomers(0, 1000).subscribe(res => this.customers = res.content);
    this.categoryService.getCategories(0, 1000).subscribe(res => this.categories = res.content);
    this.addItem(); // Agregamos la primera fila por defecto
  }

  // --- LÓGICA DEL FORM ARRAY (FILAS) ---

  addItem() {
    const itemGroup = this.fb.group({
      categoryId: [null, Validators.required],
      productId: [{ value: null, disabled: true }, Validators.required],
      stockEntryId: [{ value: null, disabled: true }, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      maxQuantity: [null], 
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      discountType: ['FIXED_AMOUNT'],
      subTotal: [0]
    });

    const index = this.itemsFormArray.length;

    // Suscripción 1: Cuando cambia la categoría, habilitar productos
    itemGroup.get('categoryId')?.valueChanges.subscribe(catId => {
      const prodCtrl = itemGroup.get('productId');
      prodCtrl?.reset();
      itemGroup.get('stockEntryId')?.reset();
      
      if (catId) {
        prodCtrl?.enable();
        this.productService.getProducts(0, 500, '', catId).subscribe(res => this.productsByRow[index] = res.content);
      } else {
        prodCtrl?.disable();
      }
    });

    // Suscripción 2: Cuando cambia el producto, habilitar Lotes
    itemGroup.get('productId')?.valueChanges.subscribe(prodId => {
      const stockCtrl = itemGroup.get('stockEntryId');
      stockCtrl?.reset();
      
      if (prodId) {
        stockCtrl?.enable();
        this.stockService.getStockEntries(0, 500, '', prodId).subscribe(res => {
          // Filtramos para mostrar solo lotes con stock disponible
          this.lotsByRow[index] = res.content.filter((lote: any) => lote.currentStock > 0);
        });
      } else {
        stockCtrl?.disable();
      }
    });

    // Suscripción 3: Cuando selecciona el lote, fijar precio y maxQuantity
    itemGroup.get('stockEntryId')?.valueChanges.subscribe(stockId => {
      if (stockId) {
        const selectedLot = this.lotsByRow[index].find(l => l.id === stockId);
        if (selectedLot) {
          itemGroup.get('unitPrice')?.setValue(selectedLot.salePrice);
          itemGroup.get('maxQuantity')?.setValue(selectedLot.currentStock);
          // Agregamos validador dinámico para no exceder el stock
          itemGroup.get('quantity')?.setValidators([Validators.required, Validators.min(1), Validators.max(selectedLot.currentStock)]);
          itemGroup.get('quantity')?.updateValueAndValidity();
        }
      }
    });

    // Suscripción 4: Recalcular subtotal si cambian cantidades o precios
    itemGroup.valueChanges.subscribe(() => {
      this.calculateRowSubtotal(itemGroup);
    });

    this.itemsFormArray.push(itemGroup);
  }

  confirmRemoveItem(index: number) {
    this.confirmationService.confirm({
      message: '¿Quitar este producto de la factura?',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.itemsFormArray.removeAt(index);
        this.calculateGlobalTotals();
      }
    });
  }

  // --- CÁLCULOS MATEMÁTICOS ---

  calculateRowSubtotal(group: FormGroup) {
    const qty = group.get('quantity')?.value || 0;
    const price = group.get('unitPrice')?.value || 0;
    const discount = group.get('discount')?.value || 0;
    const type = group.get('discountType')?.value;

    let gross = qty * price;
    let discountAmount = 0;

    if (type === 'FIXED_AMOUNT') discountAmount = discount;
    if (type === 'PERCENTAGE') discountAmount = gross * (discount / 100);

    let net = gross - discountAmount;
    group.get('subTotal')?.setValue(net > 0 ? net : 0, { emitEvent: false }); // emitEvent: false evita ciclos infinitos
    
    this.calculateGlobalTotals();
  }

  calculateGlobalTotals() {
    this.totalGross = 0;
    this.totalDiscount = 0;
    this.netAmount = 0;

    this.itemsFormArray.controls.forEach(control => {
      const qty = control.get('quantity')?.value || 0;
      const price = control.get('unitPrice')?.value || 0;
      const sub = control.get('subTotal')?.value || 0;

      const gross = qty * price;
      this.totalGross += gross;
      this.netAmount += sub;
      this.totalDiscount += (gross - sub);
    });
  }

  get remainingBalance() {
    const payAmount = this.invoiceForm.get('paymentAmount')?.value || 0;
    return this.invoiceForm.get('makePayment')?.value ? (this.netAmount - payAmount) : this.netAmount;
  }

  // --- GUARDADO ---

  generateInvoice() {
    if (this.invoiceForm.invalid || this.itemsFormArray.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Revisa los campos obligatorios y asegúrate de agregar productos.' });
      return;
    }

    this.saving = true;
    const formValue = this.invoiceForm.value;

    const requestPayload = {
      customerId: formValue.customerId,
      issueDate: formValue.issueDate.toISOString(),
      items: formValue.items.map((item: any) => ({
        stockEntryId: item.stockEntryId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        discountType: item.discountType
      })),
      initialPayment: formValue.makePayment ? {
        amount: formValue.paymentAmount,
        method: formValue.paymentMethod,
        bankReference: formValue.bankReference
      } : null
    };

    this.invoiceService.createInvoice(requestPayload).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Factura Creada', detail: `Folio: ${res.invoiceNumber}` });
        this.router.navigate(['/invoices']);
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al generar la factura' });
      }
    });
  }
}
