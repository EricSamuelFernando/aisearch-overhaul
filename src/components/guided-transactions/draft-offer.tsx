import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Heading from '@/components/heading';
import { nanoid } from 'nanoid';

type Props = {};

const offerRisks = [
  {
    title: 'Lack of Legal Protection',
    content:
      'Resolving disputes over property condition, ownership, or contractual obligations  without professional mediation or legal support can be challenging and costly for both buyers and sellers.',
  },
  {
    title: 'Limited Recourse for Disputes',
    content:
      'Resolving disputes over property condition, ownership, or contractual obligations  without professional mediation or legal support can be challenging and costly for both buyers and sellers.',
  },
  {
    title: 'Document Oversight',
    content:
      'Resolving disputes over property condition, ownership, or contractual obligations  without professional mediation or legal support can be challenging and costly for both buyers and sellers.',
  },
];

export function DraftOffer({}: Props) {
  return (
    <div className='grid grid-cols-2'>
      <div className='col-span-1 w-4/5 space-y-2'>
        <p className='font-light text-grey-850'>Step 2/5</p>

        <Heading
          className='m-0 w-full  pb-1 text-lg font-semibold'
          title='Draft an Offer'
        />

        <div>
          <p className='text-justify'>
            With our AI integrated platform, draft buyer offers to seller agents
            in minutes, not days.
          </p>
          <p>
            With intelligent suggestions and real-time insights, negotiating
            your dream property has never been more efficient or stress-free.
          </p>
        </div>
      </div>
      <div className='col-span-1'>
        <div className='rounded-lg bg-white p-8'>
          <Heading
            className='m-0 w-full  pb-2 text-xl font-normal'
            title='Potential Risks Involved'
          />
          <div>
            <Accordion className='' type='single' collapsible>
              {offerRisks.map((risk) => (
                <AccordionItem key={nanoid()} value={risk.title}>
                  <AccordionTrigger customIcon>{risk.title}</AccordionTrigger>
                  <AccordionContent className='w-full '>
                    <p className='text-wrap'>{risk.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
