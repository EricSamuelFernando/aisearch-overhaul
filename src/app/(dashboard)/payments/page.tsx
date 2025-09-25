'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SearchInput } from '@/components/SearchInput';

const transactions = [
  {
    id: 'INV-9087',
    name: 'Disclosure Summary',
    amount: '$150.00',
    date: '06/09/2024',
    status: 'Paid',
  },
  {
    id: 'INV-5457',
    name: 'Agent Assisted Tour',
    amount: '$312.00',
    date: '12/10/2024',
    status: 'Failed',
  },
  {
    id: 'INV-7933',
    name: 'Advanced Analytics',
    amount: '$215.00',
    date: '28/11/2024',
    status: 'Pending',
  },
  {
    id: 'INV-2122',
    name: 'Offer Tool',
    amount: '$169.00',
    date: '20/12/2024',
    status: 'Paid',
  },
];

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <main className='mx-auto flex min-h-[90vh] flex-col bg-[#F4F9F5]'>
      <section className='px-12 py-10'>
        <h2 className='text-4xl font-bold'>Payments Invoice</h2>
      </section>

      <section className='flex w-full items-center justify-between overflow-hidden px-12'>
        <div className='w-full'>
          <SearchInput
            inputClassName='bg-transparent border border-[#707070] pl-3'
            className='w-[30%] rounded-lg border border-[#707070] bg-transparent px-8 py-2'
            label='Search file'
            placeholder='Search file'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select defaultValue='7days'>
          <SelectTrigger className='flex w-[230px] justify-between gap-2 space-x-5 overflow-hidden border border-[#707070] bg-transparent'>
            <CalendarDays />
            <SelectValue placeholder='Select period' className='' />
          </SelectTrigger>
          <SelectContent className='w-full overflow-hidden bg-[#F4F9F5]'>
            <SelectItem value='7days'>Last 7 days</SelectItem>
            <SelectItem value='30days'>Last 30 days</SelectItem>
            <SelectItem value='90days'>Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <div className='pt-10'>
        <Table>
          <TableHeader>
            <TableRow className='px-12'>
              <TableHead className='pl-12'>Transaction ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='pr-12'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='px-12'>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className='group font-medium transition-colors hover:cursor-pointer hover:bg-[#E8804C] hover:text-white'
              >
                <TableCell className='px-12'>{transaction.id}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-sm transition-colors ${
                      transaction.status === 'Paid'
                        ? 'text-green-600 group-hover:text-white'
                        : transaction.status === 'Failed'
                          ? 'text-red-600 group-hover:text-white'
                          : 'text-orange-600 group-hover:text-white'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>
                  <button className='rounded-full border-2 border-black px-5 py-1 transition-colors group-hover:border-white hover:text-white'>
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default PaymentsPage;
