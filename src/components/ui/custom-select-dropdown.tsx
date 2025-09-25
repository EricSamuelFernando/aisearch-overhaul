import { ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Option {
  title: string;
  icon?: JSX.Element;
  value?: any;
}

interface DropdownProps {
  options: Option[];
  onSelect?: (option: string | null) => void;
  defaultText?: string;
  allowDeselect?: boolean;
  selectedValue?: string | null;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  onSelect, 
  defaultText = 'Select Option',
  allowDeselect = true,
  selectedValue = null
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | string>(defaultText);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update the selected option when selectedValue changes
  useEffect(() => {
    if (selectedValue === null) {
      setSelectedOption(defaultText);
    } else {
      const option = options.find(opt => opt.title === selectedValue);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [selectedValue, options, defaultText]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelection = (option: Option) => {
    // If already selected and deselect is allowed, reset to default
    if (typeof selectedOption === 'object' && 
        selectedOption.title === option.title && 
        allowDeselect) {
      setSelectedOption(defaultText);
      if (onSelect) {
        onSelect(null);
      }
    } else {
      setSelectedOption(option);
      if (onSelect) {
        onSelect(option?.title);
      }
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(defaultText);
    if (onSelect) {
      onSelect(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDefaultText = typeof selectedOption === 'string';

  return (
    <div className="relative inline-block text-left mt-2" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="px-4 py-2.5 flex items-center justify-between gap-3 bg-white text-gray-800 rounded-lg border border-gray-300 hover:border-ocOrange transition-all duration-200 min-w-[180px] shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption && (typeof selectedOption === 'object' ? selectedOption.icon : null)}
          <p className="font-medium truncate">
            {typeof selectedOption === 'object' ? selectedOption.title : selectedOption}
          </p>
        </div>
        <div className="flex items-center">
          {!isDefaultText && allowDeselect && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 mr-1"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          )}
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[1000] left-0 mt-1 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 min-w-[180px] max-h-[300px] overflow-y-auto w-full animate-in fade-in-80 duration-200">
          <div className="py-1">
            {options?.map((option, index) => {
              const isSelected = typeof selectedOption === 'object' && selectedOption.title === option.title;
              return (
                <button
                  key={index}
                  onClick={() => handleSelection(option)}
                  className={`flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                    isSelected 
                      ? 'bg-gray-50 text-ocOrange font-medium' 
                      : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  <span className="truncate">{option.title}</span>
                  {isSelected && (
                    <span className="ml-auto">
                      <div className="h-2 w-2 bg-ocOrange rounded-full"></div>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;



