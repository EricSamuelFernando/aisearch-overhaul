"use client";
import React from "react";
import { Badge } from "@mantine/core";
import { useGetAllUserPropertyOffers } from "@/hooks/api/agent/useAgentProperty";
import { useParams } from "next/navigation";

type Offer = {
  id?: string;
  user?: any;
  status?: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  price?: number;
  financeType?: string;
  downPayment?: number;
  cashAmount?: number;
  isBuyer?: boolean;
};

type Props = {
  /** how many offers to show. If omitted, shows all */
  limit?: number;

};

export default function CreateUserOffers({ limit  }: Props) {
  const params = useParams()
  const { propertyId } = useParams<{ propertyId: string }>();

  const { data, error, isLoading } = useGetAllUserPropertyOffers(propertyId);

  const offers: Offer[] = React.useMemo(() => {
    const items = Array.isArray(data) ? (data as Offer[]) : [];
    return typeof limit === "number" ? items.slice(0, Math.max(0, limit)) : items;
  }, [data, limit]);

  if (isLoading) return <p className="text-sm text-gray-500">Loading offers…</p>;
  if (error) return <p className="text-sm text-red-600">Failed to load offers.</p>;
  if (!offers.length) return <p className="text-sm text-gray-500">No offers yet.</p>;

  return (
    <div className="mt-2 sm:mt-4 lg:mt-6">
      <p className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-4 lg:mb-6 font-bold">
        Offers By You
      </p>

      <div className="flex w-full overflow-x-auto gap-2 sm:gap-3 lg:gap-4">
        {offers.map((offer, idx) => {
          const { status, price, financeType, downPayment, cashAmount } = offer;

          return (
            <aside
              key={offer.id ?? idx}
              className="h-max w-full max-w-[20rem] sm:max-w-[22rem] lg:max-w-[24rem] min-w-[16rem] sm:min-w-[18rem] rounded-lg sm:rounded-xl lg:rounded-[1.25rem] bg-[#F8F8F8] pb-4 sm:pb-6 lg:pb-8"
            >
              <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                <Badge
                  color={
                    status === "PENDING"
                      ? "orange"
                      : status === "ACCEPTED"
                      ? "green"
                      : status === "REJECTED"
                      ? "red"
                      : "gray"
                  }
                >
                  {status ?? "UNKNOWN"}
                </Badge>
              </div>

              <section className="grid grid-cols-2 text-sm sm:text-base lg:text-lg items-start gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-8 pt-0">
                <div className="col-span-1 flex flex-col justify-between">
                  <p className="text-capitalize text-grey-70 text-xs sm:text-sm">Offer Price</p>
                  <p className="text-capitalize my-0 p-0 text-sm sm:text-lg lg:text-xl font-bold leading-tight sm:leading-6 text-black">
                    {(price ?? 30000).toLocaleString("en-US")}
                  </p>
                </div>

                <div className="col-span-1 flex h-full flex-col justify-between">
                  <p className="text-capitalize text-grey-70 text-xs sm:text-sm">Finance Type</p>
                  <p className="text-capitalize text-xs sm:text-sm lg:text-base font-bold text-black">
                    {financeType ?? "Cash"}
                  </p>
                </div>

                <div className="col-span-1 flex h-full flex-col justify-between">
                  <p className="text-capitalize text-grey-70 text-xs sm:text-sm">Down Payment</p>
                  <p className="text-capitalize text-xs sm:text-sm lg:text-base font-bold text-black">
                    {(downPayment ?? 0).toLocaleString("en-US")}
                  </p>
                </div>

                <div className="col-span-1 flex h-full flex-col justify-between">
                  <p className="text-capitalize text-grey-70 text-xs sm:text-sm">Cash Amount</p>
                  <p className="text-capitalize text-xs sm:text-sm lg:text-base font-bold text-black">
                    {(cashAmount ?? 0).toLocaleString("en-US")}
                  </p>
                </div>
              </section>
            </aside>
          );
        })}
      </div>
    </div>
  );
}
