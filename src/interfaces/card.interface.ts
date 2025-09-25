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

export interface DivAttributes extends React.HTMLAttributes<HTMLDivElement> {}

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

export type ChooseYourMeansCardProps = {
  id: string;
  imagePath: string | StaticImageData;
  title: string;
  description: string;
  linkPathname: string;
  buttonTitle?: string;
};

export type SectionKey = 'transaction' | 'technology' | 'transparency';

export type WeMakeItEasyComponentProps = {
  [key in SectionKey]: WeMakeItEasySectionData[];
};

export type WeMakeItEasySectionData = {
  Icon: string;
  title: string;
  description: string;
};
