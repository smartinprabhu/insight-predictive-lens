
// Global type fixes
import type { DateRange, LOBType } from '../types/shared';

declare global {
  interface Window {
    LOBTypes: string[];
  }
  
  // Make DateRange globally available
  type DateRange = import('../types/shared').DateRange;
  type LOBType = import('../types/shared').LOBType;
}

// Initialize LOB types on window
if (typeof window !== 'undefined') {
  window.LOBTypes = [
    "Customer Returns",
    "US Phone", 
    "US Chat",
    "Core Support",
    "Inventory Management",
    "Dispute Management",
    "IBE Management",
    "FC Liaison",
    "Flex Team",
    "Help Desk",
    "MRC",
    "OSS",
    "Seller Experience",
    "DSP",
    "Walmart CA",
    "Walmart Import"
  ];
}

export {};
