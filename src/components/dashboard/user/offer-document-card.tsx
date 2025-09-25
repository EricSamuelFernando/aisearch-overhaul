"use client"
import React from 'react';
import { EllipsisVertical } from 'lucide-react';
import { useRepoManagementApi, useViewUploadedFileUrl } from '@/hooks/api/document/useRepoManagement';
import { downloadDocumentPreSigned } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { success, error } from '@/components/alert/notify';



const RectIcon = () => {
  return (
    <svg
      width='112'
      height='128'
      viewBox='0 0 112 128'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect
        x='0.25'
        y='0.25'
        width='111.5'
        height='127.5'
        fill='white'
        stroke='#707070'
        stroke-width='0.5'
      />
      <path
        d='M30 15V17H12V15H30ZM12 27H21V25H12V27ZM12 22H30V20H12V22Z'
        fill='#7A7A7A'
      />
      <path
        d='M84.875 51V49H12.125V51H84.875ZM12.125 39H48.5V41H12.125V39ZM12.125 44H84.875V46H12.125V44Z'
        fill='#7A7A7A'
      />
      <path
        d='M84.875 63V65H12.125V63H84.875ZM12.125 75H48.5V73H12.125V75ZM12.125 70H84.875V68H12.125V70Z'
        fill='#7A7A7A'
      />
      <path
        d='M84.875 90V92H12.125V90H84.875ZM12.125 102H48.5V100H12.125V102ZM12.125 97H84.875V95H12.125V97Z'
        fill='#7A7A7A'
      />
    </svg>
  );
};

export function OfferDocumentCard(props: any) {
  const key = props?.fileKey || ''
  const { data: downloadUrl, isLoading } = useViewUploadedFileUrl(key);
  const { useGrantAccess: { mutate, data, status } } = useRepoManagementApi()
   console.log()
  const handleGrantAcess = async () =>    {
    try {
      const payload = {
        repoId:props?.docId ,
        accessType: 'OWNER'
      }
      mutate(payload)
    } catch (error) {

    }
  }
  return (

    <div
      key={props?.idx}
      className='flex h-[18.375rem] w-[14.313rem] flex-col justify-between border border-[#707070] bg-[#F3F3F3]'>
      <div className='flex flex-auto items-end justify-center pb-8'>
        <RectIcon />
      </div>
      <div className='relative h-[5.125rem] w-full bg-white p-4'>
        {(props?.fileName||props?.document?.description) && <p>{props?.fileName || props?.document?.description}</p>}
        {/* <p className='text-xs text-end w-full '>
          {new Date(props?.uploadedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p> */}
        <DropdownMenu >
          <DropdownMenuTrigger className='absolute right-3 top-1  bg-white flex items-center gap-1'>
            <EllipsisVertical className='h-4 w-4 text-black' />
            <span className='sr-only'>Toggle menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='bg-white' >
            <DropdownMenuItem onClick={() => downloadDocumentPreSigned(downloadUrl, props?.fileName)}>Download</DropdownMenuItem>
            {
              !props?.share && <DropdownMenuItem onClick={handleGrantAcess}>Share</DropdownMenuItem>
            }

            <DropdownMenuItem
              onClick={() => {
                if (downloadUrl) {
                  navigator.clipboard.writeText(downloadUrl);
                  success({ message: 'Link copied to clipboard!' });
                }
                else {
                  error({ message: 'File link not available yet.' });
                }
              }}
            >
              Copy External Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props?.onDelete(props?.docId)}>Delete</DropdownMenuItem>
            {/* <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Change Access</DropdownMenuItem>  */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
