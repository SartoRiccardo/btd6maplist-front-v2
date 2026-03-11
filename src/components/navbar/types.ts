export interface NavChild {
  url: string;
  name: string;
  icon_url?: string;
}

export interface NavItem {
  name: string;
  url?: string;
  children?: NavChild[];
}
