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
  searchType?:string;
  setValue: (val: string) => void;
}>;

function MemoizedSpeechInput({
  className,
  value,
  setValue,
  searchType,
  inputClassName,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const basePlaceholder = searchType=== "nlp"? 'Show me homes in San Jose California under 3 Million': '260 Rio Del Mar Blvd APT 8, Aptos, CA 95003';
  const [placeholderText, setPlaceholderText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Track if user is typing
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { transcript } = useSpeechToText();
  const suggestions = useGooglePlacesAutocomplete(value , searchType);
  
  // Scroll animation and typewriter effect
  useEffect(() => {
    if (value.length > 0) {
      setIsTyping(true);
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

        setPlaceholderText(basePlaceholder.slice(0, textIndex));
      }, 150);

      return interval;
    };

    const intervalId = animatePlaceholder();

    // Cleanup when component is unmounted or user starts typing
    return () => {
      clearInterval(intervalId);
    };
  }, [value ,basePlaceholder]);

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
      setSelectedIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.min(suggestions.length - 1, prevIndex + 1)
      );
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.max(0, prevIndex - 1)
      );
    } else if (e.key === 'Enter' && selectedIndex !== null) {
      e.preventDefault();
      setValue(suggestions[selectedIndex]);
      setShowSuggestions(false);
      const words = value.trim().split(/\s+/);
      words.pop();
      setValue(`${words.join(' ')} ${suggestions[selectedIndex]}`);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if(searchType === "nlp"){
      const words = value.trim().split(/\s+/);
      words.pop();
      setValue(`${words.join(' ')} ${suggestion}`);
    }else{
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

  

  
  return (
    <div className={cn('relative w-full', className)}>
      <div className="flex h-12 w-full items-center  rounded-md bg-transparent ">
        <Input
          ref={inputRef}
          placeholder={placeholderText}
          value={value}
          autoComplete="on"
          autoCorrect="on"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn('w-full px-2 border-none outline-none',inputClassName)}
        />
      </div> 
       {/* <div className={cn('relative w-full', className)}> */}


      <div>
      { (searchType === 'nlp' || searchType === 'address')  && showSuggestions &&  suggestions.length > 0 && (
        <ul className="absolute z-[9999] top-full left-0 right-0  mt-1 max-h-32 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
          {suggestions.map((city, index) => (
            <li
              key={index}
              className={cn(
                'cursor-pointer text-left text-sm  px-4 py-1 hover:bg-gray-100',
                selectedIndex === index && 'bg-blue-100'
              )}
              onClick={() => handleSuggestionClick(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}

const SpeechInput = React.memo(MemoizedSpeechInput);

export default SpeechInput;