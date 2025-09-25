import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface PropertyState {
  selectedProperty: Property | undefined | any
  engagedProperty:  any
}


export type Property = {
  price?: string
  propertyAddress?: string
  propertyId?: string
  city?: string
  listingId?:string
  state?: string
  zipCode?: string
  propertyImage?: string
  propertyProgress?: number
  status?: string
  // users?: User[];
  id?: string
  userId: string
}

export const initialState: PropertyState = {
  selectedProperty: undefined,
  engagedProperty:undefined
}

export const propertyAtom = atomWithStorage<PropertyState>('PropertyDetails', {
  ...initialState
})

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
