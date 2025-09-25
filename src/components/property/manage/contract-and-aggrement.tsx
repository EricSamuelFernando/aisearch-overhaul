import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { HeadingLevelTwo } from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import ManageDocument from '@/components/property/manage-document';
import { useSelector } from 'react-redux';
import { fetchTransactionDocuments } from '@/lib/api/zip-form';
import { useEffect, useState } from 'react';
import { userData } from '@/slices/auth/auth.slice';

type Props = {};

function ContractAndAgreement({ }: Props) {
  const [loading, setLoading] = useState(true);
  const [agreementDocs, setAgreementDocs] = useState([]);
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty)
  const user = useSelector((state: any) => state?.auth)
  const buyerAgent = engagedProperty?.participants?.filter((item: any) => item?.userId === engagedProperty?.user?.id)
  const getBRADocuments = async () => {
    try {
      setLoading(true)
      const response = await fetchTransactionDocuments(user.contextId, buyerAgent?.[0]?.bra_id)
      // console.log('Fetched documents:', response);
      setAgreementDocs(response?.data?.value)
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
    setLoading(false)
  }
  useEffect(() => {
    getBRADocuments()
  }, [])

  return (
    <section className='py-4'>
      <ManageDocument />

      <HeadingLevelTwo>Documents</HeadingLevelTwo>
      <>{
        loading ? <><div className='flex justify-center items-center'>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
        </div></> : <>
          {
            agreementDocs?.length > 0 ?
              <div className='my-8 flex gap-x-8'>
                {
                  agreementDocs?.map((item, idx) => (
                    <OfferDocumentCard
                      document={item}
                      key={idx}
                    />
                  ))
                }
              </div> : <p className='text-sm font-bold text-gray-600 p-4 py-[30%] text-center'>No documents found, please create the BRA first.</p>
          }
        </>
      }</>
    </section>
  );
}

export default ContractAndAgreement;
