// Selects property slice from the global state
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { PropertyView } from '@/types/property.types';
import { useCallback } from 'react';
import { IProperty } from '../../interfaces/property.interface';
import { RootState } from '../../lib/store';
import {
  setMlsProperty,
  setPropertyToEdit,
  setPropertyView,
} from '@/slices/property/property-slice';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';

export const property = (state: RootState) => state.property;

/**
 * @description  Hook providing actions related to property for use in components
 * @returns {Object} An object containing property, current view amongst other things.
 */

export const usePropertyActions = () => {
  const dispatch = useAppDispatch();

  return {
    /**
     * @description Action to perform a set the property view.
     */
    savePropertyView: useCallback(
      (view: PropertyView) => {
        dispatch(setPropertyView(view));
      },

      [dispatch],
    ),

    saveCurrenctProperty: useCallback(
      (property: IProperty) => {
        dispatch(setPropertyToEdit(property));
      },
      [dispatch],
    ),
    saveMlsProperty: useCallback(
      (property: MlsPropertyListing) => {
        dispatch(setMlsProperty(property));
      },
      [dispatch],
    ),
  };
};

export const useProperty = () => {
  return useAppSelector(property);
};
