import { useState } from 'react'
import { Button } from './Button'
import NewInputBox from './NewTextInput'

const CardPayment: React.FC = () => {
  const [selected, setSelected] = useState(false)

  const handleClick = () => {
    setSelected(!selected)
  }

  return (
    <section className="w-full bg-[#F5F5F5] border border-[#F2F2F2] rounded-lg p-3 flex flex-col gap-4">
      <Button
        onClick={handleClick}
        className="flex items-center justify-between w-full  px-6 border-b border-[#C2C2C2 ] bg-inherit">
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
          <p className="text-[#2E2E2E] font-normal text-base">Card</p>
        </section>
        <section>
          <p className="text-[#2E2E2E] font-normal text-base">
            Save this card details
          </p>
        </section>
      </Button>
      <NewInputBox label="Card Number" type="number" />
      <section className="flex gap-4">
        <NewInputBox label="Name on card" placeholder="Card name" type="text" />
        <NewInputBox label="Expiry" placeholder="MM/YY" type="number" />

        <NewInputBox label="CVC" placeholder="CVC" type="number" />
      </section>
    </section>
  )
}

export default CardPayment
