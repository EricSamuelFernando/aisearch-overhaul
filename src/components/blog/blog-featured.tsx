import Image from 'next/image';
import Link from 'next/link';

export default function BlogFeatured() {
  return (
    <section className="py-16 px-4 md:px-10 bg-[#FFF6EC]">
      <div className="w-full">
        <Link href="/blog/featured" className="block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center group cursor-pointer">
            {/* Left Side - Content */}
            <div className="space-y-6">
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Featured Article
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1B1B1B] leading-tight group-hover:text-orange-500 transition-colors">
                5 Ways Technology is Changing How Nigerians Buy Homes
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                The real estate landscape in Nigeria is undergoing a digital transformation. From virtual property tours to AI-powered market analysis, technology is revolutionizing how Nigerians search for, evaluate, and purchase homes. Discover the five key technological innovations that are making home buying more accessible, transparent, and efficient for Nigerian homebuyers.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  <Image
                    src="/assets/images/blog-hero-img.jpg"
                    alt="Remy Watson"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Remy Watson</p>
                  <p className="text-sm text-gray-500">24 Jan 2024</p>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
              <Image
                src="/assets/images/Inside-BlogIMg.png"
                alt="Modern Home"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

