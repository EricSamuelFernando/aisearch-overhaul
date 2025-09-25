import { useEffect, useState } from 'react';

const usePlacesAutocomplete = (input: string , searchType="nlp") => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debouncedInput, setDebouncedInput] = useState('');

  const getLastWord = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words[words.length - 1] || '';
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if(searchType === 'nlp') {
        const lastWord = getLastWord(input);
        setDebouncedInput(lastWord);
      }
      else{
        setDebouncedInput(input)
      }
      
    }, 400);

    return () => clearTimeout(timer);
  }, [input]);

  console.log(searchType)

  useEffect(() => {
    if (!debouncedInput || debouncedInput.length < 2 || typeof window === 'undefined') {
      setSuggestions([]);
      return;
    }
    if (!window.google?.maps?.places) {
      return;
    }
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { 
        input: debouncedInput, 
        types:searchType === "nlp" ? ['(cities)']: ['address'],
        componentRestrictions: { country: 'us' },
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map((p) => p.description));
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [debouncedInput]);

  return suggestions;
};

export default usePlacesAutocomplete;