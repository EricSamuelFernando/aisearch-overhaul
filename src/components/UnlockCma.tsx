import Image from 'next/image'
import { RoundedButton } from './RoundedButton'
import { Button } from './Button'

export type UnlockCMAProps = {
  openNextModal: () => void
}

const UnlockCMA: React.FC<UnlockCMAProps> = ({ openNextModal }) => {
  return (
    <section className="flex flex-col justify-center items-center p-16 ">
      <Image
        src="/assets/icons/lock_icon.svg"
        alt="Star"
        height={40}
        width={40}
      />
      <p className="font-medium text-4xl mt-6 text-[#454545]">
        Unlock CMA Services
      </p>
      <p className="font-medium text-xl text-[#E8804C] my-2">
        All the latest data from the MLS
      </p>
      <Button className="w-5/12 bg-[#F5F6F9] flex gap-1 text-lg text-black mt-10">
        <p className="font-medium">$15 </p>
        <p className="font-light">USD / property</p>
      </Button>

      <RoundedButton
        variant="secondary"
        onClick={openNextModal}
        label="Proceed"
        className="py-2 text-white bg-black px-16 mt-10"
      />
    </section>
  )
}

export default UnlockCMA
