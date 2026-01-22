import Heading from "@/components/heading";
import RequestLoader from "@/components/main/reuqest-loader";
import { useGetToursByProperty } from "@/hooks/api/property-tour/usePropertyTour";
import TourSchedule from "./tour-schedule";
import Link from "next/link";
import { EmptySkeleton } from "@/components/empty-skeleton";
import { truncateText } from "@/lib/utils";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

type Props = {
  showButton?: boolean;
  properties?: any[]; // adjust type as needed
  propertyId?: string; // you will need to pass this to fetch tours
};

function ToursList({ showButton = false, properties, propertyId }: Props) {
  // Use your query hook if propertyId is provided
  debugger
  const { data: fetchedTours, isFetching } = useGetToursByProperty(propertyId || '');

  // Use passed properties prop or fetched tours from hook

    const staticTour = {
    id: "static-1",
    propertyAddress: "123 Green Valley, Springfield, USA",
    events: [
      {
        eventDate: "2025-09-10",
        tourTime: "2:00 PM - 3:00 PM",
      },
    ],
  };

  const toursData = properties || fetchedTours || [staticTour];

  const singleTour = toursData && toursData.length > 0 ? toursData[0] : staticTour;
  const { userPath } = useCurrentUser();

  const address = singleTour?.propertyAddress;
  const truncatedAddress = address ? truncateText(address, 70) : 'sumit';

  return (
    <section>
      <Heading title="Upcoming Tour" className="mb-6 text-xl font-bold" />
      
      {isFetching ? (
        <RequestLoader />
      ) : Array.isArray(toursData) && toursData.length > 0 ? (
        <section>
          <section key={singleTour?.id || singleTour?._id} className="my-6">
            <TourSchedule
              address={truncatedAddress}
              date={singleTour?.events?.[0]?.eventDate}
              time={singleTour?.events?.[0]?.tourTime}
              showButton={showButton}
            />
          </section>

          <div className="flex items-center justify-end">
            <div>
              <Link href="/dashboard/seller/tours" className="text-[1.125rem]">
                View all
              </Link>
            </div>
          </div>
        </section>
      ) : (
        !isFetching && (
          <section className="my-6">
            <EmptySkeleton />
          </section>
        )
      )}
    </section>
  );
}

export default ToursList;
