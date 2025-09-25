import { usePagination } from '@mantine/hooks';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React from 'react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  totalPages?: number;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number,
): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalPages,
  currentPage,
  totalItems,
  itemsPerPage,
}) => {
  const pagination = usePagination({
    total: Number(totalPages),
    initialPage: currentPage,
    onChange: (page) => onPageChange(page),
  });

  const { active, first, last, next, previous, range, setPage } = pagination;
  const allItemCount = Math.max(currentPage, 1) * itemsPerPage;
  return (
    <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
      <div>
        <nav className='isolate inline-flex gap-x-2' aria-label='Pagination'>
          <button
            // onClick={() => onPageChange(currentPage - 1)}
            onClick={first}
            disabled={active === 1}
            className='relative inline-flex items-center rounded-full px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed'
          >
            <span className='sr-only'>first</span>
            <ChevronFirst />
          </button>
          <button
            onClick={previous}
            disabled={active === 1}
            className='relative inline-flex items-center rounded-full  px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed'
          >
            <span className='sr-only'>Previous</span>
            <ChevronLeft className='h-5 w-5' aria-hidden='true' />
          </button>

          {range.map((page, index) =>
            typeof page === 'string' ? (
              <button
                className='px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                key={index}
              >
                ...
              </button>
            ) : (
              <button
                key={index}
                onClick={() => setPage(page)}
                className={`relative  inline-flex items-center ${
                  active === page
                    ? 'bg-black text-white'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                } rounded-full px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
                {page}
              </button>
            ),
          )}
          <button
            onClick={next}
            disabled={active === range[range.length - 1]}
            // disabled={currentPage === totalPages}
            className='relative inline-flex items-center rounded-full px-2  py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed'
          >
            <span className='sr-only'>Next</span>
            <ChevronRight className='h-5 w-5' aria-hidden='true' />
          </button>
          <button
            onClick={last}
            disabled={active === range[range.length - 1]}
            className={cn(
              'relative inline-flex items-center rounded-full px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed',
            )}
          >
            <span className='sr-only'>last</span>
            <ChevronLast />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
