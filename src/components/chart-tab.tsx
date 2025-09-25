'use client';

import { LineChart } from '@/components/line-chart';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const tabList = [
  { tab: 'statistics', value: '$268,000', title: 'Average Sale Price' },
  { tab: 'messages', value: '6', title: 'Homes Sold' },
  { tab: 'settings', value: '107.3%', title: 'Sale-to-list' },
];

export function PropertyOverviewChart() {
  const [activeTab, setActiveTab] = useState<string>('statistics');

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case 'statistics':
        return <LineChart
          labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
          datasets={[
            {
              label: 'Average Sale Price',
              data: [250000, 270000, 260000, 280000, 300000, 268000],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              fill: true,
            },
          ]}
        />;
      case 'messages':
        return <p>Home content</p>;
      case 'settings':
        return <p>Sales content</p>;
      default:
        return null;
    }
  };

  return (
    <section className="">
      <div className="grid grid-cols-3 border-b border-gray-300">
        {tabList.map(({ tab, value, title }) => (
          <TabStatHeader
            key={tab}
            value={value}
            title={title}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      <div className="min-h-[300px] w-full pt-6">{renderTabPanel(activeTab)}</div>
    </section>
  );
}

type HeaderProps = {
  active?: boolean;
  title: React.ReactNode;
  value: React.ReactNode;
  onClick: () => void;
};

const TabStatHeader = ({ active, value, title, onClick }: HeaderProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer px-4 py-3 text-center transition-colors duration-200',
        active ? 'border-b-2 border-black bg-gray-100' : 'hover:bg-gray-50'
      )}
    >
      <h2 className="text-lg font-semibold">{value}</h2>
      <span className="text-sm text-gray-500">{title}</span>
    </div>
  );
};
