
// Shared type definitions
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export type LOBType = 
  | "Customer Returns" 
  | "US Phone" 
  | "US Chat" 
  | "Core Support" 
  | "Inventory Management" 
  | "Dispute Management" 
  | "IBE Management" 
  | "FC Liaison" 
  | "Flex Team" 
  | "Help Desk" 
  | "MRC"
  | "OSS" 
  | "Seller Experience" 
  | "DSP" 
  | "Walmart CA" 
  | "Walmart Import";

// Theme types
export type ThemeMode = "light" | "dark" | "system";
export type ColorTheme = "default" | "blue" | "teal" | "green" | "purple" | "orange";
