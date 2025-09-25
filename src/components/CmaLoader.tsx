import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import { useSelector } from 'react-redux';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useSellerPropertyAnalyticsAPI } from '@/hooks/api/property/useSellerPropertyAnalytics';
import { useAuth } from '@/shared/hooks/useAuth';
import { useParams } from 'next/navigation';
import { error, success } from './alert/notify';
import { message } from '@public/assets/icons';

interface CmaLoaderProps {
  active: boolean;
  closeModal?:any;
  refreshAnalytics?: () => void;
}

const CmaLoader: React.FC<CmaLoaderProps> = ({ active , closeModal  }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);

  const { uploadNewFile } = usePropertyServiceAPI();
  const { createSellerAnalytics } = useSellerPropertyAnalyticsAPI();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  // Memoize userId & propertyId to avoid unnecessary effect triggers
  const userId = user?.id || '';
  const pid = id || '';

  console.log(claimedProperty)

  // Reset state when inactive
  useEffect(() => {
    if (!active) {
      setProgress(0);
      setUploading(false);
      setPdfGenerated(false);
    }
  }, [active]);

  useEffect(() => {
    if (!active || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.floor(Math.random() * 10) + 5, 100));
    }, 500);

    return () => clearInterval(interval);
  }, [active, progress]);

  const generateAndUploadPdf = async () => {
    setUploading(true);
    setPdfGenerated(true);

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Comparative Market Analysis Report', 20, 20);
      doc.setFontSize(12);
      doc.text('Summary:', 20, 40);
      doc.text('- Total Listings: 120', 20, 50);
      doc.text('- Average Price: $450,000', 20, 60);
      doc.text('- Median Days on Market: 30', 20, 70);
      doc.text('- Market Trends: Prices rising steadily.', 20, 80);
      doc.text('Thank you for using our service!', 20, 110);

      const pdfBlob = doc.output('blob');

      const file = new File([pdfBlob], 'Comparative Market Analysis.pdf', {
        type: 'application/pdf',
      });

      console.log(file, userId, pid)

      const { key } = await uploadNewFile(file, userId, pid);

      const inputData = {
        propertyId: id,
        listingId: claimedProperty?.listingid?.toString() || "", // <-- make sure you define this above or get from props/state
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: key,
      
      };
      await createSellerAnalytics.mutateAsync(inputData);
      success({message:'PDF generated, uploaded, and analytics created successfully!'});
     
      closeModal();
      closeModal()
    } catch (err:any) {
      console.error('Error generating/uploading PDF or saving analytics:', error);
      error({message:err?.message});
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (progress < 100 || pdfGenerated || !active) return;
    generateAndUploadPdf();
  }, [progress, pdfGenerated, active, uploadNewFile, userId, pid, createSellerAnalytics]);

  return (
    <section className="flex flex-col justify-center items-center p-10">
      <p className="font-medium text-base mb-4">
        Loading Comparative Market Analysis ({progress}%)
      </p>
      <section className="w-full flex items-center justify-center bg-[#EDEDED] rounded-lg mt-2 h-1 overflow-hidden">
        <div
          className="bg-[#FF8700] rounded-l-lg transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%`, height: '100%' }}
        />
        <div
          className="bg-[#EDEDED] rounded-r-lg h-1 transition-all duration-500 ease-in-out"
          style={{ width: `${100 - progress}%` }}
        />
      </section>
      {uploading && (
        <p className="mt-4 font-semibold text-xs text-blue-600">
          Uploading PDF and saving analytics...
        </p>
      )}
      {!uploading && pdfGenerated && (
        <p className="mt-4 font-semibold text-xs text-green-600">
          PDF generated, uploaded, and analytics saved!
        </p>
      )}
    </section>
  );
};

export default CmaLoader;
