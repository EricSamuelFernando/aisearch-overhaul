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
  // const isSmallScreen = useMediaQuery('(max-width: 768px)');
  // const isMediumScreen = useMediaQuery('(max-width: 992px)');
  // const slideSize = isSmallScreen
  //   ? '90%'          // reduced width on mobile
  //   : isMediumScreen
  //     ? '40%'
  //     : '33.3333%';

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const slideSize = isSmallScreen ? '90%' : '33.3333%';



  // Only show features matching the selected tab
  const filteredFeatures = features.filter(
    (feature) => feature.category === activeCategory
  );

  return (
    <section className="bg-[#FFF6EC] pt-20 px-4 sm:px-6 lg:px-24 overflow-x-hidden">
      <div className=" mx-auto text-center">
        {/* Heading */}
        <h2 className=" satoshi text-3xl sm:text-4xl font-semibold ">
          We Make It <span className="font-light">Easy</span>
        </h2>
        <p className="satoshi text-xs sm:text-sm text-[#8E8B8A] mb-12 max-w-[600px] mx-auto">
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
                backgroundColor: '#170800',   // dark container background
                borderRadius: '12px',          // rounded corners
                overflow: 'hidden',
                overflowX: 'auto',             // enable horizontal scrolling
                display: 'flex',
                width: '100%',                 // full width
                margin: '0 auto',
                padding: '4px',
                gap: '4px',
                scrollbarWidth: 'none',        // hide scrollbar for Firefox
                '&::-webkit-scrollbar': {
                  display: 'none',             // hide scrollbar for Chrome/Safari
                },
                '@media (min-width: 640px)': {
                  maxWidth: '380px',           // constrain width on larger screens
                },
              },


              control: ({ checked }: { checked: boolean }) => ({
                flex: '0 0 auto',              // don't shrink, allow scroll
                minWidth: '110px',             // minimum width for readability
                padding: '10px 16px',
                border: 'none !important',
                borderLeft: 'none !important',
                borderRight: 'none !important',
                borderTop: 'none !important',
                borderBottom: 'none !important',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                whiteSpace: 'nowrap',

                '@media (min-width: 640px)': {
                  flex: 1,                     // allow equal flex on larger screens
                  minWidth: 'auto',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                },

                // Active button (checked): Dark gray background with white text
                backgroundColor: checked ? '#323131' : 'transparent', // Transparent for inactive
                color: checked ? '#ffffff' : '#F0F0F0',           // White text for active, very light gray for inactive tabs (Technology & Transparency)

                borderRadius: '8px',  // Rounded corners
                position: 'relative',

                // Remove any borders or dividers
                '&::before': {
                  display: 'none !important',
                  content: 'none',
                },
                '&::after': {
                  display: 'none !important',
                  content: 'none',
                },

                // Remove any adjacent borders that create divider lines
                '& + &': {
                  borderLeft: 'none !important',
                  marginLeft: 0,
                },

                // Ensure proper spacing with gap
                margin: 0,

                // Hover effect - clear visibility for inactive tabs
                '&:hover': {
                  backgroundColor: checked
                    ? '#323131'
                    : '#323131',  // Dark gray background on hover for inactive tabs
                  color: '#ffffff !important', // Always white text on hover for better visibility
                  border: 'none !important',
                  fontWeight: 600, // Slightly bolder on hover for better visibility
                },

                // Target label text on hover
                '&:hover label': {
                  color: '#ffffff !important',
                  fontWeight: 600,
                },

                '&:hover .mantine-SegmentedControl-label': {
                  color: '#ffffff !important',
                  fontWeight: 600,
                },

                // Active focus state for accessibility
                '&:focus': {
                  backgroundColor: '#323131',
                  color: '#ffffff !important',
                  outline: 'none',
                  border: 'none !important',
                },

                // Rounded corners for the first and last buttons
                '&:first-of-type': {
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                  borderLeft: 'none !important',
                },

                '&:last-of-type': {
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderRight: 'none !important',
                },
              }),

              // Remove any indicator or divider elements
              indicator: {
                display: 'none !important',
              },

              label: {
                position: 'relative',
                border: 'none !important',
                color: 'inherit !important', // Inherit from control: white for active, #D9CFC2 for inactive (matching second image)
                transition: 'color 0.2s ease',
                '&::before': {
                  display: 'none !important',
                  content: 'none',
                },
                '&::after': {
                  display: 'none !important',
                  content: 'none',
                },
              },
            }}
          />
        </Container>


        {/* Carousel */}
        <Carousel
          slideSize={slideSize}
          align={isSmallScreen ? 'center' : 'start'}
          loop
          slideGap="lg"
          height={isSmallScreen ? 'auto' : 400}

          // withControls={!isSmallScreen}   // 👈 KEY LINE
          // nextControlIcon={<IconArrowNarrowRight size={36} stroke={1} />}
          // previousControlIcon={<IconArrowNarrowLeft size={36} stroke={1} />}

          withControls={false}

          styles={{
            root: {
              position: 'relative',
              width: '100%',
              marginTop: '32px',
              backgroundColor: isSmallScreen ? 'transparent' : undefined, // 👈 remove bg
            },

            controls: {
              position: 'relative',
              marginTop: '32px',
              justifyContent: 'flex-end',
              gap: 12,
              marginRight: isSmallScreen ? 0 : 20,
            },

            control: {
              padding: 8,
              width: 100,
              background: '#F5EBDF',
              border: 'none',
              boxShadow: 'none',
            },
          }}
        >

          {filteredFeatures.map((feature, index) => (
            <Carousel.Slide key={index}>
              <Paper
                bg="#F4E5D0"
                style={{
                  borderRadius: '14px',
                  padding: isSmallScreen ? '18px' : '60px', // 👈 slightly tighter
                  height: '100%',
                  maxWidth: isSmallScreen ? '320px' : '100%', // 👈 KEY LINE
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Group justify="center" mb="md">
                  {feature.icon}
                </Group>
                <h3 className="text-[18px] sm:text-[20px] font-semibold px-2 sm:px-6 mb-2 text-center">
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
