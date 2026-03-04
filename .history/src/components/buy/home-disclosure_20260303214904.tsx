import Image from "next/image";
import { cn } from '@/lib/utils';

export default function HomeDisclosure({
  headingClassName,
}: {
  headingClassName?: string;
}) {
  return (
    <section className="w-full h-auto md:h-full bg-[#170800] text-white
  px-6 md:px-12 lg:px-24
  flex flex-col md:flex-row
  justify-start md:justify-center
  items-start md:items-center
  py-8 sm:py-10 md:py-0
  gap-8 sm:gap-10 md:gap-20">

      {/* Left Side */}
      <div className="w-full md:w-1/2 flex justify-center px-4 md:px-0">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/10
            w-full max-w-[620px] min-h-[300px] sm:min-h-[400px] md:min-h-[380px] lg:min-h-[400px] bg-[#170800] p-4 sm:p-6 md:p-4 lg:p-5">

          {/* TOP AREA */}
          <div className="relative flex items-start">

            {/* Main SVG Image – START of container */}
            <div className="w-24 sm:w-32 md:w-28 lg:w-[120px] mt-0 ml-0">
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
              className="absolute top-2 sm:top-4 md:top-2 lg:top-3 left-[70%] sm:left-[58%] md:left-[72%] lg:left-[62%] -translate-x-1/2 bg-[#1b1b1b] rounded-lg sm:rounded-2xl md:rounded-lg lg:rounded-2xl px-2 sm:px-4 md:px-2 lg:px-3 py-2 sm:py-4 md:py-2 lg:py-3
             w-[50%] sm:w-[170px] md:w-[140px] lg:w-[180px] max-w-xs min-h-[100px] sm:min-h-[180px] md:min-h-[150px] lg:min-h-[180px] flex flex-col gap-1.5 sm:gap-3 md:gap-2 lg:gap-3 shadow-2xl"
            >
              {/* Item 1 */}
              <div className="flex items-start gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2">
                <Image
                  src="/assets/images/Home_disclosure3.png"
                  alt="warning"
                  width={28}
                  height={28}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-[9px] lg:text-[10px] font-medium text-white break-words">High Fee Detected</p>
                  <p className="text-[8px] sm:text-xs md:text-[8px] lg:text-[9px] text-gray-400 mt-0.5 sm:mt-1">Just now</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2">
                <Image
                  src="/assets/images/Home_disclosure3.png"
                  alt="warning"
                  width={28}
                  height={28}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-[9px] lg:text-[10px] font-medium text-white break-words">
                    Services you can shop f...
                  </p>
                  <p className="text-[8px] sm:text-xs md:text-[8px] lg:text-[9px] text-gray-400 mt-0.5 sm:mt-1">59 minutes ago</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2">
                <Image
                  src="/assets/images/Home_disclosure4.png"
                  alt="check"
                  width={28}
                  height={28}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-[9px] lg:text-[10px] font-medium text-white break-words">Analysis Complete</p>
                  <p className="text-[8px] sm:text-xs md:text-[8px] lg:text-[9px] text-gray-400 mt-0.5 sm:mt-1">12 hours ago</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-2">
                <Image
                  src="/assets/images/Home_disclosure5.png"
                  alt="pdf"
                  width={28}
                  height={28}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-[9px] lg:text-[10px] font-medium text-white break-words">Document Uploaded</p>
                  <p className="text-[8px] sm:text-xs md:text-[8px] lg:text-[9px] text-gray-400 mt-0.5 sm:mt-1">Today, 11:59 AM</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Right SVG – INSIDE container */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-1 lg:bottom-2 right-2 sm:right-4 md:right-2 lg:right-2 w-32 sm:w-48 md:w-36 lg:w-40">
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
      <div className="w-full md:w-1/2 flex flex-col gap-5 sm:gap-6 md:gap-8">
        {/* Heading / Description */}
        <div>
          <h2 className={cn('text-3xl md:text-4xl font-semibold leading-tight', headingClassName)}>
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
