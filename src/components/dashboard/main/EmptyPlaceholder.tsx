import React from 'react'
import Image from 'next/image'


type PlaceholderProps = {
  title?: string
  description: string
  buttonLabel?: string
  onButtonClick?: () => void
  EmptyPlaceHolderImage: string
  transactionImage:string;
}

const EmptyPlaceholder: React.FC<PlaceholderProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
  EmptyPlaceHolderImage,
  transactionImage
}) => {
  return (
    <section className="w-full items-center justify-center flex flex-col gap-3 pt-20">
      <section className="border border-solid border-white bg-white items-center justify-center flex rounded-lg px-2 py-2">
        <Image src={EmptyPlaceHolderImage} alt="chat" height={80} width={80}/>
      </section>
      <p className="font-bold text-xl text-black">{title}</p>
      <p className="text-base text-[#8E929C]">{description}</p>
    </section>
  )
}

export { EmptyPlaceholder }
