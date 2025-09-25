'use client';

import { Table } from '@mantine/core';
import React from 'react';

const schoolData = [
  {
    city: 'Aurora',
    enrollment: 1398,
    grades: '6-8',
    levels: {
      elementary: null,
      high: null,
      middle: true,
      preschool: null,
    },
    location: 'POINT(-104.680977 39.591221)',
    name: 'Fox Ridge Middle School',
    parentRating: 3,
    rating: 6,
    state: 'CO',
    street: '26301 East Arapahoe Road',
    type: 'Public',
    zip: '80016',
  },
  {
    city: 'Aurora',
    enrollment: 722,
    grades: 'PK-5',
    levels: {
      elementary: true,
      high: null,
      middle: null,
      preschool: true,
    },
    location: 'POINT(-104.702774 39.591427)',
    name: 'Coyote Hills Elementary School',
    parentRating: 5,
    rating: 6,
    state: 'CO',
    street: '24605 East Davies Way',
    type: 'Public',
    zip: '80016',
  },
  {
    city: 'Aurora',
    enrollment: 2950,
    grades: '9-12',
    levels: {
      elementary: null,
      high: true,
      middle: null,
      preschool: null,
    },
    location: 'POINT(-104.685493 39.591549)',
    name: 'Cherokee Trail High School',
    parentRating: 4,
    rating: 7,
    state: 'CO',
    street: '25901 East Arapahoe Road',
    type: 'Public',
    zip: '80016',
  },
];

// Helper to convert data into table format

export function BuyTable(props:any) {
  console.log("Table data : ",props);
  const tableData = {
    head: ['School Name', 'Type', 'Grade', 'Street', 'City', 'Rating'],
    body: props.tableData.map((school:any) => [
      school.name,
      school.type,
      school.grades,
      school.street,
      school.city,
      `${school.rating}/10`,
    ]),
  };
  
  return (
    <Table
      data={tableData}
      striped
      withTableBorder
      withRowBorders
      className="w-full"
      highlightOnHover
    />
  );
}

export default BuyTable;
