import { UnlockCMAProps } from './UnlockCma'
import { RoundedButton } from './RoundedButton'
import { Button } from './Button'
import PaymentButton from './PaymentButtons'
import CardPayment from './Card'

const CmaPaymentOptionForm: React.FC<UnlockCMAProps> = ({ openNextModal }) => {
  return (
    <section className="flex flex-col justify-center items-center p-4 gap-3  ">
      <section className="flex justify-between items-center w-full">
        <p className="font-semibold text-black text-lg">
          Select Payment Option
        </p>
        <p className="font-medium text-[#8E929C] text-base">
          All transactions are secure
        </p>
      </section>
      <PaymentButton text="Paypal" logo="/assets/icons/paypal.svg" />
      <CardPayment />
      <PaymentButton text="Apple Pay" logo="/assets/images/icons/apple.svg" />
      <PaymentButton text="Google Pay" logo="/assets/images/icons/google.svg" />
      <section className="flex items-end h-14 w-full justify-end">
        <Button className="w-4/12 bg-inherit border-0 text-[#E8804C] text-lg font-medium ">
          Cancel
        </Button>
        <RoundedButton
          variant="secondary"
          onClick={openNextModal}
          label="Pay | $15 "
          className="py-2 text-white border bg-black px-10"
        />
      </section>
    </section>
  )
}

export default CmaPaymentOptionForm
