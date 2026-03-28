import { Article } from './types';
import blogFeatured from './blog-featured';
import blog1 from './blog-1';
import blog2 from './blog-2';
import blog3 from './blog-3';
import blog4 from './blog-4';
import blog5CurbAppeal from './blog-5-curb-appeal';
import blog6BbqStrategy from './blog-6-bbq-strategy';
import blog7SpeedOvens from './blog-7-speed-ovens';
import blog8HvacStrategy from './blog-8-hvac-strategy';
import blog9SmartSprinklers from './blog-9-smart-sprinklers';
import blog10WaterHeater from './blog-10-water-heater';
import blog11StandaloneFreezers from './blog-11-standalone-freezers';
import blog12Refrigerators2026 from './blog-12-refrigerators-2026';

// Add new blog files here — one import per blog
export const articles: Article[] = [
  blogFeatured,
  blog1,
  blog2,
  blog3,
  blog4,
  blog5CurbAppeal,
  blog6BbqStrategy,
  blog7SpeedOvens,
  blog8HvacStrategy,
  blog9SmartSprinklers,
  blog10WaterHeater,
  blog11StandaloneFreezers,
  blog12Refrigerators2026,
];

export const getArticleById = (id: string): Article | null =>
  articles.find((article) => article.id === id) ?? null;
