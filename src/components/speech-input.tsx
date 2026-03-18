'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import useSpeechToText from '@/hooks/utils/useSpeechToText';
import { Input } from './ui/input';
import useGooglePlacesAutocomplete from '@/hooks/utils/useGooglePlaces';

type Props = Readonly<{
  className?: string;
  inputClassName?: string;
  value: string;
  searchType?: string;
  placeholderText?: string;
  setValue: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  dropdownPosition?: 'top' | 'bottom';
}>;

function MemoizedSpeechInput({
  className,
  value,
  setValue,
  searchType,
  inputClassName,
  placeholderText,
  onFocus,
  onBlur,
  dropdownPosition = 'bottom',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Default to 'nlp' if searchType is empty or undefined
  const effectiveSearchType = searchType || 'nlp';
  const basePlaceholder = effectiveSearchType === "nlp" ? 'Show me homes in San Jose California under 3 Million' : '260 Rio Del Mar Blvd APT 8, Aptos, CA 95003';
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { transcript } = useSpeechToText();
  const suggestions = useGooglePlacesAutocomplete(value, effectiveSearchType);

  // Use provided placeholderText or animated placeholder
  const displayPlaceholder = placeholderText || animatedPlaceholder;

  // Scroll animation and typewriter effect (only if no placeholderText prop provided)
  useEffect(() => {
    if (placeholderText) {
      // If placeholderText prop is provided, don't animate
      return;
    }

    if (value.length > 0) {
      return; // Stop animation when user types
    }

    let scrollDirection = 1; // 1 for scrolling right, -1 for left
    let textIndex = 0; // Controls the start index of placeholder
    let removing = false; // Whether the text is being removed
    let interval: NodeJS.Timeout;

    const animatePlaceholder = () => {
      interval = setInterval(() => {
        if (!removing) {
          // Scrolling the text right
          textIndex += scrollDirection;
          if (textIndex >= basePlaceholder.length) {
            // Reached end, now start removing characters
            removing = true;
          }
        } else {
          // Removing characters
          textIndex -= scrollDirection;
          if (textIndex <= 0) {
            // When all characters are removed, start again
            removing = false;
          }
        }

        setAnimatedPlaceholder(basePlaceholder.slice(0, textIndex));
      }, 150);

      return interval;
    };

    const intervalId = animatePlaceholder();

    // Cleanup when component is unmounted or user starts typing
    return () => {
      clearInterval(intervalId);
    };
  }, [value, basePlaceholder, placeholderText]);

  useEffect(() => {
    if (transcript) {
      setValue(transcript);
      setShowSuggestions(transcript.length > 1);
    }
  }, [transcript, setValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    setShowSuggestions(e.currentTarget.value.length > 1);
    setSelectedIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (suggestions.length === 0) return;
      setSelectedIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.min(suggestions.length - 1, prevIndex + 1)
      );
    } else if (e.key === 'ArrowUp') {
      if (suggestions.length === 0) return;
      setSelectedIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.max(0, prevIndex - 1)
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedSuggestion =
        (selectedIndex !== null && suggestions[selectedIndex])
          ? suggestions[selectedIndex]
          : null;

      if (selectedSuggestion) {
        if (effectiveSearchType === 'nlp') {
          const words = value.trim().split(/\s+/);
          words.pop();
          setValue(`${words.join(' ')} ${selectedSuggestion}`.trim());
        } else {
          setValue(selectedSuggestion);
        }
      }
      setShowSuggestions(false);
      setSelectedIndex(null);
      // Submit through the parent form so mobile "Enter/Go" reliably triggers search.
      setTimeout(() => {
        inputRef.current?.form?.requestSubmit();
      }, 0);
      // Blur so the dropdown doesn't immediately reopen after submit.
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (effectiveSearchType === "nlp") {
      const words = value.trim().split(/\s+/);
      words.pop();
      setValue(`${words.join(' ')} ${suggestion}`);
    } else {
      setValue(suggestion)
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  // const handleSuggestionClick = (suggestion: string) => {
  //   if (searchType === "nlp") {
  //     setValue((prevValue) => {
  //       // Regular expression to match all occurrences of the suggestion (case-insensitive)
  //       const regex = new RegExp(`\\b${escapeRegExp(suggestion.split(" ")[0])}\\b`, "gi"); // g for all matches and i for case-insensitive match

  //       // Replace all occurrences of the location (partial or full) with the full suggestion
  //       return prevValue.replace(regex, suggestion);
  //     });
  //   } else {
  //     // For Address search type, completely replace the input with the suggestion
  //     setValue(suggestion);
  //   }

  //   setShowSuggestions(false); // Hide suggestions after selection
  //   inputRef.current?.focus(); // Refocus input
  // };

  // Utility function to escape special characters in the suggestion for use in regex
  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&'); // Escape special regex characters
  }

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      setShowSuggestions(false);
      setSelectedIndex(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (value.trim().length <= 1) {
      setShowSuggestions(false);
      setSelectedIndex(null);
    }
  }, [value]);




  const limitedSuggestions = suggestions.slice(0, 3);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="flex h-12 w-full items-center rounded-md bg-transparent">
        <Input
          ref={inputRef}
          placeholder={displayPlaceholder}
          value={value}
          autoComplete="on"
          autoCorrect="on"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn('w-full px-2 border-none outline-none', inputClassName)}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && limitedSuggestions.length > 0 && (
        <ul className={cn(
          "absolute z-[99999] left-0 right-0 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in duration-200",
          dropdownPosition === 'top' 
            ? "bottom-full mb-2 slide-in-from-bottom-2" 
            : "top-full mt-2 slide-in-from-top-2"
        )}>
          {limitedSuggestions.map((city, index) => (
            <li
              key={index}
              className={cn(
                'cursor-pointer text-left text-sm px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                selectedIndex === index && 'bg-blue-50 text-blue-700'
              )}
              onClick={() => handleSuggestionClick(city)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{city}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SpeechInput = React.memo(MemoizedSpeechInput);

export default SpeechInput;
