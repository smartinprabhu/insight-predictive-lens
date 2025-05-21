
// Type definitions to fix PlanningTab.tsx type errors

// Define possible LOB (Line of Business) values
export type LOBType = 
  | "Customer Returns"
  | "US Chat"
  | "US Phone"
  | "Core Support"
  | "Inventory Management"
  | "Dispute Management"
  | "IBE Management"
  | "FC Liaison"
  | "Flex Team"
  | "Help Desk"
  | "Onboarding"
  | "Customer Success"
  | "KYC"
  | "Tech Support"
  | "Product Support"
  | "Walmart Cash"
  | "Walmart Import";

// This makes the type definitions available globally in the project
declare global {
  interface Window {
    LOBTypes: LOBType[];
  }
}
