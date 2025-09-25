import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AI } from '@public/assets/icons';
import { Button } from '@/components/ui/button'; // assuming you have this button component
import { TransRoundedButton } from '../dashboard/main/TransRoundedButton';
 // your custom button

const briefSummary = `
  <p>This is a brief summary of the disclosure statement. It highlights the key points in a concise paragraph.</p>
`;

const inDepthSummary = `
  <ul>
    <li>Point 1: Detailed explanation of the first item.</li>
    <li>Point 2: More details on the second item.</li>
    <li>Point 3: Additional relevant information presented clearly.</li>
  </ul>
`;

interface SummarisationModalProps {
  initialText?: string;
}

const SummarisationModal: React.FC<SummarisationModalProps> = ({
  initialText = 'Summarising Disclosure Statement',
}) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<'Paragraph' | 'Bullet Points'>('Paragraph');
  const [selectedSummaryType, setSelectedSummaryType] = useState<'Brief' | 'In-depth'>('Brief');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(2);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const getContentForSelection = () => {
    if (selectedSummaryType === 'Brief') {
      return selectedMode === 'Paragraph' ? briefSummary : inDepthSummary;
    } else {
      return selectedMode === 'Paragraph' ? inDepthSummary : briefSummary;
    }
  };

  const handleCopy = () => {
    // Strip HTML tags to copy plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = getContentForSelection();
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    navigator.clipboard.writeText(plainText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownload = () => {
    const jsPDF = require('jspdf').jsPDF;
    const doc = new jsPDF();
    const text = getContentForSelection().replace(/<[^>]+>/g, '');

    doc.text(text, 10, 10);
    doc.save('summary.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-[900px] min-h-[250px] rounded-2xl bg-white p-8 shadow-lg text-center flex flex-col items-center justify-center gap-6">
        {step === 1 && (
          <>
            <div className="rounded-full bg-black p-2 px-8">
              <Image src={AI} width={24} height={24} alt="AI icon" />
            </div>
            <p className="text-lg font-medium">{initialText}</p>
            <div className="w-[60%] h-2 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <section className="flex w-[95%] justify-between border-b border-[#C2C2C2] pb-4">
              <section className="flex w-2/5 items-center">
                <Image
                  src="/assets/images/aiIcon.png"
                  alt="AI Icon"
                  height={62}
                  width={93}
                  className="pr-10"
                />
                <p className="mr-3 text-base font-semibold text-black">Modes:</p>
                <Button
                  className={`rounded-r-none border px-4 text-sm font-semibold ${
                    selectedMode === 'Paragraph'
                      ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                      : 'border-black bg-white text-[#2E2E2E]'
                  }`}
                  onClick={() => setSelectedMode('Paragraph')}
                >
                  Paragraph
                </Button>
                <Button
                  className={`rounded-l-none border px-4 text-sm font-semibold ${
                    selectedMode === 'Bullet Points'
                      ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                      : 'border-black bg-white text-[#2E2E2E]'
                  }`}
                  onClick={() => setSelectedMode('Bullet Points')}
                >
                  Bullet Points
                </Button>
              </section>
              <section className="flex w-2/5 items-center">
                <p className="mr-3 block text-base font-semibold text-black">
                  Summary Type:
                </p>
                <Button
                  className={`rounded-r-none border px-6 text-sm font-semibold ${
                    selectedSummaryType === 'Brief'
                      ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                      : 'border-black bg-white text-[#2E2E2E]'
                  }`}
                  onClick={() => setSelectedSummaryType('Brief')}
                >
                  Brief
                </Button>

                <Button
                  className={`rounded-l-none border px-4 text-sm font-semibold ${
                    selectedSummaryType === 'In-depth'
                      ? 'border-[#FF8700] bg-[#FFF3E4] text-[#FF8700]'
                      : 'border-black bg-white text-[#2E2E2E]'
                  }`}
                  onClick={() => setSelectedSummaryType('In-depth')}
                >
                  In-depth
                </Button>
              </section>
            </section>

            <section className="flex w-full items-center gap-3 py-6">
              <section className="flex items-center justify-center rounded-lg bg-[#F8F8F8] p-2">
                <Image
                  src="/assets/images/documentIcon.svg"
                  alt="document"
                  height={30}
                  width={30}
                />
              </section>
              <p className="text-base font-semibold">
                Disclosure Statement.pdf
              </p>
            </section>

            <section
              className="h-60 w-full overflow-auto rounded-3xl bg-[#FAF9F5] p-10 text-left"
              dangerouslySetInnerHTML={{ __html: getContentForSelection() }}
            />

            <section className="mt-10 flex w-full justify-between">
              <div className="relative inline-flex items-center cursor-pointer" onClick={handleCopy}>
                <TransRoundedButton
                  label="Copy"
                  variant="primary"
                  className="border border-solid border-black px-8 py-2 pl-12 text-black"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 transform">
                  <Image
                    src="/assets/images/copyIcon.svg"
                    alt="Copy Icon"
                    width={20}
                    height={20}
                  />
                </div>
                {copySuccess && (
                  <div
                    className={`absolute left-0 top-full mt-2 rounded-md bg-green-500 px-2 py-1 text-xs text-white shadow-md transition-transform duration-300 ease-in-out ${
                      copySuccess ? 'translate-x-0' : '-translate-x-full opacity-0'
                    }`}
                  >
                    Copied!
                  </div>
                )}
              </div>

              <TransRoundedButton
                label="Download"
                onClick={handleDownload}
                variant="primary"
                className="bg-black px-6 py-2 text-white"
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default SummarisationModal;
