'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TransRoundedButton } from '../dashboard/main/TransRoundedButton';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';

interface AISummaryCardOutputProps {
  onClose: () => void;
  summary: string;
  isLoading: boolean;
  isOpen: boolean;
  documentName: string | null;
}

const AISummaryCardOutput: React.FC<AISummaryCardOutputProps> = ({
  onClose,
  summary,
  isOpen,
  isLoading,
  documentName,
}) => {
  const handleCopy = () => {
    const content = getInDepthSummary(summary);
    const plainTextContent = content.replace(/<[^>]+>/g, '');

    navigator.clipboard
      .writeText(plainTextContent)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy content: ', err);
      });
  };

  const [selectedMode, setSelectedMode] = useState<
    'Paragraph' | 'Bullet Points'
  >('Paragraph');
  const [selectedSummaryType, setSelectedSummaryType] = useState<
    'Brief' | 'In-depth'
  >('Brief');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const getInDepthSummary = (text: string): string => {
    return text;
  };

  const handleDownload = () => {
    const fullContent = getInDepthSummary(summary);
    const doc = new jsPDF();
    const margin = 10;
    const lineHeight = 10;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const text: string[] = doc.splitTextToSize(
      fullContent,
      pageWidth - 2 * margin,
    );

    let y = margin;

    text.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save('summary.pdf');
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <section className='relative flex w-3/5 flex-col items-center rounded-lg bg-white px-10 py-20'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-xl font-semibold text-black'
        >
          &times;
        </button>
        <section className='flex w-[95%] justify-between border-b border-[#C2C2C2] pb-4'>
          <section className='flex w-2/5 items-center'>
            <Image
              src='/assets/images/aiIcon.png'
              alt='AI Icon'
              height={62}
              width={93}
              className='pr-10'
            />
            <p className='mr-3 text-base font-semibold text-black'>Modes:</p>
            <Button
              className={`rounded-r-none border px-4 text-sm font-semibold ${
                selectedMode === 'Paragraph'
                  ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                  : 'border-black bg-white text-[#2E2E2E]'
              } hover:border-[#FF8700] hover:bg-[#FFF3E4] hover:text-[#FF8700] hover:outline-none hover:ring-0 focus:outline-none focus:ring-0`}
              style={{ outline: 'none', boxShadow: 'none' }}
              onClick={() => setSelectedMode('Paragraph')}
            >
              Paragraph
            </Button>
            <Button
              className={`rounded-l-none border px-4 text-sm font-semibold ${
                selectedMode === 'Bullet Points'
                  ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                  : 'border-black bg-white text-[#2E2E2E]'
              } hover:border-[#FF8700] hover:bg-[#FFF3E4] hover:text-[#FF8700] hover:outline-none hover:ring-0 focus:outline-none focus:ring-0`}
              style={{ outline: 'none', boxShadow: 'none' }}
              onClick={() => setSelectedMode('Bullet Points')}
            >
              Bullet Points
            </Button>
          </section>
          <section className='flex w-2/5 items-center'>
            <p className='mr-3 block text-base font-semibold text-black'>
              Summary Type:
            </p>
            <Button
              className={`rounded-r-none border px-6 text-sm font-semibold ${
                selectedSummaryType === 'Brief'
                  ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                  : 'border-black bg-white text-[#2E2E2E]'
              } hover:border-[#FF8700] hover:bg-[#FFF3E4] hover:text-[#FF8700] hover:outline-none hover:ring-0 focus:outline-none focus:ring-0`}
              style={{ outline: 'none', boxShadow: 'none' }}
              onClick={() => setSelectedSummaryType('Brief')}
            >
              Brief
            </Button>

            <Button
              className={`rounded-l-none border px-4 text-sm font-semibold ${
                selectedSummaryType === 'In-depth'
                  ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                  : 'border-black bg-white text-[#2E2E2E]'
              } hover:border-[#FF8700] hover:bg-[#FFF3E4] hover:text-[#FF8700] hover:outline-none hover:ring-0 focus:outline-none focus:ring-0`}
              style={{ outline: 'none', boxShadow: 'none' }}
              onClick={() => setSelectedSummaryType('In-depth')}
            >
              In-depth
            </Button>
          </section>
        </section>
        <section className='flex w-full items-center gap-3 py-6'>
          <section className='flex items-center justify-center rounded-lg bg-[#F8F8F8] p-2'>
            <Image
              src='/assets/images/documentIcon.svg'
              alt='document'
              height={30}
              width={30}
              className=''
            />
          </section>
          <p className='text-base font-semibold'>
            Disclosure Statement.pdf
            {/* {documentName || 'No document selected'} */}
          </p>
        </section>
        <section className='h-60 w-full overflow-auto rounded-3xl bg-[#FAF9F5] p-10'>
          {isLoading ? (
            <p>Loading summary...</p>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: getContentForSelection(
                  summary,
                  selectedMode,
                  selectedSummaryType,
                ),
              }}
            />
          )}
        </section>
        <section className='mt-10 flex w-full justify-between'>
          <div
            className='relative inline-flex items-center'
            onClick={handleCopy}
          >
            <TransRoundedButton
              label='Copy'
              variant='primary'
              className='border border-solid border-black px-8 py-2 pl-12 text-black'
            />

            <div className='absolute left-5 top-1/2 -translate-y-1/2 transform cursor-pointer'>
              <Image
                src='/assets/images/copyIcon.svg'
                alt='Copy Icon'
                width={20}
                height={20}
              />
            </div>

            {copySuccess && (
              <div
                className={`absolute left-0 top-full mt-2 transform rounded-md bg-green-500 px-2 py-1 text-xs text-white shadow-md transition-transform duration-300 ease-in-out ${
                  copySuccess ? 'translate-x-0' : '-translate-x-full opacity-0'
                }`}
              >
                Copied!
              </div>
            )}
          </div>

          <TransRoundedButton
            label='Download'
            onClick={handleDownload}
            variant={'primary'}
            className='bg-black px-6 py-2 text-white'
          />
        </section>
      </section>
    </div>
  );
};

const getContentForSelection = (
  summary: string,
  mode: 'Paragraph' | 'Bullet Points',
  summaryType: 'Brief' | 'In-depth',
) => {
  const summarizeBriefly = (text: string): string => {
    const sentences = text
      .split('. ')
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence);
    return (
      sentences.slice(0, Math.min(sentences.length, 5)).join('. ') +
      (sentences.length > 5 ? '...' : '')
    );
  };

  const getInDepthSummary = (text: string): string => {
    return text;
  };

  const content =
    summaryType === 'Brief'
      ? summarizeBriefly(summary)
      : getInDepthSummary(summary);

  if (mode === 'Bullet Points') {
    const bulletPoints = content
      .split('. ')
      .map((point) => `<li class="bullet-point mb-4">${point.trim()}</li>`)
      .join('');
    return `<ul class="list-disc">${bulletPoints}</ul>`;
  } else {
    return content;
  }
};

export default AISummaryCardOutput;
