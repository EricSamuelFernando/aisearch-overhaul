import Image from 'next/image'
import { UnlockCMAProps } from './UnlockCma'
import { Button } from './Button'
import { RoundedButton } from './RoundedButton'

const SucessfullPayment: React.FC<UnlockCMAProps> = ({ openNextModal }) => {
  return (
    <section className="flex flex-col justify-center items-center p-16 ">
      <div className="h-14 w-14 rounded-full bg-[#E3FFDE] flex items-center justify-center ">
        <Image
          src="/assets/images/icons/checkMark.svg"
          alt="Star"
          height={40}
          width={40}
        />
      </div>

      <p className="font-medium text-4xl mt-6 text-[#454545]">
        Payment Successful
      </p>

      <Button className="w-5/12 bg-[#F5F6F9] flex gap-1 text-lg text-black mt-10">
        <p className="font-medium">$15 </p>
        <p className="font-light">USD</p>
      </Button>
      <p className="font-medium text-base text-[#707070] my-2">Card Payment</p>
      <RoundedButton
        variant="secondary"
        onClick={openNextModal}
        label="Continue"
        className="py-2 text-white bg-black px-16 mt-10"
      />
    </section>
  )
}

export default SucessfullPayment
