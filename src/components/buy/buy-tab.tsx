// 'use client';

// import { PropertyOverviewChart } from '@/components/chart-tab';
// import { cn } from '@/lib/utils';
// import { DonutChart } from '@mantine/charts';
// import { useState, useEffect } from 'react';
// import CustomInput from '@/components/customs/input';

// export const data = [
//   { name: 'Principal & Interest', value: 400, color: '#F4B400' },  
//   { name: 'Property Tax', value: 300, color: '#FF5722' },        
//   { name: 'HOA Fees', value: 100, color: '#FF9800' },             
//   { name: 'Insurance', value: 200, color: '#795548' },          
//   { name: 'Utilities', value: 100, color: '#9E9E9E' },        
// ];

// const tablsit = [
//   { title: 'Statistics', value: 'statistics' },
//   { title: 'Property Projections', value: 'projection' },
//   { title: 'Payment Calculation', value: 'payment' },
// ];

// export function BuyTab() {
//   const [activeTab, setActiveTab] = useState<string>('statistics');

//   const renderTabPanel = (tabValue: string) => {
//     switch (tabValue) {
//       case 'statistics':
//         return <Statistics />;
//       case 'projection':
//         return <p>Property Projection</p>;
//       case 'payment':
//         return 'Payment Calculator';
//       default:
//         return <Statistics />;
//     }
//   };

//   return (
//     <section>
//       <div className='grid grid-cols-3 border-grey-400'>
//         {tablsit.map((item) => (
//           <button
//             key={item.value}
//             onClick={() => setActiveTab(item.value)}
//             className={cn(
//               'col-span-1 w-max text-center transition-all ease-in-out',
//               activeTab === item.value
//                 ? 'border-b-2 border-b-black'
//                 : 'border-none',
//             )}
//           >
//             {item.title}
//           </button>
//         ))}
//       </div>

//       <section className=' py-8'>
//         {renderTabPanel(activeTab)}
//       </section>
//     </section>
//   );
// }

// export const Statistics = () => {
//   const [homePrice, setHomePrice] = useState(0);
//   const [downPayment, setDownPayment] = useState(0);
//   const [interestRate, setInterestRate] = useState(0);
//   const [loanPeriod, setLoanPeriod] = useState(30); // Default to 30 years
//   const [monthlyPayment, setMonthlyPayment] = useState(0);
//   const [calculated, setCalculated] = useState(false);

//   return (
//     <div className='py-4'>
//       <PropertyOverviewChart />

//       <div className='pt-20'>
//         <h2 className='mb-5 text-xl font-bold text-black'>Price Calculatorhh</h2>
//         <div>
//           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//             <div className='flex-1'>
//               <CustomInput
//                 leftSectionPointerEvents='none'
//                 leftSection={'$'}
//                 label='Home Price'
//                 labelClass='text-black !mb-2 !font-bold'
//                 value={homePrice}
//                 onChange={(e) => setHomePrice(parseFloat(e.target.value))}
//                 type="number"
//               />

//               <CustomInput
//                 leftSectionPointerEvents='none'
//                 rightSectionPointerEvents='none'
//                 leftSection={'$'}
//                 rightSection={'%'}
//                 label='Down Payment'
//                 labelClass='text-black !mb-2 !font-bold'
//                 value={downPayment}
//                 onChange={(e) => setDownPayment(parseFloat(e.target.value))}
//                 type="number"
//               />

//               <CustomInput
//                 rightSectionPointerEvents='none'
//                 rightSection={'%'}
//                 label='Interest Rate'
//                 labelClass='text-black !mb-2 !font-bold'
//                 value={interestRate}
//                 onChange={(e) => setInterestRate(parseFloat(e.target.value))}
//                 type="number"
//               />

//               <CustomInput
//                 label='Loan Period ( Years )'
//                 labelClass='text-black !mb-2 !font-bold'
//                 value={loanPeriod}
//                 onChange={(e) => setLoanPeriod(parseInt(e.target.value, 10))}
//                 type="number"
//               />
//             </div>

//             <div className='flex-1'>
//               <DonutChart
//                 data={data}
//                 tooltipDataSource='segment'
//                 mx='auto'
//                 size={200}
//                 strokeWidth={0}
//                 thickness={30}
//               />
//               {calculated && (
//                 <div className='mt-4 text-center'>
//                   <h4 className='text-2xl font-bold text-black'>${monthlyPayment.toFixed(2)}</h4>
//                   <span className='text-base text-black'>Est. Payment /month</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* <div className='mt-6 text-center'>
//             <button
//               onClick={calculatePayment}
//               className='bg-black text-white py-2 px-6 rounded-full hover:bg-yellow-500 transition duration-300'
//             >
//               Calculate
//             </button>
//           </div> */}
//         </div>
//       </div>

