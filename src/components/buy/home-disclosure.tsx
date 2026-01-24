import Image from "next/image";

export default function HomeDisclosure() {
  return (
    <section className="w-full bg-[#170800] text-white
  py-32 px-6 md:px-12 lg:px-24
  flex flex-col md:flex-row
  justify-center
  items-start
  gap-20">

      {/* Left Side */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/10
            w-[400px] md:w-[520px] lg:w-[620px] min-h-[440px] bg-[#170800] p-6">

          {/* TOP AREA */}
          <div className="relative flex items-start">

            {/* Main SVG Image – START of container */}
            <div className="w-[140px] mt-0 ml-0">
              <Image
                src="/assets/images/Home_disclosure1.svg"
                alt="Home Disclosure"
                width={340}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>


            {/* Status Card – TOP MIDDLE */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1b1b1b] rounded-3xl px-5 py-5
             w-[250px] min-h-[240px] flex flex-col gap-5 shadow-2xl"
            >
              {/* Item 1 */}
              <div className="flex items-start gap-3">
                <Image
                  src="/assets/images/Home_disclosure3.png"
                  alt="warning"
                  width={28}
                  height={28}
                />
                <div>
                  <p className="text-sm font-medium text-white">High Fee Detected</p>
                  <p className="text-xs text-gray-400 mt-1">Just now</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3">
                <Image
                  src="/assets/images/Home_disclosure3.png"
                  alt="warning"
                  width={28}
                  height={28}
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    Services you can shop f...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">59 minutes ago</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3">
                <Image
                  src="/assets/images/Home_disclosure4.png"
                  alt="check"
                  width={28}
                  height={28}
                />
                <div>
                  <p className="text-sm font-medium text-white">Analysis Complete</p>
                  <p className="text-xs text-gray-400 mt-1">12 hours ago</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3">
                <Image
                  src="/assets/images/Home_disclosure5.png"
                  alt="pdf"
                  width={28}
                  height={28}
                />
                <div>
                  <p className="text-sm font-medium text-white">Document Uploaded</p>
                  <p className="text-xs text-gray-400 mt-1">Today, 11:59 AM</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Right SVG – INSIDE container */}
          <div className="absolute bottom-4 right-4 w-52">
            <Image
              src="/assets/images/Home_disclosure2.svg"
              alt="Documents"
              width={208}
              height={85}
              className="w-full h-auto"
            />
          </div>

        </div>
      </div>


      {/* Right Side */}
      <div className="w-full md:w-1/2 flex flex-col gap-8">
        {/* Heading / Description */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            Understand Home <br /> Disclosures <span className='font-light'>In Seconds</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#CEB28B] max-w-md">
            Upload your closing disclosure PDF to get a clear detailed summary and breakdown of your closing cost.
          </p>
        </div>

        {/* CTA Button */}
        <a 
          href="https://snapdisclosures.snaphomz.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-orange-500 hover:bg-orange-600 transition text-white px-12 py-2 rounded-full w-fit text-sm md:text-base block text-center"
        >
          Upload Disclosure
        </a>
      </div>
    </section>
  );
}
