"use client"
import { CoBuyerForm } from '@/components/property/manage/add-cobuyer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { useSelector } from 'react-redux';

export function AddSignatory() {
  const [screen, setScreen] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const engagedProperty = useSelector((state: any) => state.property);
  console.log(engagedProperty)

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <div className='mb-9 flex items-start justify-end'>
          <Button className='mb-8 w-[12.5rem]' roundness='full'>
            Add Signatory
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className='py-8 sm:max-w-[58.063rem]'>
        <CoBuyerForm 
        showDialog={showDialog} 
        setShowDialog={ setShowDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
