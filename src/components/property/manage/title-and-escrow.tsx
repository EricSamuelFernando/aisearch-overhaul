import React from 'react';
import { TitleAndEscrowCard } from '@/components/property/title-and-escrow-card';
import { Button } from '@/components/ui/button';
import { AddSignatory } from '@/components/property/manage/add-signatory';
import { useSelector } from 'react-redux';

type Props = {};

function TitleAndEscrow({ }: Props) {
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty);
  return (
    <section>
      <AddSignatory />
      <TitleAndEscrowCard
        title="Buyer Details"
        firstName={engagedProperty?.user?.firstName}
        lastName={engagedProperty?.user?.lastName}
        email={engagedProperty?.user?.email}
        phone={engagedProperty?.user?.phone}
        middleName={engagedProperty?.user?.middleName||"NA"}
      />
      {
        engagedProperty?.coBuyers?.length ? <>
          {engagedProperty?.coBuyers?.map((data: any) =>
            <>
              <br />
              <TitleAndEscrowCard
                title="Co Buyer Details"
                firstName={data?.firstName}
                lastName={data?.lastName}
                email={data?.email}
                phone={data?.phone}
                middleName={data?.middleName||"NA"}
              />
            </>
          )}
        </> : <></>
      }
    </section>
  );
}

export default TitleAndEscrow;
