import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useViewUploadedFileUrl } from '@/hooks/api/document/useRepoManagement'
import { downloadDocument } from '@/utils/downloadFunction'
import PDFViewerModal from './pdf-viewer'
 // Make sure this path is correct

type DocumentCardProps = {
  title: string
  updatedDate: string
  downloadIcon?: string
  documentIcon?: string
  moreOptionsIcon?: string
  copyOptionIcon?: string
  className?: string
  titleClassName?: string
  dateClassName?: string
  iconClassName?: string
  canDownLoad?: boolean
  moreOptions?: boolean
  copyOption?: boolean
  documentUrl?: string
  url: string
  onClick?: () => void
  handleDocumentDelete?: () => void
  isOpen?: boolean
  setActiveDocument?: () => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  updatedDate,
  downloadIcon = '/assets/icons/download.svg',
  documentIcon = '/assets/icons/documentIcon.svg',
  moreOptionsIcon = '/assets/icons/moreOptionsIcon.svg',
  copyOptionIcon = '/assets/icons/copy.svg',
  className,
  titleClassName,
  dateClassName,
  iconClassName,
  canDownLoad = true,
  moreOptions = true,
  copyOption = false,
  documentUrl,
  url,
  onClick,
  handleDocumentDelete,
  isOpen = false,
  setActiveDocument
}) => {
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false)
  const { data: fileUrl } = useViewUploadedFileUrl(url)

  const handleOpenPdfViewer = () => {
    setIsPdfViewerModalOpen(true)
    setActiveDocument && setActiveDocument()
  }

  return (
    <>
      <section
        className={cn(
          'border-[0.5px] border-solid border-[#AAAAAA] rounded-md px-6 w-1/4 py-3 cursor-pointer',
          className
        )}
        onClick={onClick}>
        <section className="flex justify-end items-center gap-4">
          {canDownLoad && (
            <section className="flex items-center justify-end mb-3">
              <Image
                onClick={(e) => {
                  e.stopPropagation()
                  downloadDocument(fileUrl, title)
                }}
                src={downloadIcon}
                alt="download"
                height={16}
                width={16}
                className={iconClassName}
              />
            </section>
          )}
          {copyOption && (
            <section className="flex items-center justify-end mb-3">
              <Image
                src={copyOptionIcon}
                alt="copy"
                height={20}
                width={20}
                className={iconClassName}
              />
            </section>
          )}
        </section>

        <Image
          src={documentIcon}
          alt="document"
          height={40}
          width={40}
          className={iconClassName}
        />
        <p className={cn('text-md font-bold my-2 h-12', titleClassName)}>
          {title}
        </p>
        <section className="flex items-end justify-between relative">
          <p
            className={cn('font-medium text-[#5A5A5A] text-sm', dateClassName)}>
            {updatedDate}
          </p>
          {moreOptions && (
            <Image
              src={moreOptionsIcon}
              alt="more options"
              height={20}
              width={20}
              className={iconClassName}
              onClick={(e) => {
                e.stopPropagation()
                setActiveDocument?.()
              }}
            />
          )}

          {isOpen && (
            <section className="bg-[#F5F8FA] absolute bottom-10 -right-5 w-20 rounded-md py-2 border-[0.1px] border-[#9B9B9B] z-10">
              <div
                className="hover:bg-white w-full flex justify-center py-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenPdfViewer()
                }}>
                View
              </div>
              <div
                className="hover:bg-white w-full flex justify-center py-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDocumentDelete?.()
                }}>
                Delete
              </div>
            </section>
          )}
        </section>
      </section>

      {isPdfViewerModalOpen && (
        <PDFViewerModal
          isOpen={isPdfViewerModalOpen}
          onClose={() => setIsPdfViewerModalOpen(false)}
          documentUrl={fileUrl}
        />
      )}
    </>
  )
}

export { DocumentCard }
