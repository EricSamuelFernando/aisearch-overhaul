import {
  ChooseYourMeansCardProps,
  ICardProps,
  WeMakeItEasyComponentProps,
} from '../interfaces/card.interface';

export const gettingStartedCardData: ICardProps[] = [
  {
    title: 'SetUp Account',
    description: `Lorem ipsum dolor sit amet, consectetur 
adipiscing elit, sed do eiusmod tempor incididunt 
ut labore et dolore magna aliqua.`,
    imagePath: '/assets/images/acc-icn.svg',
  },
  {
    title: 'SetUp Account',
    description: `Lorem ipsum dolor sit amet, consectetur 
adipiscing elit, sed do eiusmod tempor incididunt 
ut labore et dolore magna aliqua.`,
    imagePath: '/assets/images/upload.svg',
  },
  {
    title: 'SetUp Account',
    description: `Lorem ipsum dolor sit amet, consectetur 
adipiscing elit, sed do eiusmod tempor incididunt 
ut labore et dolore magna aliqua.`,
    imagePath: '/assets/images/comms.svg',
  },
];

export const movingAheadCardData: ICardProps[] = [
  {
    title: 'Understand',
    description:
      'We try to understand your needs,specifications and interests first.',
    imagePath: '/assets/images/Mask Group 88.jpg',
  },
  {
    title: 'Find',
    description:
      'We will find the best and suitable places according your interests.',
    imagePath: '/assets/images/Mask Group 86.jpg',
  },
  {
    title: 'Transparency',
    description:
      'You will be able to communicate Seamlessly with house owner, buyer and even realtors.',
    imagePath: '/assets/images/Mask Group 87.jpg',
  },
];

export const ChooseYourMeansCardData: ChooseYourMeansCardProps[] = [
  {
    id: 'choose-your-means-001',
    description: 'Onboard or invite your personal agent',
    title: 'Your Agent',
    imagePath: '/assets/images/chooseMeansOne.png',
    linkPathname: '',
    buttonTitle:"Get Started"
  },
  {
    id: 'choose-your-means-002',
    description: 'Choose from our vetted list of agents',
    title: 'Our Agent',
    imagePath: '/assets/images/chooseMeansTwo.png',
    linkPathname: '',
    buttonTitle:"Get Started"
  },
  // {
  //   id: 'choose-your-means-003',
  //   description: 'We will guide you in every step',
  //   title: 'Do it Yourself',
  //   imagePath: '/assets/images/chooseMeansThree.png',
  //   linkPathname: '',
  //   buttonTitle:"Coming Soon"
  // },
];

export const SellChooseYourMeansCardData = [
  {
    id: 'choose-your-means-001',
    description: 'Invite your own agent or choose from our directory ',
    title: 'Invite Your Agent',
    imagePath: '/assets/images/sell-choose-your-means.jpg',
    linkPathname: '',
    linkText: 'Get Started',
  },
  {
    id: 'choose-your-means-002',
    description: 'Choose from our directory',
    title: 'Our Agent',
    imagePath: '/assets/images/sell-choose-your-means-1.jpg',
    linkPathname: '',
    linkText: 'Get Started',
  },
  // {
  //   id: 'choose-your-means-003',
  //   description:
  //     'We will guide you step-by-step using our detailed seller’s guide',
  //   title: 'Sell your home by yourself',
  //   imagePath: '/assets/images/sell-choose-your-means-1.jpg',
  //   linkPathname: '',
  //   linkText: 'Coming Soon',
  // },
];

