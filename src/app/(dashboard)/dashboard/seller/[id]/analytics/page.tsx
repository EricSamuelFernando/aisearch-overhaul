'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/sell/modal'
import { RoundedButton } from '@/components/RoundedButton'
import UnlockCMA from '@/components/UnlockCma'
import CmaPaymentOptionForm from '@/components/CmaPaymentOptionForm'
import CmaLoader from '@/components/CmaLoader'
import SucessfullPayment from '@/components/SucessfulPayment'
import { getAllPropertyAnalytics } from '@/hooks/api/property/useSellerPropertyAnalytics'
import { EllipsisVertical, FileText } from 'lucide-react'

import { useSelector } from 'react-redux'
import { AgentPropertyCard } from '@/components/dashboard/agent/agent-property-card'
import { useRouter } from 'next/navigation'

const Page = () => {
  const [isOpen, setIsOpen] = useState<string | null>(null)
  const router = useRouter()
  const openModal = (modal: string) => {
    setIsOpen(modal)
  }
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);
  const { data: analytics } = getAllPropertyAnalytics()
  console.log(analytics)

  const closeModal = () => {
    setIsOpen(null)
  }
  const handleBack = () => router.back();


  return (
    <>
      <div className='p-12 min-h-[80vh]'>
        <div className="flex cursor-pointer items-center gap-5 mb-6" onClick={handleBack}>
          <Image src="/assets/images/arrow-back.svg" alt="Back" height={19} width={18} />
          <p className="text-md font-medium">Back</p>
        </div>

        <div className='flex items-center w-full justify-between ' >
          <div>
            <h3 className='text-xl  font-bold'>Comparative Market Analysis</h3>
            <p className='text-xs opacity-50'> With the freshest data from the MLS, you can interact with listings like
              you never have before.</p>
          </div>

          <button

            onClick={() => openModal('unlockCMA')}

            className="py-3 text-white flex gap-2 rounded-full items-center bg-black px-6  "

          >
            <Image
              src="/assets/icons/star_icon.svg"
              alt="Star"
              height={21}
              width={20}
            />
            Generate
          </button>
          <div className="w-1/3">
            <AgentPropertyCard
              moreAddressDetails={claimedProperty?.name}
              imageSource={claimedProperty?.image}
              address={`${claimedProperty?.address}, ${claimedProperty?.city}, ${claimedProperty?.zipCode}`}
            />
          </div>
        </div>

        <div className='py-8 flex flex-wrap w-full gap-4'>

          {

            analytics?.length ? analytics.map((doc: any) => {
              return (
                <aside key={doc.id} className=" w-fit relative">
                  <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 flex items-center justify-center rounded-md bg-orange-100 cursor-pointer"
                      // onClick={() => onDownload(doc)}
                      >
                        <FileText className="h-8 w-8 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{doc.fileName}</h3>
                        <p className="text-sm text-gray-500">{`Updated ${doc.uploadedAt}`}</p>
                      </div>
                    </div>

                    <div className="relative">
                      {/* <button
                        className="p-2 text-gray-500 hover:text-gray-700"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   setOpenDropdown(openDropdown === index ? null : index);
                      // }}
                      >
                        <EllipsisVertical />
                      </button> */}
                      {/*       
                  {openDropdown === index && (
                    <div className="absolute right-0 top-10 w-36 bg-white shadow-lg rounded-md border z-50">
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                        onClick={() => {
                          setEditModal({ open: true, doc });
                          setOpenDropdown(null);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                        onClick={() => {
                          handleDownload();
                          setOpenDropdown(null);
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                        onClick={() => {
                          handleView();
                          setOpenDropdown(null);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                        onClick={() => {
                          onDelete(doc?.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )} */}
                    </div>
                  </div>
                </aside>
              )
            })
              :
              <section className="w-full flex flex-col items-center gap-3 py-36">

                <div className="flex justify-center items-center bg-white rounded-lg h-10 w-10 p-1">
                  <Image
                    src="/assets/icons/document_icon.svg"
                    alt="transaction Image"
                    height={30}
                    width={30}
                  />
                </div>
                <section className="flex items-center justify-center gap-3">
                  <p className="font-semibold text-lg">Comparative Market Analysis</p>
                  <Image
                    src="/assets/icons/star_icon.svg"
                    alt="Star"
                    height={21}
                    width={20}
                  />
                </section>

                <p className="font-extralight text-lg text-[#8E929C] w-6/12 text-center">
                  With the freshest data from the MLS, you can interact with listings like
                  you never have before.
                </p>
                <RoundedButton
                  variant="secondary"
                  onClick={() => openModal('unlockCMA')}
                  label="Generate"
                  className="py-2 text-white bg-black px-6 mt-10"
                />
              </section>
          }
        </div>
      </div>

      <Modal isOpen={isOpen === 'unlockCMA'} closeModal={closeModal}>
        <UnlockCMA openNextModal={() => openModal('cmaPaymentOptionForm')} />
      </Modal>
      <Modal isOpen={isOpen === 'cmaPaymentOptionForm'} closeModal={closeModal}>
        <CmaPaymentOptionForm openNextModal={() => openModal('successfulPayment')} />
      </Modal>
      <Modal isOpen={isOpen === 'successfulPayment'} closeModal={closeModal}>
        <SucessfullPayment openNextModal={() => openModal('cmaLoader')} />
      </Modal>
      <Modal isOpen={isOpen === 'cmaLoader'} closeModal={closeModal}>
        <CmaLoader active={isOpen === 'cmaLoader'} closeModal={closeModal}  />
      </Modal>

    </>
  )
}

export default Page
