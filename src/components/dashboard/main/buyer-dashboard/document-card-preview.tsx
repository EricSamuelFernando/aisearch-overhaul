'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentCardProps {
  documentId: string;
  title: string;
  description: string;
  onOpen: () => void;
  onDownload: () => void;
}

export default function DocumentCardPreview({
  documentId,
  title,
  description,
  onOpen,
  onDownload,
}: DocumentCardProps) {
  return (
    <div className='relative flex w-full items-center justify-between rounded-lg p-4 transition-all duration-500 ease-in-out hover:bg-gray-100'>
      <section className='flex cursor-pointer items-center gap-x-4'>
        <Image
          height={60}
          width={60}
          src='/assets/images/pdf.svg'
          alt='Document Icon'
        />
        <div className='space-y-2'>
          <h3 className='font-bold text-black'>{title}</h3>
          <p className='text-xs text-gray-500'>{description}</p>
        </div>
      </section>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={onOpen}>
            <Eye className='mr-2 h-4 w-4' />
            <span>Open</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>
            <Download className='mr-2 h-4 w-4' />
            <span>Download</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
