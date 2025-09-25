'use client';

import React, { useState } from 'react';
import { Carousel } from '@mantine/carousel';
import {
  Paper,
  Text,
  Group,
  Container,
  Title,
  SegmentedControl,
} from '@mantine/core';
import {
  FaComment,
  FaClock,
  FaConciergeBell,
  FaLaptop,
  FaChartLine,
  FaLock,
} from 'react-icons/fa';
import { useMediaQuery } from '@mantine/hooks';

import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import Image from 'next/image';
import guidline from '../../../public/assets/icons/Guided.svg';
import reduced from '../../../public/assets/icons/Reduced.svg';
import concierge from '../../../public/assets/icons/Concierge.svg';
import { IconArrowLeft, IconArrowNarrowLeft, IconArrowNarrowRight, IconArrowRight } from '@tabler/icons-react';

const features = [
  // TRANSACTION category
  {
    category: 'Transaction',
    icon: <Image src={guidline} alt="Guided Transactions" width={50} height={50} />,
    title: 'Guided transactions',
    description:
      'Gain unprecedented control with guided transactions, approval workflows, task tracking, and comprehensive closing services.',
  },
  {
    category: 'Transaction',
    icon: <Image src={reduced} alt="Guided Transactions" width={50} height={50} />,
    title: 'Reduced time for task completion',
    description:
      'Our platform increases task efficiency by 50%, saving 30% on routine tasks and 80% on complex ones.',
  },
  {
    category: 'Transaction',
    icon: <Image src={concierge} alt="Guided Transactions" width={50} height={50} />,
    title: 'Concierge services',
    description:
      'Track interior design, remodeling, renovation, landscaping, and moving with our Concierge Services feature.',
  },
  {
    category: 'Transaction',
    icon: <FaComment size={40} color="#FF6A13" />,
    title: 'Guided transactions',
    description:
      'Gain unprecedented control with guided transactions, approval workflows, task tracking, and comprehensive closing services.',
  },
  {
    category: 'Transaction',
    icon: <FaClock size={40} color="#FF6A13" />,
    title: 'Reduced time for task completion',
    description:
      'Our platform increases task efficiency by 50%, saving 30% on routine tasks and 80% on complex ones.',
  },
  {
    category: 'Transaction',
    icon: <FaConciergeBell size={40} color="#FF6A13" />,
    title: 'Concierge services',
    description:
      'Track interior design, remodeling, renovation, landscaping, and moving with our Concierge Services feature.',
  },

  // TECHNOLOGY category
  {
    category: 'Technology',
    icon: <FaLaptop size={40} color="#FF6A13" />,
    title: 'AI‐powered recommendations',
    description:
      'Our AI engine analyzes market data in real time to suggest best‐fit listings and financing options.',
  },
  {
    category: 'Technology',
    icon: <FaChartLine size={40} color="#FF6A13" />,
    title: 'Live analytics dashboard',
    description:
      'See up‐to‐the‐minute market trends, monitor your home’s value, and track your savings goals in one place.',
  },
  {
    category: 'Technology',
    icon: <FaLock size={40} color="#FF6A13" />,
    title: 'Secure document storage',
    description:
      'All your contracts and disclosures are encrypted and stored on our platform—accessible from anywhere.',
  },
  {
    category: 'Technology',
    icon: <FaChartLine size={40} color="#FF6A13" />,
    title: 'Live analytics dashboard',
    description:
      'See up‐to‐the‐minute market trends, monitor your home’s value, and track your savings goals in one place.',
  },
  {
    category: 'Technology',
    icon: <FaLock size={40} color="#FF6A13" />,
    title: 'Secure document storage',
    description:
      'All your contracts and disclosures are encrypted and stored on our platform—accessible from anywhere.',
  },

  // TRANSPARENCY category
  {
    category: 'Transparency',
    icon: <FaComment size={40} color="#FF6A13" />,
    title: 'Clear fee breakdowns',
    description:
      'No hidden costs. We show you every fee, every commission, and every closing cost in plain English.',
  },
  {
    category: 'Transparency',
    icon: <FaClock size={40} color="#FF6A13" />,
    title: 'Real‐time status updates',
    description:
      'Know exactly where you stand in your transaction—no more guessing or waiting for status emails.',
  },
  {
    category: 'Transparency',
    icon: <FaConciergeBell size={40} color="#FF6A13" />,
    title: 'Open communication channels',
    description:
      'Message, call, or video‐chat your agent, lender, and closing coordination team all from one dashboard.',
  },
  {
    category: 'Transparency',
    icon: <FaClock size={40} color="#FF6A13" />,
    title: 'Real‐time status updates',
    description:
      'Know exactly where you stand in your transaction—no more guessing or waiting for status emails.',
  },
  {
    category: 'Transparency',
    icon: <FaConciergeBell size={40} color="#FF6A13" />,
    title: 'Open communication channels',
    description:
      'Message, call, or video‐chat your agent, lender, and closing coordination team all from one dashboard.',
  },
];

