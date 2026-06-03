import type React from "react";

// Define the structure of a single sidebar item
export interface SidebarItem {
  id: string;          // Unique identifier for keys in mapping (e.g., React's 'key' prop)
  label: string;       // The text displayed in the sidebar
  url?: string;        // The routing path (optional, as parent nodes might just open/close)
  icon?: string;       // Optional icon identifier (e.g., 'home', 'book')
  children?: SidebarItem[]; // Nested sub-topics
}