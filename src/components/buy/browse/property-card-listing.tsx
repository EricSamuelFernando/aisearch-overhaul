"use client";
import { useState } from "react";
import NImage from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Bath, BedDouble, Ruler } from "lucide-react";
import EmblaCarousel from "@/components/customs/carousel/embla-carousel";

interface PropertyCardProps {
  listing: any;
}

const PropertyCardBrows: React.FC<PropertyCardProps> = ({ listing }) => {
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);

  if (!listing) return null;

  // ✅ Create image slides correctly as React elements
  const slides =
    listing?.media?.photosList?.slice(0, 4)?.map((image: any, idx: number) => {
      if (!image?.lowRes) return null;
      return (
        <div key={idx} className="relative w-full h-[400px] aspect-video">
          <NImage
            src={image.lowRes}
            alt={`property-image-${idx}`}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      );
    }) || [];

  // ✅ Click handlers
  const handleClick = (e: React.MouseEvent) => {
    if (!carouselEvent) {
      router.push(`/buy/${listing.listingId}/prop/preview`);
    }
  };

  const handleCarouselButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselEvent(true);
    setTimeout(() => setCarouselEvent(false), 300);
  };

  return (
    <div
      onClick={handleClick}
      className="flex w-full sm:w-[320px] lg:w-[350px] min-h-[450px] max-w-sm cursor-pointer flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-black border border-gray-800 hover:border-ocOrange hover:scale-[1.02] group"
    >
      {/* Carousel Section */}
      <div className="relative w-full  overflow-hidden">
        <div className="w-full h-[250px] bg-gray-900"> 
            <EmblaCarousel slides={slides} options={{ loop: true }} />
        </div>
        {listing?.leadTypes?.mlsType?.length ? (
          <div className="absolute top-5 left-5 bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium">
            {listing?.leadTypes?.mlsType?.join(", ")}
          </div>
        ) : null}
      </div>

      {/*  Content Section */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-2 bg-black">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold text-white">
            {formatCurrency(listing?.listPriceLow || 0, "USD")}
          </h3>
        </div>

        <p className="text-sm text-gray-400">{listing?.courtesyOf}</p>

        <div className="text-sm text-white leading-tight">
          <p className="font-medium">{listing?.address?.unparsedAddress}</p>
          <p>
            {listing?.address?.city}, {listing?.address?.stateOrProvince}{" "}
            {listing?.address?.zipCode}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700">
          {[
            {
              icon: <BedDouble className="w-4 h-4 text-ocOrange" />,
              value: listing?.property?.bedroomsTotal || 0,
              unit: "Bed",
            },
            {
              icon: <Bath className="w-4 h-4 text-ocOrange" />,
              value: listing?.property?.bathroomsTotal || 0,
              unit: "Bath",
            },
            {
              icon: <Ruler className="w-4 h-4 text-ocOrange" />,
              value: listing?.property?.livingArea || 0,
              unit: "sqft",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col text-center w-1/3">
              {item.icon}
              <div className="flex items-center gap-1 mt-1 text-white text-base font-semibold">
                <span>{item.value}</span>
                <span className="text-xs text-gray-400">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyCardBrows;



