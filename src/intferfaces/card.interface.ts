import { type StaticImageData } from 'next/image';
import React from 'react';

export interface ICardProps {
  title: string;
  description: string;
  imagePath: string | StaticImageData;
}

type PropertyFeature = {
  Icon: any;
  detail: string;
};

interface DivAttributes extends React.HTMLAttributes<HTMLDivElement> {}

export interface PropertyCardProp extends DivAttributes {
  imageSrc?: string | StaticImageData;
  address: string;
  price: string;
  currency: string;
  features?: PropertyFeature[];
  infoCard?: React.ReactNode;
}

export type InfoCardProp = {
  className?: string;
  title?: string;
};
