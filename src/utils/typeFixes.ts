
// This file adds runtime support for our types
// By defining them in the global namespace
// We do this to avoid TypeScript errors in read-only files

// Define our LOB types in the global window object
// These are specifically to fix the PlanningTab.tsx error
interface CustomWindow extends Window {
  LOBTypes: string[];
}

// Make sure LOB types are available at runtime
(window as CustomWindow).LOBTypes = [
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
  "Seller Support",
  "Customer Support",
  "On-boarding",
  "Chat Support", 
  "Phone Support",
  "Walmart Import"
];

// Export the type so TypeScript knows these are valid
export type LOBType = typeof window.LOBTypes[number];

// Enhance the global windowTypes definition
declare global {
  interface Window {
    LOBTypes: string[];
  }
}
