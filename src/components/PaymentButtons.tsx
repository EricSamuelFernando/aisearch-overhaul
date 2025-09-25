import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from './Button'

type PaymentButtonProps = {
  text: string
  logo: string
}
const PaymentButton: React.FC<PaymentButtonProps> = ({ text, logo }) => {
  const [selected, setSelected] = useState(false)

  const handleClick = () => {
    setSelected(!selected)
  }

  return (
    <Button
      onClick={handleClick}
      className="flex items-center justify-between w-full p-6 border border-[#AAAAAA ] bg-inherit my-2 rounded-lg">
      <section className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full border mr-2 flex items-center justify-center p-1 ${
            selected ? 'border-[#FF8700]' : 'border-[#707070]'
          }`}>
          <div
            className={`w-4 h-4 rounded-full ${
              selected ? 'bg-[#FF8700]' : 'bg-inherit'
            }`}></div>
        </div>
        <p className="text-[#2E2E2E] font-medium text-base">{text}</p>
      </section>
      <Image src={logo} alt="PayPal Logo" height={20} width={20} />
    </Button>
  )
}

export default PaymentButton
