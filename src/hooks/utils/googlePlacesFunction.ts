export const fetchPlaceSuggestions = (() => {
  let debounceTimer: NodeJS.Timeout | null = null;

  return (input: string, callback: (suggestions: string[]) => void) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const debouncedInput = input.trim();

      if (
        !debouncedInput ||
        debouncedInput.length < 2 ||
        typeof window === 'undefined' ||
        !window.google?.maps?.places
      ) {
        callback([]);
        return;
      }

      const autocompleteService = new window.google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(
        {
          input: debouncedInput,
          types: ['address'], // changed from ['(cities)'] to 'address'
          componentRestrictions: { country: 'us' },
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            callback(predictions.map((p) => p.description));
          } else {
            callback([]);
          }
        }
      );
    }, 400);
  };
})();
