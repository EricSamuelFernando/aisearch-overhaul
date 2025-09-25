import React, { useState } from 'react';
import Image from 'next/image';

interface DocumentCardMenuProps {
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const DocumentCardMenu: React.FC<DocumentCardMenuProps> = ({
  onOpen,
  onDownload,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={menuRef}>
      <button onClick={toggleMenu} className='focus:outline-none'>
        <Image
          src={'/assets/icons/ellipsis.svg'}
          alt='More Actions'
          width={6}
          height={15}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 z-50 w-36 rounded-md bg-white shadow-lg'>
          <ul className='py-2'>
            <li>
              <button
                className='block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-[#E8804C] hover:text-white'
                onClick={() => handleMenuItemClick(onOpen)}
              >
                Open
              </button>
            </li>
            <li>
              <button
                className='block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-[#E8804C] hover:text-white'
                onClick={() => handleMenuItemClick(onDownload)}
              >
                Download
              </button>
            </li>
            <li>
              <button
                className='block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-[#E8804C] hover:text-white'
                onClick={() => handleMenuItemClick(onDelete)}
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentCardMenu;
