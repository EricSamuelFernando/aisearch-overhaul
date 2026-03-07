import HeroTab, { HeroSearchForm } from './ai-search/hero-tab';

export { HeroSearchForm };

export type SharedHeroTabComponent = typeof HeroTab;

export const getSharedAgentHeroTab = (): SharedHeroTabComponent => HeroTab;

export default getSharedAgentHeroTab;