export const WeMakeItEasyComponentData: WeMakeItEasyComponentProps = {
  transaction: [
    {
      Icon: '/assets/images/commission.svg',
      title: 'Guided \n Transactions',
      description:
        'Gain unprecedented control with guided transaction, approvals workflows, task tracking, and comprehensive closing services.',
    },
    {
      Icon: '/assets/images/reduce.svg',
      title: 'Reduced Time for \n Task Completion',
      description:
        'Our platform increases task efficiency by 50%, savings 30% on routine tasks and 80% on complex ones.',
    },
    {
      Icon: '/assets/images/concierge-01.svg',
      title: 'Concierge \n Services',
      description:
        'Concierge Services feature lets you hire & track aspects from interior design, repairs, renovation, landscaping, to moving.',
    },
    {
      Icon: '/assets/images/loan.svg',
      title: 'Loan \n Management',
      description:
        'Apply and track pre-approvals and home loans through our platform, securely managing documents, and communicating directly with loan offers',
    },
  ],
  technology: [
    {
      Icon: '/assets/images/document.svg',
      title: 'Conversational \n Search',
      description:
        'Find your dream property with out intuitive natural language search, exploring new, undiscovered geographical locations',
    },
    {
      Icon: '/assets/images/repository.svg',
      title: 'Document \n Repository',
      description:
        'Streamline paperwork with our one-stop solution for uploading, sharing with appropriate parties, revisiting all important files whenever needed.',
    },
    {
      Icon: '/assets/images/analytics.svg',
      title: 'Advanced \n Analytics',
      description:
        'Discover properties highly correlated to your search using our AI Match Score, and acquire unmatched market insights.',
    },
    {
      Icon: '/assets/images/summerise.svg',
      title: 'Document Summaries',
      description:
        'Effortlessly grasp key details in complex paperwork like Disclosures, CMA, Mortgage, closing documents, saving time and ensuring informed decisions',
    },
  ],
  transparency: [
    {
      Icon: '/assets/images/conversation-01.svg',
      title: 'Communication',
      description:
        'Experience revolutionary transparency with our Agent-Agent & Agent-Principal Communication, additionally enabling direct control for independent transactions.',
    },

    {
      Icon: '/assets/images/offer-01.svg',
      title: 'Offer \n Suggestions',
      description:
        'Maximize negotiation power with Offer Pricing Suggestions, compare similar properties, receive & send counteroffers effortlessly, ensuring competitive bids.',
    },
    {
      Icon: '/assets/images/social.svg',
      title: 'Social \n Feed',
      description:
        'Utilize our Social Feed to stay connected and informed. Share property experiences, highlight neighborhood gems, and boost visibility.',
    },
    {
      Icon: '/assets/images/commision.svg',
      title: 'Commission',
      description:
        'Shield buyer agents by enabling them to negotiate fair commissions ahead of time, amid recent NAR rulings and MLS changes',
    },
  ],
};

export const SellWeMakeItEasyComponentData: WeMakeItEasyComponentProps = {
  transaction: [
    {
      Icon: '/assets/images/commision.svg',
      title: 'Commission',
      description:
        'Our platform offers a revolutionary feature, allowing sellers unmatched control over agent commissions and transaction costs, saving significantly.',
    },
    {
      Icon: '/assets/images/commission.svg',
      title: 'Guided Transactions',
      description:
        'Our Guided Transaction enables sellers to add properties, generate disclosures, list strategically, manage offers, and navigate closing efficiently.',
    },
    {
      Icon: '/assets/images/reduce.svg',
      title: 'Reduced Time',
      description:
        'Our platform streamlines processes, reducing listing preparation time by 50%, speeding offer management by 40%, and expediting closing by 30%.',
    },
    {
      Icon: '/assets/images/concierge-01.svg',
      title: 'Concierge',
      description:
        'Our Concierge Services allow managing & tracking recommended renovations via the Owner Toolset, ensuring the highest sale price and ROI.',
    },
  ],
  technology: [
    {
      Icon: '/assets/images/toolset.svg',
      title: 'Owner Toolset',
      description:
        'Homeowners can track portfolio worth, book concierge services, manage rentals, list properties, pay taxes, and handle home maintenance.',
    },
    {
      Icon: '/assets/images/summerise.svg',
      title: 'Disclosure/Forms Generation',
      description:
        'Our AI-powered tool guides sellers to create comprehensive disclosure packages by asking intuitive questions and collecting information.',
    },
    {
      Icon: '/assets/images/repository.svg',
      title: 'Document Repository',
      description:
        'Our secure repository lets sellers upload, save, and share transaction documents safely, including disclosures, inspection reports, and contracts.',
    },
    {
      Icon: '/assets/images/commision.svg',
      title: 'Advanced Analytics',
      description:
        'Our Advanced Analytics provides data-driven recommendations for listing timing, pricing comparable, and predictive analytics on sale prices.',
    },
  ],
  transparency: [
    {
      Icon: '/assets/images/pricing.svg',
      title: 'Pricing Suggestions',
      description:
        'Our AI-Assisted Pricing Suggestions help sellers make informed decisions by analyzing data from multiple sources, like comparable and trends.',
    },
    {
      Icon: '/assets/images/conversation-01.svg',
      title: 'Communication',
      description:
        'Our platform enables sellers to chat with agents and buyers for quick updates, collaboration, and managing independent home listings.',
    },
    {
      Icon: '/assets/images/social.svg',
      title: 'Social Feed',
      description:
        'Social Feed lets sellers promote listings, review nearby listings, assess agents, stay updated on trends, and discover properties.',
    },
    {
      Icon: '/assets/images/inventry.svg',
      title: 'Inventory Tracker',
      description:
        'Owners track detailed home inventory of appliances and fixtures, ensuring effective oversight with warranty dates in user-friendly interface.',
    },
  ],
};