//       {/* Payment Breakdown Labels */}
//       <div className='flex justify-center space-x-8 mt-6'>
//         {data.map((item) => (
//           <div key={item.name} className='flex items-center space-x-2'>
//             <div
//               className='w-4 h-4 rounded-full'
//               style={{ backgroundColor: item.color }}
//             ></div>
//             <span className='text-sm text-gray-700'>{item.name}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


'use client';

import { PropertyOverviewChart } from '@/components/chart-tab';
import { cn } from '@/lib/utils';
import { DonutChart, LineChart } from '@mantine/charts';
import { useState, useEffect } from 'react';
import CustomInput from '@/components/customs/input';
import axios from 'axios';
import { Button, Group, Select, Tabs } from '@mantine/core';


export const data = [
  { name: 'Principal & Interest', value: 400, color: '#F4B400' },
  { name: 'Property Tax', value: 300, color: '#FF5722' },
  { name: 'HOA Fees', value: 100, color: '#FF9800' },
  { name: 'Insurance', value: 200, color: '#795548' },
  { name: 'Utilities', value: 100, color: '#9E9E9E' },
];

const tablsit = [
  { title: 'Statistics', value: 'statistics' },
  { title: 'Property Projections', value: 'projection' },
  { title: 'Payment Calculation', value: 'payment' },
];

