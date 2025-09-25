import { nanoid } from 'nanoid';
import { Icons } from '../../icons';
import { useState } from 'react'; // Update with your actual Icons import

export const NewFeatureCard = ({ features }: { features: any }) => {
  const escape = [
    'Listing Price Information', 'Listing Information', 'Similar Homes', 'Price Trends',
    'Taxable Value', 'Property Tax History', 'Homes For Rent Nearby', 'New Listings Nearby',
    'Net Operating Income', 'Price History - Compass', 'Comparable Sales Nearby',
    "Buyer's Brokerage Compensation", "SpectrumStarry InternetAT&T InternetViasat InternetHughesNet",
    'Price Activity - Movoto','mls_listingKey','Nearby Similar Homes'
  ];

  return (
    <>
      {features?.map((feature: any) => {
        if (escape.includes(feature?.key)) {
          return null; // Skip rendering for escaped keys
        }

        return <FeatureSection key={nanoid()} feature={feature} />;
      })}
    </>
  );
};

const FeatureSection = ({ feature }: { feature: any }) => {
  const [showAll, setShowAll] = useState(false);

  const maxVisible = 3;
  const valuesToShow = showAll ? feature?.value : feature?.value?.slice(0, maxVisible);

  const isUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="mb-2 text-lg font-semibold text-black">{feature?.key}</h2>
      <div className="space-y-2">
        {valuesToShow?.map((item: any) => (
          <p className="flex items-center gap-x-2" key={nanoid()}>
            <Icons.SmallBall />
            {isUrl(item) ? (
              <a
                href={item}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 font-medium hover:underline"
              >
                {item}
              </a>
            ) : (
              <span className="text-gray-600 font-medium">{item}</span>
            )}
          </p>
        ))}
        {feature?.value?.length > maxVisible && (
          <button
            className="mt-2 text-blue-500 font-medium hover:underline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'See More'}
          </button>
        )}
      </div>
    </div>
  );
};
