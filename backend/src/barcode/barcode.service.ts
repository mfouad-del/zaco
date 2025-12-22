import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

@Injectable()
export class BarcodeService {
  
  // Generates a UUIDv7-like ID (using v4 for now as v7 requires specific lib or node version, but structure is key)
  // In a real scenario with 'uuid' v9+, we can use v7() if available or a polyfill.
  // For this implementation, we will use a custom generator for the "Business Barcode"
  
  generateBusinessBarcode(type: 'INCOMING' | 'OUTGOING'): string {
    const prefix = type === 'INCOMING' ? 'IN' : 'OUT';
    const dateStr = format(new Date(), 'yyMMdd');
    const uniqueSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    return `${prefix}${dateStr}-${uniqueSuffix}`;
  }

  generateUUIDv7(): string {
    // Placeholder for actual UUIDv7 generation logic if library support is missing in this env
    // Ideally: return uuidv7();
    return uuidv4(); 
  }
}
