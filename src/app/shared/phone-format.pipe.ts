import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(rawNum: string | null | undefined): string {
    if (!rawNum) return '-';
    const cleanNum = rawNum.replace(/\D/g, '');
    
    if (cleanNum.length !== 10) return rawNum;

    return `(${cleanNum.slice(0,3)}) ${cleanNum.slice(3,6)}-${cleanNum.slice(6)}`;
  }
}