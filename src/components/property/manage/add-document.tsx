'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ProofOfFundsUpload } from '@/components/property/manage/proof-of-funds';

type Props = {};

function AddDocumentButton({}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} modal={true} onOpenChange={() => setOpen(!open)}>
      <DropdownMenuTrigger>
        <Button className='my-8 w-[12.5rem]' roundness='full'>
          Add Document
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem>Pre Approval</DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <ProofOfFundsUpload />
        </DropdownMenuItem>
        <DropdownMenuItem>Others</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AddDocumentButton;