export const AgentsWeMakeItEasyComponentData: WeMakeItEasyComponentProps = {
  transaction: [
    {
      Icon: '/assets/images/reduce.svg',
      title: 'Reduced Time',
      description:
        'Our technologies and processes are designed to significantly reduce the time required for transactions, from listing to closing.',
    },
    {
      Icon: '/assets/images/concierge-01.svg',
      title: 'Concierge Services',
      description:
        'Offering personalized concierge services to assist clients in managing property related tasks such as moving, renovation, and more.',
    },
    {
      Icon: '/assets/images/compliance.svg',
      title: 'Compliance',
      description:
        'Our Compliance services ensure that all your real estate transactions meet legal standards and best practices, mitigating risk and enhancing trust.',
    },
  ],
  technology: [
    {
      Icon: '/assets/images/toolset.svg',
      title: 'Agent Toolset',
      description:
        'Provides comprehensive tools for real estate agents to manage listings, client interactions, and analytics, boosting efficiency and client satisfaction.',
    },
    {
      Icon: '/assets/images/ai-document.svg',
      title: 'AI Document Generation',
      description:
        'Automate your document workflow with our AI Document Generation system. This tool generates legal and transactional documents, reducing errors and saving time.',
    },
    {
      Icon: '/assets/images/reduced-time.svg',
      title: 'Agent Network',
      description:
        'Connect with a wide network of real estate professionals. Our Agent Network fosters collaborations and referrals, enhancing business opportunities for agents.',
    },
    {
      Icon: '/assets/images/concierge.svg',
      title: 'Portfolio Management',
      description:
        'Our Portfolio Management system allows you to efficiently manage and evaluate your real estate investments, optimizing your financial strategy and asset allocation.',
    },
  ],
  transparency: [
    {
      Icon: '/assets/images/conversation-01.svg',
      title: 'Communication',
      description:
        'Enhance transparency and client relations with our communication tools, designed to facilitate clear, timely, and effective exchanges between all parties involved.',
    },
    {
      Icon: '/assets/images/guided-transaction.svg',
      title: 'CMA/Analytics',
      description:
        'Utilize our CMA (Comparative Market Analysis) and Analytics tools to gain insights into market trends, property valuations, and investment potential.',
    },
    {
      Icon: '/assets/images/reduced-time.svg',
      title: 'Compliance Monitoring',
      description:
        'Social Feed lets sellers promote listings, review nearby listings, assess agents, stay updated on trends, and discover properties.',
    },
    {
      Icon: '/assets/images/pricing.svg',
      title: 'Inventory Tracker',
      description:
        'Owners track detailed home inventory of appliances and fixtures, ensuring effective oversight with warranty dates in user-friendly interface.',
    },
  ],
};

export const placehoderImage = '/assets/images/placeholder.png';
