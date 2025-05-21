
import { LOBType } from '../types/planning';

// Define the LOB types that match what's being used in PlanningTab.tsx
export const LOBTypes: LOBType[] = [
  "Customer Returns",
  "US Chat",
  "US Phone",
  "Core Support",
  "Inventory Management",
  "Dispute Management",
  "IBE Management",
  "FC Liaison",
  "Flex Team",
  "Help Desk",
  "Onboarding",
  "Customer Success",
  "KYC",
  "Tech Support",
  "Product Support",
  "Walmart Cash",
  "Walmart Import"
];

// Make the LOB types available globally
window.LOBTypes = LOBTypes;

// Create an ambient declaration to augment the existing type
// This helps TypeScript understand that when these strings are used,
// they should be treated as the appropriate type
declare module "react" {
  interface React {
    LOBTypes: LOBType[];
  }
}

export default LOBTypes;
