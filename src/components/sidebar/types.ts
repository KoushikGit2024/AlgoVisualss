export type NavItem = {
  id: string;
  label: string;
  url?: string;
  icon?: any;
  hoverIcon?: any;
  badge?: string;
  children?: NavItem[];
};
