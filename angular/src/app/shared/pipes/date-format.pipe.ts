import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: false
})
export class DateFormatPipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: any, format: string = 'MM/dd/yyyy'): string {
    if (!value) return '';
    
    const date = value instanceof Date ? value : new Date(value);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return this.datePipe.transform(date, format) || '';
  }
}

