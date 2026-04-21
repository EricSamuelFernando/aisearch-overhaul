// Shared filter taxonomy — imported by both UI components and server-side API routes.
// No 'use client' directive so this can be used anywhere.

export interface FilterItem {
  id: string;
  label: string;
  keywords: string[]; // kept for backwards compat, AI detection is the primary path
}

export interface FilterGroup {
  id: string;
  label: string;
  filters: FilterItem[];
}

export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'rooms',
    label: 'Rooms & Features',
    filters: [
      { id: '2bed',       label: '2 bed',       keywords: ['2 bed', '2 bedroom', '2br'] },
      { id: '3bed',       label: '3 bed',       keywords: ['3 bed', '3 bedroom', '3br'] },
      { id: '4bed',       label: '4+ bed',      keywords: ['4 bed', '4 bedroom', '4br', '4+ bed', '5 bed', '5 bedroom'] },
      { id: '2bath',      label: '2 bath',      keywords: ['2 bath', '2 bathroom'] },
      { id: '3bath',      label: '3+ bath',     keywords: ['3 bath', '3 bathroom', '3+ bath'] },
      { id: 'pool',       label: 'Pool',        keywords: ['pool', 'swimming pool'] },
      { id: 'garage',     label: 'Garage',      keywords: ['garage', 'parking'] },
      { id: 'backyard',   label: 'Backyard',    keywords: ['backyard', 'back yard', 'yard', 'garden'] },
      { id: 'homeoffice', label: 'Home office', keywords: ['home office', 'office', 'study', 'wfh'] },
    ],
  },
  {
    id: 'type',
    label: 'Property Type',
    filters: [
      { id: 'singlefamily', label: 'Single Family', keywords: ['single family', 'house', 'sfh', 'detached'] },
      { id: 'condo',        label: 'Condo',         keywords: ['condo', 'condominium'] },
      { id: 'townhouse',    label: 'Townhouse',     keywords: ['townhouse', 'townhome', 'town home'] },
      { id: 'multifamily',  label: 'Multi-Family',  keywords: ['multi-family', 'multifamily', 'duplex', 'triplex'] },
      { id: 'apartment',    label: 'Apartment',     keywords: ['apartment', 'apt'] },
    ],
  },
];
