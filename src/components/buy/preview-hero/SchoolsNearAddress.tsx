import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Assuming you use Heroicons

// Define the data structure for a single school
interface SchoolData {
  rating: string;
  name: string;
  type: string;
  grades: string;
  distance: string;
}

// Data matching the screenshot
const schoolsData: SchoolData[] = [
  {
    rating: '2 / 10',
    name: 'La Marque Elementary School',
    type: 'Public - Serves this home',
    grades: 'K to 5',
    distance: '0.9 mi',
  },
  {
    rating: '2 / 10',
    name: 'Hayley Elementary School',
    type: 'Public - Serves this home',
    grades: 'K to 5',
    distance: '0.9 mi',
  },
  {
    rating: '2 / 10',
    name: 'LA MARQUE MIDDL', // Note: Corrected typo based on school naming convention
    type: 'Public - Serves this home',
    grades: 'K to 5',
    distance: '0.9 mi',
  },
  {
    rating: '2 / 10',
    name: 'La Marque High School',
    type: 'Public - Serves this home',
    grades: 'K to 5',
    distance: '0.9 mi',
  },
];

interface SchoolDistrictProps {
  address: string; // "1912 Madison Avenue"
  district: string; // "Texas City Independent School District"
  schools: SchoolData[];
}

const SchoolsNearAddress: React.FC<SchoolDistrictProps> = ({
  address = '1912 Madison Avenue', // Default values for screenshot replication
  district = 'Texas City Independent School District',
  schools = schoolsData
}) => {
  // State to manage how many schools to display
  const [visibleCount, setVisibleCount] = React.useState(5);

  // Calculate how many schools to show
  const schoolsToShow = schools.slice(0, visibleCount);
  const hasMore = visibleCount < schools.length;

  // Handler for "Show more" button
  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, schools.length));
  };

  return (
    <div className="w-full py-6 sm:py-8">

      {/* --- Header Section --- */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 break-words">
        Schools near {address}
      </h2>
      <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
        This home is within {district}.
      </p>

      {/* --- Schools Table --- */}
      <div className="border-t border-b border-gray-200">

        <div className="hidden md:grid grid-cols-5 text-sm font-semibold text-gray-700 bg-gray-50 py-3 px-4">
          <div className="col-span-1">School</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Grades</div>
          <div className="col-span-1">Distance</div>
          <div className="col-span-1">Ratings</div>
        </div>

        {schoolsToShow.map((school, index) => (
          <div key={index} className="border-t border-gray-100 first:border-t-0">
            {/* Mobile card row */}
            <div className="md:hidden px-3 py-3">
              <div className="text-orange-600 hover:text-orange-700 cursor-pointer text-sm font-medium break-words">
                {school.name}
              </div>
              <div className="mt-1 text-xs text-gray-600 break-words">{school.type}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700">
                <div>
                  <span className="font-semibold text-gray-500">Grades</span>
                  <div>{school.grades}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Distance</span>
                  <div>{school.distance}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Rating</span>
                  <div>{school.rating}</div>
                </div>
              </div>
            </div>

            {/* Desktop table row */}
            <div className="hidden md:grid grid-cols-5 items-center text-sm py-3 px-4">
              <div className="col-span-1 text-orange-600 hover:text-orange-700 cursor-pointer">
                {school.name}
              </div>
              <div className="col-span-1 text-gray-700">
                {school.type}
              </div>
              <div className="col-span-1 text-gray-700">
                {school.grades}
              </div>
              <div className="col-span-1 text-gray-700">
                {school.distance}
              </div>
              <div className="col-span-1 text-gray-700">
                {school.rating}
              </div>
            </div>
            <div className="col-span-1 text-gray-700">
              {school.rating}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleShowMore}
          className="flex items-center mt-4 text-orange-600 text-sm sm:text-base font-medium hover:text-orange-700"
        >
          <ChevronDownIcon className="w-5 h-5 mr-1" aria-hidden="true" />
          Show more ({schools.length - visibleCount} more schools)
        </button>
      )}

    </div>
  );
};

export default SchoolsNearAddress;
