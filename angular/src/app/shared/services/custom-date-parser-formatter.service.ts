import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) {
      return null;
    }

    // Parse MM-DD-YY format
    const parts = value.trim().split('-');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);

      // Convert 2-digit year to 4-digit year
      if (year < 100) {
        // Assume years 00-30 are 2000-2030, and 31-99 are 1931-1999
        year = year <= 30 ? 2000 + year : 1900 + year;
      }

      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        return { year, month, day };
      }
    }

    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (!date) {
      return '';
    }

    // Format as MM-DD-YY
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    // Get last 2 digits of year
    const year = date.year.toString().slice(-2);

    return `${month}-${day}-${year}`;
  }
}

