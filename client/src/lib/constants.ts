// Deal Stages
export const DEAL_STAGES = [
  { value: "Following", label: "Following" },
  { value: "Discovery", label: "Discovery" },
  { value: "Due Diligence", label: "Due Diligence" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Closed", label: "Closed" },
];

// Deal Types
export const DEAL_TYPES = [
  { value: "Strategic Investment", label: "Strategic Investment" },
  { value: "Vendor", label: "Vendor" },
  { value: "Pilot", label: "Pilot" },
  { value: "Partnership", label: "Partnership" },
  { value: "Acquisition", label: "Acquisition" },
];

// Business Units with their colors
export const DEFAULT_BUSINESS_UNITS = [
  { name: "Data Platforms", color: "#36B37E" },
  { name: "Cloud Services", color: "#00B8D9" },
  { name: "Enterprise Apps", color: "#FFAB00" },
  { name: "AI/ML Solutions", color: "#FF5630" },
];

// Stage colors for UI representation
export const STAGE_COLORS = {
  "Following": "bg-primary bg-opacity-10 text-primary",
  "Discovery": "bg-info bg-opacity-10 text-info",
  "Due Diligence": "bg-warning bg-opacity-10 text-warning",
  "Negotiation": "bg-accent bg-opacity-10 text-accent",
  "Closed": "bg-success bg-opacity-10 text-success",
};

// Navigation items for sidebar
export const NAV_ITEMS = [
  { name: "Dashboard", icon: "tachometer-alt", path: "/" },
  { name: "Companies", icon: "building", path: "/companies" },
  { name: "Pipeline", icon: "chart-line", path: "/pipeline" },
  { name: "Reports", icon: "file-alt", path: "/reports" },
];

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { name: "Field Management", icon: "cog", path: "/admin/fields" },
  { name: "User Management", icon: "users", path: "/admin/users" },
];

// Initial user for demonstration
export const CURRENT_USER = {
  id: 1,
  username: "jsmith",
  fullName: "Jane Smith",
  email: "jane.smith@company.com",
  role: "admin",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

// Custom field types
export const CUSTOM_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "enum", label: "Dropdown" },
];