export function BuyTab() {
  const [activeTab, setActiveTab] = useState<string>('statistics');

  const renderTabPanel = (tabValue: string) => {
    switch (tabValue) {
      case 'statistics':
        return <Statistics />;
      case 'projection':
        return <p>Property Projection</p>;
      case 'payment':
        return <PaymentCalculator />;
      default:
        return <Statistics />;
    }
  };

  return (
    <section>
      <div className='grid grid-cols-3 border-grey-400'>
        {tablsit.map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={cn(
              'col-span-1 w-max text-center transition-all ease-in-out',
              activeTab === item.value
                ? 'border-b-2 border-b-black'
                : 'border-none',
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      <section className=' py-8'>
        {renderTabPanel(activeTab)}
      </section>
    </section>
  );
}

export const Statistics = () => {
  const [homePrice, setHomePrice] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [loanPeriod, setLoanPeriod] = useState(30); // Default to 30 years
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [calculated, setCalculated] = useState(false);

  return (
    <div className='py-4'>
      <PropertyOverviewChart />

      <div className='pt-20'>
        <h2 className='mb-5 text-xl font-bold text-black'>Price Calculator</h2>
        <div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex-1'>
              <CustomInput
                leftSectionPointerEvents='none'
                leftSection={'$'}
                label='Home Price'
                labelClass='text-black !mb-2 !font-bold'
                value={homePrice}
                onChange={(e) => setHomePrice(parseFloat(e.target.value))}
                type="number"
              />

              <CustomInput
                leftSectionPointerEvents='none'
                rightSectionPointerEvents='none'
                leftSection={'$'}
                rightSection={'%'}
                label='Down Payment'
                labelClass='text-black !mb-2 !font-bold'
                value={downPayment}
                onChange={(e) => setDownPayment(parseFloat(e.target.value))}
                type="number"
              />

              <CustomInput
                rightSectionPointerEvents='none'
                rightSection={'%'}
                label='Interest Rate'
                labelClass='text-black !mb-2 !font-bold'
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                type="number"
              />

              <CustomInput
                label='Loan Period ( Years )'
                labelClass='text-black !mb-2 !font-bold'
                value={loanPeriod}
                onChange={(e) => setLoanPeriod(parseInt(e.target.value, 10))}
                type="number"
              />
            </div>

            <div className='flex-1'>
              <DonutChart
                data={data}
                tooltipDataSource='segment'
                mx='auto'
                size={200}
                strokeWidth={0}
                thickness={30}
              />
              {calculated && (
                <div className='mt-4 text-center'>
                  <h4 className='text-2xl font-bold text-black'>${monthlyPayment.toFixed(2)}</h4>
                  <span className='text-base text-black'>Est. Payment /month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Breakdown Labels */}
      <div className='flex justify-center space-x-8 mt-6'>
        {data.map((item) => (
          <div key={item.name} className='flex items-center space-x-2'>
            <div
              className='w-4 h-4 rounded-full'
              style={{ backgroundColor: item.color }}
            ></div>
            <span className='text-sm text-gray-700'>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


export function PaymentCalculator() {
  const [formData, setFormData] = useState({
    listing_id: '',
    property_id: '',
    property_value: '',
    downpayment: '',
    loan_amount: '',
    credit_score: '',
    income_stability: '',
    loan_term: '15',
    loan_type: 'Conventional',
    employment_type: 'W-2 Employee',
    property_type: 'Primary Residence',
    property_state: 'MA',
    dti_ratio: '',
    location_risk: 'Medium',
    reserves_months: '',
    loan_purpose: '',
    buydown_points: '',
    debt_credit_cards: '',
    debt_auto_loans: '',
    debt_student_loans: '',
    // property_address: '',
    user_id: '',
  });

  const [forecastDates, setForecastDates] = useState<string[]>([]);
  const [forecastRates, setForecastRates] = useState<number[]>([]);
  const [finalForecastRates, setFinalForecastRates] = useState<number[]>([]);
  const [baseHistoricalDates, setBaseHistoricalDates] = useState<string[]>([]);
  const [baseHistoricalRates, setBaseHistoricalRates] = useState<number[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [listingOptions, setListingOptions] = useState<{ value: string; label: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>('base');
  const [calcResult, setCalcResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);


  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const propertyValue = parseFloat(field === 'property_value' ? value : prev.property_value) || 0;
      const downpayment = parseFloat(field === 'downpayment' ? value : prev.downpayment) || 0;
      updated.loan_amount = (propertyValue - downpayment).toFixed(2);
      return updated;
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('userDetails');
    const listingId = localStorage.getItem('listingId');
    const propertyId = localStorage.getItem('propertyId');
    const propertyType = localStorage.getItem('propertyType');
    const propertyState = localStorage.getItem('propertyState');
    const stateOrProvince = localStorage.getItem('stateOrProvince');
    const propertyAddress = localStorage.getItem('propertyAddress');
    const propertyAddress1 = localStorage.getItem('propertyAddress1');
    const propertyAddress2 = localStorage.getItem('propertyAddress2');
    const listPrice = localStorage.getItem('listPrice');

    const fullAddress = [propertyAddress, propertyAddress1, propertyAddress2].filter(Boolean).join(', ');
    const fullLabel = [propertyAddress, propertyAddress1, propertyAddress2, stateOrProvince].filter(Boolean).join(', ');

    setListingOptions([{ value: listingId || '', label: fullLabel || '— no address set —' }]);

    let userId = '';
    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser?.id || '';
      }
    } catch (err) {
      console.error('Error parsing userDetails:', err);
    }

    setFormData(prev => ({
      ...prev,
      user_id: userId,
      listing_id: listingId || '',
      property_id: propertyId || '',
      property_type: propertyType || 'Primary Residence',
      property_state: propertyState || '',
      // property_address: fullAddress,
      property_value: listPrice || '',
    }));
  }, []);

  const handleCalculate = async () => {
    const requiredFields = ['user_id', 'property_id', 'listing_id', 'property_value', 'reserves_months', 'loan_purpose'];
    const missing = requiredFields.filter(f => !(formData as Record<string, any>)[f]);

    if (missing.length > 0) {
      alert(`Missing required fields: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);


    const requestData = {
      user_id: formData.user_id,
      property_id: formData.property_id,
      listing_id: formData.listing_id,
      // property_address: formData.property_address,
      downpayment: Number(formData.downpayment),
      loan_amount: Number(formData.loan_amount),
      property_value: Number(formData.property_value),
      property_type: formData.property_type?.toLowerCase().replace(/\s/g, '_'),
      state: formData.property_state,
      location_risk: formData.location_risk?.toLowerCase(),
      credit_score: formData.credit_score,
      income_stability_years: formData.income_stability,
      loan_term_years: formData.loan_term,
      dti_ratio: formData.dti_ratio || '0.36',
      buydown_points: formData.buydown_points || '0',
      employment_type: formData.employment_type?.toLowerCase().split(' ')[0] || 'w2',
      loan_type: formData.loan_type?.toLowerCase() || 'conventional',
      reserves_months: formData.reserves_months || '3',
      loan_purpose: formData.loan_purpose?.toLowerCase() || 'purchase',
    };

    try {
      const res = await axios.post('https://rate-predictor.snaphomz.duckdns.org/api/calculate_rate', requestData);

      const baseForecast = res.data?.base_rate_forecast?.forecast || {};
      const baseHistorical = res.data?.base_rate_forecast?.historical || {};

      setForecastDates([...baseHistorical.dates, ...baseForecast.dates]);
      setForecastRates([...baseHistorical.rates, ...baseForecast.rates]);
      setBaseHistoricalDates(baseHistorical.dates || []);
      setBaseHistoricalRates(baseHistorical.rates || []);

      setFinalForecastRates(res.data?.final_rate_forecast?.rates || []);
      setCalcResult(res.data?.calc_result || null);
    } catch (err) {
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-black">Mortgage Rate Forecast</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Choose Listing" placeholder="Select listing" data={listingOptions} value={formData.listing_id} onChange={value => handleChange('listing_id', value || '')} />
        <CustomInput label="Property Value ($)" value={formData.property_value} onChange={e => handleChange('property_value', e.currentTarget.value)} />
        <CustomInput label="Down-payment ($)" type="number" value={formData.downpayment} onChange={e => handleChange('downpayment', e.target.value)} leftSection="$" />
        <CustomInput label="Loan Amount ($) optional" type="number" value={formData.loan_amount} onChange={e => handleChange('loan_amount', e.target.value)} leftSection="$" />
        <CustomInput label="Credit Score (300-850)" type="number" value={formData.credit_score} onChange={e => handleChange('credit_score', e.target.value)} />
        <CustomInput label="Income Stability (years)" type="number" value={formData.income_stability} onChange={e => handleChange('income_stability', e.target.value)} />
        <Select label="Loan Term (years)" data={[{ value: '15', label: '15' }, { value: '20', label: '20' }, { value: '25', label: '25' }, { value: '30', label: '30' }, { value: '35', label: '35' }]} value={formData.loan_term} onChange={value => handleChange('loan_term', value || '')} />
        <Select label="Loan Type / Program" data={[{ value: 'Conventional', label: 'Conventional' }, { value: 'FHA', label: 'FHA' }, { value: 'VA', label: 'VA' }, { value: 'USDA', label: 'USDA' }, { value: 'Jumbo', label: 'Jumbo' }]} value={formData.loan_type} onChange={value => handleChange('loan_type', value || '')} />
        <Select label="Employment Type" data={[{ value: 'w2', label: 'W-2 Employee' }, { value: 'self_employed', label: 'Self-Employed / 1099' }]} value={formData.employment_type} onChange={value => handleChange('employment_type', value || '')} />
        <Select label="Property Type" data={[{ value: 'Primary Residence', label: 'Primary Residence' }, { value: 'Second Home', label: 'Second Home' }, { value: 'Investment', label: 'Investment' }]} value={formData.property_type} onChange={value => handleChange('property_type', value || '')} />
        <CustomInput label="Property State" value={formData.property_state} onChange={e => handleChange('property_state', e.currentTarget.value)} />
      </div>

      <Group>
        <Button variant="outline" size="xs" onClick={() => setShowAdvanced(prev => !prev)}>Advanced Options</Button>
      </Group>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput label="Reserves (months)" type="number" value={formData.reserves_months} onChange={e => handleChange('reserves_months', e.target.value)} />
          <Select label="Loan Purpose" data={[{ value: 'purchase', label: 'Purchase' }, { value: 'refinance', label: 'Refinance' }]} value={formData.loan_purpose} onChange={value => handleChange('loan_purpose', value || '')} />
        </div>
      )}

      {loading && <div className="text-center">Loading...</div>}
      <Button fullWidth onClick={handleCalculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Rate & See Forecast'}
      </Button>

      {calcResult && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-2">Adjustment Breakdown for Today’s Rate</h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {Object.entries(calcResult.adjustments || {}).map(([label, value], index) => {
              const rate = value as number;
              return <li key={index}>{label}: {rate >= 0 ? '+' : ''}{rate.toFixed(3)} %</li>;
            })}
          </ul>
        </div>
      )}

      {forecastDates.length > 0 && forecastRates.length > 0 && (
        <div className="mt-6">
          <Tabs value={activeTab} onChange={(value) => { if (value !== null) setActiveTab(value); }}>
            <Tabs.List>
              <Tabs.Tab value="base">Calculate Rate Today</Tabs.Tab>
              <Tabs.Tab value="final">View Market Rates</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="base" pt="xs">
              {calcResult && (
                <div className="space-y-3 mt-6">
                  <div className="bg-green-100 text-green-900 px-4 py-3 rounded border border-green-300">
                    <div><strong>Final Rate Today:</strong> {calcResult.final_rate.toFixed(2)} %</div>
                    <div><strong>Base Rate Today:</strong> {calcResult.base_rate.toFixed(2)} % <span className="text-gray-500 text-sm">(as of {calcResult.as_of})</span></div>
                  </div>
                  <div className="bg-blue-100 text-blue-900 px-4 py-3 rounded border border-blue-300">
                    <strong>Estimated Monthly Payment:</strong> ${calcResult.monthly_payment.toFixed(2)}
                  </div>
                </div>
              )}

              <h4 className="text-md font-semibold mt-4 mb-2">Your Personalized 2-Year Rate Forecast</h4>
              <p className="text-sm text-gray-600 mb-3">This graph shows your estimated final interest rate over the next two years, based on your profile and the market forecast.</p>

              {/* 🧠 Deduplicate and build chart data */}
              {(() => {
                const uniqueDates = [
                  ...baseHistoricalDates,
                  ...forecastDates.filter(date => !baseHistoricalDates.includes(date)),
                ];

                const allRates = [
                  ...baseHistoricalRates,
                  ...forecastRates.slice(baseHistoricalDates.length),
                ];

                const chartData = uniqueDates.map((date, index) => ({
                  x: new Date(date).toISOString(),
                  rate: allRates[index],
                })).sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

                return (
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ width: '1200px' }}>
                      <LineChart
                        h={300}
                        data={chartData}
                        dataKey="x"
                        series={[{ name: 'rate', color: 'blue', label: 'Base Rate (%)' }]}
                        curveType="linear"
                        withLegend
                        withDots
                        gridAxis="xy"
                        xAxisProps={{
                          interval: 0,
                          tickFormatter: (value) => {
                            const date = new Date(value);
                            return date.toLocaleString('default', { month: 'short', year: '2-digit' });
                          },
                          tick: {
                            fontSize: 12,
                            // angle: -45,
                          },
                        }}
                        yAxisProps={{
                          tickFormatter: (value) => `${value.toFixed(2)} %`,
                          domain: ['dataMin - 0.2', 'dataMax + 0.2'],
                          tick: { fontSize: 12 },
                          label: {
                            value: 'Base Rate (%)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 10,
                            style: { textAnchor: 'middle', fontSize: 12 },
                          },
                        }}
                        tooltipProps={{
                          formatter: (value: number) => `${value.toFixed(3)} %`,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </Tabs.Panel>

            <Tabs.Panel value="final" pt="xs">
              <h4 className="text-md font-semibold mt-4 mb-2">2-Year Base-Rate Market Forecast</h4>
              <p className="text-sm text-gray-600 mb-3">
                This graph shows the likely direction of the base interest rate based on macro-economic modelling. Hover for details.
              </p>

              {(() => {
                // Deduplicate overlapping date (e.g., "2025-07-01")
                const filteredForecastDates = forecastDates.filter(
                  (date) => !baseHistoricalDates.includes(date)
                );

                const filteredForecastRates = forecastRates.slice(
                  baseHistoricalDates.includes('2025-07-01') ? 1 : 0
                );

                // Historical line
                const historicalData = baseHistoricalDates.map((date, index) => ({
                  x: new Date(date).toISOString(),
                  Historical: baseHistoricalRates[index],
                }));

                // Forecast line
                const forecastData = filteredForecastDates.map((date, index) => ({
                  x: new Date(date).toISOString(),
                  Forecast: filteredForecastRates[index],
                }));

                // Merge both for x-axis alignment
                const mergedData = [...historicalData, ...forecastData].sort(
                  (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
                );

                return (
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ width: '1200px' }}>
                      <LineChart
                        h={300}
                        data={mergedData}
                        dataKey="x"
                        series={[
                          {
                            name: 'Historical',
                            color: 'gray',
                            label: 'Historical',
                            strokeDasharray: '',
                          },
                          {
                            name: 'Forecast',
                            color: 'green',
                            label: 'Forecast',
                            strokeDasharray: '4 2',
                          },
                        ]}
                        curveType="linear"
                        withLegend
                        withDots
                        gridAxis="xy"
                        xAxisProps={{
                          interval: 0,
                          tickFormatter: (value) => {
                            const date = new Date(value);
                            return date.toLocaleString('default', {
                              month: 'short',
                              year: '2-digit',
                            });
                          },
                          tick: {
                            fontSize: 12,
                            // angle: -45,
                          },
                        }}
                        yAxisProps={{
                          tickFormatter: (value) => `${value.toFixed(2)} %`,
                          domain: [
                            Math.min(...baseHistoricalRates, ...forecastRates) - 0.1,
                            Math.max(...baseHistoricalRates, ...forecastRates) + 0.1,
                          ],
                          tick: { fontSize: 12 },
                          label: {
                            value: 'Base Rate (%)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 10,
                            style: { textAnchor: 'middle', fontSize: 12 },
                          },
                        }}
                        tooltipProps={{
                          formatter: (value: number) => `${value.toFixed(3)} %`,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </Tabs.Panel>
          </Tabs>
        </div>
      )}
    </div>
  );
}