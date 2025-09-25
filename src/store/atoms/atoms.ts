
import { atom } from 'jotai'

import { atomWithStorage } from 'jotai/utils'

const propertyDetailsAtom = atomWithStorage('selectedProperty', null)
const agentType = atom('')
const agentEmailAtom = atom('')
const loginAtom = atom({})
const propertyOfferAtom = atom<any>({} )
export {
  agentType,
  agentEmailAtom,
  propertyDetailsAtom,
  propertyOfferAtom,
  loginAtom
}
