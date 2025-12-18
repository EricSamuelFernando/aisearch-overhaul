import Image from 'next/image';

export default function DoNotSellOrShare() {
  return (
    <>
      <header className="w-full bg-[#120500] py-4">
        <div className="mx-auto flex items-center justify-center px-6">
          <Image
            src="/Snaphomz-Logo-White-01.png"
            alt="Snaphomz logo"
            width={200}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>
      </header>
    <main className="mx-auto max-w-4xl px-6 py-16 text-black">
      <h1 className="text-3xl font-semibold mb-6">
        Do Not Sell or Share My Personal Information
      </h1>

      <p className="text-black/80 mb-6">
        Under applicable privacy laws, including the California Consumer Privacy Act (CCPA) 
        and the California Privacy Rights Act (CPRA), you have the right to opt out of the sale 
        or sharing of your personal information.
      </p>

      <section className="space-y-6 text-black/80">
        <p>
          Snaphomz may collect personal information such as identifiers, contact information,
          and usage data to provide and improve our services. We do not sell personal information
          for monetary consideration. However, some data sharing may be considered a “sale” or
          “sharing” under California law.
        </p>

        <p>
          You may submit a request to opt out of the sale or sharing of your personal information
          by using the form below or by contacting us directly.
        </p>
      </section>

      {/* Divider */}
      <div className="my-10 border-t border-white/20" />

      {/* Simple Opt-Out Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Submit an Opt-Out Request</h2>

        <p className="text-black/80 mb-6">
          Please email us with the subject line{" "}
          <span className="font-medium text-white">
            “Do Not Sell or Share My Personal Information”
          </span>
          .
        </p>

        <div className="rounded-xl border border-black/20 p-6 bg-white/5">
          <p className="mb-2">
            📧 Email:{" "}
            <a
              href="mailto:support@snaphomz.com"
              className="underline text-black"
            >
              support@snaphomz.com
            </a>
          </p>

          <p className="text-sm text-black/60">
            We will process verified requests within the timeframe required by law.
          </p>
        </div>
      </section>
    </main>
    </>
  );
}
