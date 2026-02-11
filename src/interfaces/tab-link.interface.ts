export type TabLink = {
  title: string;
  query: string;
  url?:string;
  hidden?: boolean;
};

export type TabLinks = TabLink[];
