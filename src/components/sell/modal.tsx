import { cn } from '@/lib/utils'
import React, { ReactElement } from 'react'

type IModalProps = {
  children: ReactElement
  isOpen: boolean
  className?:string
  closeModal?: () => void
  useChildStyle?: boolean
}

const Modal: React.FC<IModalProps> = ({
  children,
  isOpen,
  closeModal,
  className,
  useChildStyle = false
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal?.()
    }
  }
  return (
    <div
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-[999] grid min-h-screen h-screen w-screen place-items-center bg-black/40 backdrop-blur-sm transition-opacity duration-300',
        {
          'opacity-100 pointer-events-auto': isOpen,
          'opacity-0 pointer-events-none': !isOpen
        },
       
      )}>
      {useChildStyle ? (
        children
      ) : (
        <div className="relative m-4 w-2/5 min-w-[40%] max-w-[40%] rounded-2xl bg-white font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl">
          {children}
        </div>
      )}
    </div>
  )
}

export default Modal
