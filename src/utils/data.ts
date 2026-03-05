import { TabLinks } from '@/interfaces/tab-link.interface';

export const BUYER_DASHBOARD_SECTION_VISIBILITY: Record<string, boolean> = {
  dashboard: false,
  messages: true,
  conversation: false,
  'my-snapz': true,
  'search-history': true,
};

const isBuyerSectionVisible = (section: string) =>
  BUYER_DASHBOARD_SECTION_VISIBILITY[section] !== false;

export const buyerDashboardRoutes: TabLinks = [
  {
    title: 'Messages',
    query: 'messages',
    url: '/dashboard/buyer?tab=messages',
    hidden: !isBuyerSectionVisible('messages'),
  },
  {
    title: 'My Snapz',
    query: 'my-snapz',
    url: '/dashboard/buyer?tab=my-snapz',
    hidden: !isBuyerSectionVisible('my-snapz'),
  },
  {
    title: 'Search History',
    query: 'search-history',
    url: '/dashboard/buyer?tab=search-history',
    hidden: !isBuyerSectionVisible('search-history'),
  },
  {
    title: 'Dashboard',
    query: 'dashboard',
    url: '/dashboard/buyer',
    hidden: !isBuyerSectionVisible('dashboard'),
  },
  {
    title: 'Conversations',
    query: 'conversation',
    url: '/dashboard/chat',
    hidden: !isBuyerSectionVisible('conversation'),
  },
  // {
  //   title: 'Tasks',
  //   query: 'tasks',
  //   url: '/dashboard/buyer',
  // },
];

export const sellerDashboardRoutes: TabLinks = [
  {
    title: 'Overview',
    query: 'overview',
  },
  {
    title: 'Listings',
    query: 'listings',
  },
  {
    title: 'Feeds',
    query: 'feeds',
  },
  {
    title: 'Messages',
    query: 'messages',
  },
  {
    title: 'Conversation',
    query: 'conversation',
  },
  {
    title: 'Inventory',
    query: 'inventory',
  },
];

export const agentDashboardRoutes: TabLinks = [
  {
    title: 'Listing',
    query: 'listing',
  },
  {
    title: 'Buy Leads',
    query: 'buy-leads',
  },
  // {
  //   title: 'Manage Contracts',
  //   query: 'manage-contracts',
  // },
];

export const agentListingTabs: TabLinks = [
  {
    title: 'Documents',
    query: 'documents',
  },
  {
    title: 'Offers',
    query: 'offers',
  },
  // {
  //   title: 'Views',
  //   query: 'views',
  // },
  {
    title: 'Messages',
    query: 'messages',
  },
  // {
  //   title: 'Settings',
  //   query: 'settings',
  // },
];

export const transactionsTabs: TabLinks = [
  {
    title: 'Documents',
    query: 'documents',
  },
  {
    title: 'Offers',
    query: 'offers',
  },
  {
    title: 'Counter Offers',
    query: 'counter-offers',
  },
  {
    title: 'Conversations',
    query: 'conversations',
  },
  {
    title: 'Settings',
    query: 'settings',
  },
];