const WeMakeItEasy = () => {
  const [activeCategory, setActiveCategory] = useState('Transaction');

  // Responsive breakpoints for slide size
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const isMediumScreen = useMediaQuery('(max-width: 992px)');
  const slideSize = isSmallScreen
    ? '100%'
    : isMediumScreen
      ? '50%'
      : '33.3333%';

  // Only show features matching the selected tab
  const filteredFeatures = features.filter(
    (feature) => feature.category === activeCategory
  );

  return (
    <section className="bg-[#FAF0E6]  pt-32 pl-24">
      <div className=" mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-medium ">
          We Make It <span className="font-normal">Easy</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-12 max-w-[600px] mx-auto">
          Tailor your homebuying experience — your way, with the guidance you need.
        </p>

        {/* SegmentedControl (three tabs styled like the first screenshot) */}
        <Container size="sm" className='mb-20' px={0} >
  <SegmentedControl
    value={activeCategory}
    onChange={setActiveCategory}
    color='#323131'
    
    data={[
      { label: 'Transaction', value: 'Transaction' },
      { label: 'Technology', value: 'Technology' },
      { label: 'Transparency', value: 'Transparency' },
    ]}
    radius="12px"
    size="md"
    styles={{
      
      root: {
        backgroundColor: '#170800',   // dark-brown for the background
        borderRadius: '12px',          // rounded corners
        overflow: 'hidden',
        display: 'flex',
        width: 380,                    // fixed width
        maxWidth: '100%',              // prevents overflow on mobile
        margin: '0 auto',
      },
      

      control: ({ checked }: { checked: boolean }) => ({
        flex: 1,
        padding: '8px 24px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',

        // Active button (checked): Background color updated to #323131
        backgroundColor: checked ? '#323131' : 'green', // #323131 for active
        color: checked ? '#ffffff' : '#D9CFC2',           // White text for active, light beige for inactive

        borderRadius: 0,  // The pill's edges are handled by root’s radius
        position: 'relative',

        // Hover effect: a faint white background for inactive buttons
        '&:hover': {
          backgroundColor: checked
            ? '#323131' // active stays #323131
            : 'rgba(255, 255, 255, 0.1)', // inactive gets a faint white hover effect
        },

        // Rounded corners for the first and last buttons
        '&:first-of-type': {
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
        },

        '&:last-of-type': {
          borderTopRightRadius: '12px',
          borderBottomRightRadius: '12px',
        },

        // White divider line between the second and third buttons
        '&:nth-of-type(2):after': {
          content: "''",
          position: 'absolute',
          top: '15%',
          right: 0,
          width: 1,
          height: '70%',
          backgroundColor: '#170800', // White divider
        },
      }),
    }}
  />
</Container>


        {/* Carousel */}
        <Carousel
          
          slideSize="36%"
          align="start"
          loop
          slideGap="lg"
          height={400}
          nextControlIcon={<IconArrowNarrowRight size={36} stroke={1} />}
          previousControlIcon={<IconArrowNarrowLeft size={36} stroke={1} />}
          
          styles={{
            root: { position: 'relative', width: '100%' , marginTop:'32px' },

            controls: {
              position: 'relative',
              marginTop: '32px',
              justifyContent: 'flex-end',
              gap:12,
              marginRight:20

            },
            control:{
              padding:8,
              width:100,
              background:'#F5EBDF',
              border:'none',
              boxShadow:'none'
              
            }
            

          

           
          }}
        >
          {filteredFeatures.map((feature, index) => (
            <Carousel.Slide key={index}>
              <Paper
                bg="#F4E5D0"
                style={{
                  borderRadius: '16px',
                  padding: '60px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Group justify="center" mb="md">
                  {feature.icon}
                </Group>
                <h3 className="text-[20px] font-bold px-[80px] mb-2">
                  {feature.title}
                </h3>
                <Text size="md" color="#707070" ta="center">
                  {feature.description}
                </Text>
              </Paper>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export { WeMakeItEasy };
