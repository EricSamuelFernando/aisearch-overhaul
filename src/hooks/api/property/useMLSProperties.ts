import { atom, useAtom } from 'jotai';
import { atomWithMutation } from 'jotai-tanstack-query';
import axios from 'axios';
import atomWithDebounce from '@/hooks/utils/use-atom-debounce';
import { pickErrorMessage } from '@/lib/client';

export const {
  isDebouncingAtom,
  debouncedValueAtom,
  clearTimeoutAtom,
  currentValueAtom
} = atomWithDebounce('');

// Mutation function to perform the POST request
const postProperties = async (searchTerm: string) => {
  try {
    console.log('Searching properties with:', searchTerm);

    // Ensure the searchTerm is not empty
    if (!searchTerm) {
      throw new Error('Search term is empty');
    }

    const response = await axios.post(
      'https://demo-ai.snaphomz.com/api/search',
      {
        query: searchTerm,
        userId: 'yash@003',
      }
    );

    // Check if the response contains valid data
    if (!response?.data?.result?.records) {
      throw new Error('No records found in response data');
    }

    console.log(response?.data?.result?.records);
    return response?.data?.result?.records || [] // Return the processed result
  } catch (error: any) {
    // Log and return the error message
    console.error('Error in postProperties:', error);
    return pickErrorMessage(error); // Handle error if any
  }
}

// Define the atom with mutation using `atomWithMutation`
const searchProperty = atomWithMutation((get) => ({
  mutationKey: ['SEARCH_PROPERTY_FOR_CLAIM'],
  mutationFn: postProperties, // Pass the mutation function
  onSuccess(data) {
    console.log('Success data:', data);
    return data // Handle success
  },
  onError(error) {
    console.error('Error:', error); // Handle error
  },
}));

// Hook to use the mutation in your component
export const useMLSProperties = () => {
  const [{ mutate: mutatePropertySearch, status, data }] = useAtom(searchProperty);
  

  return { mutatePropertySearch, status, data };
};
