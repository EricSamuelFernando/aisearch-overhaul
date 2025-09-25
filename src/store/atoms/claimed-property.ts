import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Define the Property type (you can adjust the fields as needed)
export type Property = {
  agent_id?:string;
  mls_data?:any;
  modificationTimestamp?:string;
  property_detail?:any;
  snaphomz_sale_data?:any;
  price?: string
  address?: string
  city?: string
  listingId?: string
  listingid?: string
  state?: string
  zipCode?: string
  image?: string
  status?: string
  id?: string
  userId: string
  bra_id?:string
}

export interface PropertyState {
  selectedProperty: Property | undefined
  claimedProperty: Property | undefined // Add claimedProperty to the state
}

// Define the initial state for the PropertyState, including claimedProperty
export const initialState: PropertyState = {
  selectedProperty: undefined,
  claimedProperty: undefined // Initialize claimedProperty as undefined
}

// Create the property atom with persistent storage using `atomWithStorage`
export const propertyAtom = atomWithStorage<PropertyState>('PropertyDetails', {
  ...initialState
})

// Create a read-write atom for updating the claimedProperty state
export const propertyReadWriteAtom = atom(
  (get) => get(propertyAtom),
  (get, set, update: Partial<PropertyState>) => {
    const currentState = get(propertyAtom)
    const newState = {
      ...currentState,
      ...update
    }
    set(propertyAtom, newState)
  }
)

// Create a specific claimedProperty atom for reading and updating claimedProperty
export const claimedPropertyAtom = atomWithStorage<Property | undefined>('ClaimedProperty', undefined)

// Read and write atom for claimedProperty
export const claimedPropertyReadWriteAtom = atom(
  (get) => get(claimedPropertyAtom),
  (get, set, update: Property | undefined) => {
    // Update the claimedProperty state with the new data
    set(claimedPropertyAtom, update)
  }
)
