import { TabLinks } from '@/interfaces/tab-link.interface';

export const buyerDashboardRoutes: TabLinks = [
  {
    title: 'Dashboard',
    query: 'dashboard',
    url: '/dashboard/buyer',
  },
  {
    title: 'Feed',
    query: 'feeds',
    url: '/dashboard/buyer',
  },
  // {
  //   title: 'Messages',
  //   query: 'messages',
  //   url: '/dashboard/chat',
  // },
  // {
  //   title: 'Conversations',
  //   query: 'conversation',
  //   url: '/dashboard/conversation',
  // },
  // {
  //   title: 'Tasks',
  //   query: 'tasks',
  //   url: '/dashboard/buyer',
  // },
  {
    title:'Upcoming Features',
    query:'upcoming-features',
    url:'/dashboard/buyer/upcoming-features',
  }
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
  // {
  //   title: 'Feeds',
  //   query: 'feeds',
  // },
  // {
  //   title: 'Messages',
  //   query: 'messages',
  // },
  // {
  //   title: 'Conversation',
  //   query: 'conversation',
  // },
  //   {
  //   title: 'Inventory',
  //   query: 'inventory',
  // },
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
