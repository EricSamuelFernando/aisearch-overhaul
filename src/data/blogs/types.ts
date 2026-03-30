export interface TocItem {
  label: string;
  href: string;
}

export interface AiSummary {
  summary: string;
  keyPoints: string[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  tableOfContents?: TocItem[];
  aiSummary?: AiSummary;
  tags?: string[];
}
