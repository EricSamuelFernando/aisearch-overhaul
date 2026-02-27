// 'use client';


// import React, { useState, useEffect } from 'react';
// import MainNavPages from '@/components/navbars/main-nav-pages';
// import { PropertyOverviewChart } from '@/components/chart-tab';
// import { cn } from '@/lib/utils';
// import { DonutChart, LineChart } from '@mantine/charts';
// import CustomInput from '@/components/customs/input';
// import axios from 'axios';
// import { Button, Group, Select, Tabs } from '@mantine/core';

// export default function HowItWorksPage() {
//   return (
//     <>
//       <div className="fixed w-full z-50 top-0 left-0 bg-black">
//         <MainNavPages />
//       </div>
//       <div className="pt-16">
//         <PaymentCalculator />
//       </div>
//     </>
//   );
// }

// export function PaymentCalculator() {
//   const [formData, setFormData] = useState({
//     listing_id: '',
//     property_id: '',
//     property_value: '',
//     downpayment: '',
//     loan_amount: '',
//     credit_score: '',
//     income_stability: '',
//     loan_term: '15',
//     loan_type: 'Conventional',
//     employment_type: 'W-2 Employee',
//     property_type: 'Primary Residence',
//     property_state: 'MA',
//     dti_ratio: '',
//     location_risk: 'Medium',
//     reserves_months: '',
//     loan_purpose: '',
//     buydown_points: '',
//     debt_credit_cards: '',
//     debt_auto_loans: '',
//     debt_student_loans: '',
//     // property_address: '',
//     user_id: '',
//   });

//   const [forecastDates, setForecastDates] = useState<string[]>([]);
//   const [forecastRates, setForecastRates] = useState<number[]>([]);
//   const [finalForecastRates, setFinalForecastRates] = useState<number[]>([]);
//   const [baseHistoricalDates, setBaseHistoricalDates] = useState<string[]>([]);
//   const [baseHistoricalRates, setBaseHistoricalRates] = useState<number[]>([]);
//   const [showAdvanced, setShowAdvanced] = useState(false);
//   const [listingOptions, setListingOptions] = useState<{ value: string; label: string }[]>([]);
//   const [activeTab, setActiveTab] = useState<string>('base');
//   const [calcResult, setCalcResult] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);
// const [showResults, setShowResults] = useState(false);


//   const handleChange = (field: string, value: string) => {
//     setFormData(prev => {
//       const updated = { ...prev, [field]: value };
//       const propertyValue = parseFloat(field === 'property_value' ? value : prev.property_value) || 0;
//       const downpayment = parseFloat(field === 'downpayment' ? value : prev.downpayment) || 0;
//       updated.loan_amount = (propertyValue - downpayment).toFixed(2);
//       return updated;
//     });
//   };

//   useEffect(() => {
//     const storedUser = localStorage.getItem('userDetails');
//     const listingId = localStorage.getItem('listingId');
//     const propertyId = localStorage.getItem('propertyId');
//     const propertyType = localStorage.getItem('propertyType');
//     const propertyState = localStorage.getItem('propertyState');
//     const stateOrProvince = localStorage.getItem('stateOrProvince');
//     const propertyAddress = localStorage.getItem('propertyAddress');
//     const propertyAddress1 = localStorage.getItem('propertyAddress1');
//     const propertyAddress2 = localStorage.getItem('propertyAddress2');
//     const listPrice = localStorage.getItem('listPrice');

//     const fullAddress = [propertyAddress, propertyAddress1, propertyAddress2].filter(Boolean).join(', ');
//     const fullLabel = [propertyAddress, propertyAddress1, propertyAddress2, stateOrProvince].filter(Boolean).join(', ');

//     setListingOptions([{ value: listingId || '', label: fullLabel || '— no address set —' }]);

//     let userId = '';
//     try {
//       if (storedUser) {
//         const parsedUser = JSON.parse(storedUser);
//         userId = parsedUser?.id || '';
//       }
//     } catch (err) {
//       console.error('Error parsing userDetails:', err);
//     }

//     setFormData(prev => ({
//       ...prev,
//       user_id: userId,
//       listing_id: listingId || '',
//       property_id: propertyId || '',
//       property_type: propertyType || 'Primary Residence',
//       property_state: propertyState || '',
//       // property_address: fullAddress,
//       property_value: listPrice || '',
//     }));
//   }, []);

//   const handleCalculate = async () => {
//     const requiredFields = ['user_id', 'property_id', 'listing_id', 'property_value', 'reserves_months', 'loan_purpose'];
//     const missing = requiredFields.filter(f => !(formData as Record<string, any>)[f]);

//     if (missing.length > 0) {
//       alert(`Missing required fields: ${missing.join(', ')}`);
//       return;
//     }

//       setLoading(true); 


//     const requestData = {
//       user_id: formData.user_id,
//       property_id: formData.property_id,
//       listing_id: formData.listing_id,
//       // property_address: formData.property_address,
//       downpayment: Number(formData.downpayment),
//       loan_amount: Number(formData.loan_amount),
//       property_value: Number(formData.property_value),
//       property_type: formData.property_type?.toLowerCase().replace(/\s/g, '_'),
//       state: formData.property_state,
//       location_risk: formData.location_risk?.toLowerCase(),
//       credit_score: formData.credit_score,
//       income_stability_years: formData.income_stability,
//       loan_term_years: formData.loan_term,
//       dti_ratio: formData.dti_ratio || '0.36',
//       buydown_points: formData.buydown_points || '0',
//       employment_type: formData.employment_type?.toLowerCase().split(' ')[0] || 'w2',
//       loan_type: formData.loan_type?.toLowerCase() || 'conventional',
//       reserves_months: formData.reserves_months || '3',
//       loan_purpose: formData.loan_purpose?.toLowerCase() || 'purchase',
//     };

//     try {
//       const res = await axios.post('https://rate-predictor.snaphomz.duckdns.org/api/calculate_rate', requestData);

//       const baseForecast = res.data?.base_rate_forecast?.forecast || {};
//       const baseHistorical = res.data?.base_rate_forecast?.historical || {};

//       setForecastDates([...baseHistorical.dates, ...baseForecast.dates]);
//       setForecastRates([...baseHistorical.rates, ...baseForecast.rates]);
//       setBaseHistoricalDates(baseHistorical.dates || []);
//       setBaseHistoricalRates(baseHistorical.rates || []);

//       setFinalForecastRates(res.data?.final_rate_forecast?.rates || []);
//       // setCalcResult(res.data?.calc_result || null);
//       setShowResults(true); // Show the results and hide form

//     } catch (err) {
//       console.error('API error:', err);
//     }finally {
//     setLoading(false); 
//   }
//   };
// return (
//   <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
//     <h3 className="text-2xl font-bold text-gray-900">Mortgage Rate Forecast</h3>

//     {/* FORM SECTION */}
//     {!showResults && (
//       <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Select
//             label="Choose Listing"
//             placeholder="Select listing"
//             data={listingOptions}
//             value={formData.listing_id}
//             onChange={value => handleChange('listing_id', value || '')}
//           />
//           <CustomInput
//             label="Property Value ($)"
//             value={formData.property_value}
//             onChange={e => handleChange('property_value', e.currentTarget.value)}
//           />
//           <CustomInput
//             label="Down-payment ($)"
//             type="number"
//             value={formData.downpayment}
//             onChange={e => handleChange('downpayment', e.target.value)}
//             leftSection="$"
//           />
//           <CustomInput
//             label="Loan Amount ($) optional"
//             type="number"
//             value={formData.loan_amount}
//             onChange={e => handleChange('loan_amount', e.target.value)}
//             leftSection="$"
//           />
//           <CustomInput
//             label="Credit Score (300-850)"
//             type="number"
//             value={formData.credit_score}
//             onChange={e => handleChange('credit_score', e.target.value)}
//           />
//           <CustomInput
//             label="Income Stability (years)"
//             type="number"
//             value={formData.income_stability}
//             onChange={e => handleChange('income_stability', e.target.value)}
//           />
//           <Select
//             label="Loan Term (years)"
//             data={[
//               { value: '15', label: '15' },
//               { value: '20', label: '20' },
//               { value: '25', label: '25' },
//               { value: '30', label: '30' },
//               { value: '35', label: '35' },
//             ]}
//             value={formData.loan_term}
//             onChange={value => handleChange('loan_term', value || '')}
//           />
//           <Select
//             label="Loan Type / Program"
//             data={[
//               { value: 'Conventional', label: 'Conventional' },
//               { value: 'FHA', label: 'FHA' },
//               { value: 'VA', label: 'VA' },
//               { value: 'USDA', label: 'USDA' },
//               { value: 'Jumbo', label: 'Jumbo' },
//             ]}
//             value={formData.loan_type}
//             onChange={value => handleChange('loan_type', value || '')}
//           />
//           <Select
//             label="Employment Type"
//             data={[
//               { value: 'w2', label: 'W-2 Employee' },
//               { value: 'self_employed', label: 'Self-Employed / 1099' },
//             ]}
//             value={formData.employment_type}
//             onChange={value => handleChange('employment_type', value || '')}
//           />
//           <Select
//             label="Property Type"
//             data={[
//               { value: 'Primary Residence', label: 'Primary Residence' },
//               { value: 'Second Home', label: 'Second Home' },
//               { value: 'Investment', label: 'Investment' },
//             ]}
//             value={formData.property_type}
//             onChange={value => handleChange('property_type', value || '')}
//           />
//           <CustomInput
//             label="Property State"
//             value={formData.property_state}
//             onChange={e => handleChange('property_state', e.currentTarget.value)}
//           />
//         </div>

//         {/* Advanced Options Toggle */}
//         <div className="flex justify-between items-center pt-2">
//           <Button variant="light" size="xs" onClick={() => setShowAdvanced(prev => !prev)}>
//             {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
//           </Button>
//         </div>

//         {/* Advanced Fields */}
//         {showAdvanced && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
//             <CustomInput
//               label="Reserves (months)"
//               type="number"
//               value={formData.reserves_months}
//               onChange={e => handleChange('reserves_months', e.target.value)}
//             />
//             <Select
//               label="Loan Purpose"
//               data={[
//                 { value: 'purchase', label: 'Purchase' },
//                 { value: 'refinance', label: 'Refinance' },
//               ]}
//               value={formData.loan_purpose}
//               onChange={value => handleChange('loan_purpose', value || '')}
//             />
//           </div>
//         )}

//         {/* Submit Button */}
//         <div className="pt-4">
//           <Button fullWidth onClick={handleCalculate} loading={loading}>
//             {loading ? 'Calculating...' : 'Calculate Rate & See Forecast'}
//           </Button>
//         </div>
//       </div>
//     )}

//     {/* RESULTS SECTION */}
//     {showResults && (
//       <>
//         <div className="flex justify-between items-center">
//           <h4 className="text-xl font-semibold text-gray-800">Forecast Results</h4>
//           <Button variant="outline" size="xs" onClick={() => setShowResults(false)}>
//             ← Back to Form
//           </Button>
//         </div>

//       {/* Adjustments Section */}
//      {calcResult && (
//       <div className="bg-white border rounded-lg shadow-sm p-6">
//         <h4 className="font-semibold text-gray-800 mb-2">Adjustment Breakdown for Today’s Rate</h4>
//         <ul className="list-disc list-inside text-sm text-gray-700">
//           {Object.entries(calcResult.adjustments || {}).map(([label, value], index) => {
//             const rate = value as number;
//             return (
//               <li key={index}>
//                 {label}: {rate >= 0 ? '+' : ''}
//                 {rate.toFixed(3)} %
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     )}

//         {/* Adjustment Summary */}
//         {calcResult && (
//           <div className="bg-white border rounded-lg shadow-sm p-6 mt-4">
//             <h4 className="font-semibold text-gray-800 mb-2">Adjustment Breakdown for Today’s Rate</h4>
//             <ul className="list-disc list-inside text-sm text-gray-700">
//               {Object.entries(calcResult.adjustments || {}).map(([label, value], index) => {
//                 const rate = value as number;
//                 return (
//                   <li key={index}>
//                     {label}: {rate >= 0 ? '+' : ''}
//                     {rate.toFixed(3)} %
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         )}

//        {/* Graph / Forecast Tabs Section - PRESERVED */}
//     {forecastDates.length > 0 && forecastRates.length > 0 && (
//       <div className="bg-white border rounded-lg shadow-sm p-6">
//         <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
//           <Tabs.List>
//             <Tabs.Tab value="base">Calculate Rate Today</Tabs.Tab>
//             <Tabs.Tab value="final">View Market Rates</Tabs.Tab>
//           </Tabs.List>

//           {/* Final Rate Forecast Tab */}
//           <Tabs.Panel value="base" pt="xs">
//             {calcResult && (
//               <div className="space-y-3 mt-6">
//                 <div className="bg-green-100 text-green-900 px-4 py-3 rounded border border-green-300">
//                   <div>
//                     <strong>Final Rate Today:</strong> {calcResult.final_rate.toFixed(2)} %
//                   </div>
//                   <div>
//                     <strong>Base Rate Today:</strong> {calcResult.base_rate.toFixed(2)} %{' '}
//                     <span className="text-gray-500 text-sm">(as of {calcResult.as_of})</span>
//                   </div>
//                 </div>
//                 <div className="bg-blue-100 text-blue-900 px-4 py-3 rounded border border-blue-300">
//                   <strong>Estimated Monthly Payment:</strong> ${calcResult.monthly_payment.toFixed(2)}
//                 </div>
//               </div>
//             )}

//             <h4 className="text-md font-semibold mt-4 mb-2">Your Personalized 2-Year Rate Forecast</h4>
//             <p className="text-sm text-gray-600 mb-3">
//               This graph shows your estimated final interest rate over the next two years, based on your profile and the market forecast.
//             </p>

//             {/* 🧠 Final Rate LineChart */}
//             {(() => {
//               const uniqueDates = [
//                 ...baseHistoricalDates,
//                 ...forecastDates.filter(date => !baseHistoricalDates.includes(date)),
//               ];
//               const allRates = [
//                 ...baseHistoricalRates,
//                 ...forecastRates.slice(baseHistoricalDates.length),
//               ];
//               const chartData = uniqueDates.map((date, index) => ({
//                 x: new Date(date).toISOString(),
//                 rate: allRates[index],
//               })).sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

//               return (
//                 <div style={{ overflowX: 'auto' }}>
//                   <div style={{ width: '1200px' }}>
//                     <LineChart
//                       h={300}
//                       data={chartData}
//                       dataKey="x"
//                       series={[{ name: 'rate', color: 'blue', label: 'Base Rate (%)' }]}
//                       curveType="linear"
//                       withLegend
//                       withDots
//                       gridAxis="xy"
//                       xAxisProps={{
//                         interval: 0,
//                         tickFormatter: value =>
//                           new Date(value).toLocaleString('default', { month: 'short', year: '2-digit' }),
//                         tick: { fontSize: 12 },
//                       }}
//                       yAxisProps={{
//                         tickFormatter: value => `${value.toFixed(2)} %`,
//                         domain: ['dataMin - 0.2', 'dataMax + 0.2'],
//                         tick: { fontSize: 12 },
//                         label: {
//                           value: 'Base Rate (%)',
//                           angle: -90,
//                           position: 'insideLeft',
//                           offset: 10,
//                           style: { textAnchor: 'middle', fontSize: 12 },
//                         },
//                       }}
//                       tooltipProps={{
//                         formatter: (value: number) => `${value.toFixed(3)} %`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               );
//             })()}
//           </Tabs.Panel>

//           {/* Market Forecast Tab */}
//           <Tabs.Panel value="final" pt="xs">
//             <h4 className="text-md font-semibold mt-4 mb-2">2-Year Base-Rate Market Forecast</h4>
//             <p className="text-sm text-gray-600 mb-3">
//               This graph shows the likely direction of the base interest rate based on macro-economic modelling. Hover for details.
//             </p>

//             {/* 🧠 Historical + Forecast LineChart */}
//             {(() => {
//               const filteredForecastDates = forecastDates.filter(date => !baseHistoricalDates.includes(date));
//               const filteredForecastRates = forecastRates.slice(baseHistoricalDates.includes('2025-07-01') ? 1 : 0);

//               const historicalData = baseHistoricalDates.map((date, index) => ({
//                 x: new Date(date).toISOString(),
//                 Historical: baseHistoricalRates[index],
//               }));
//               const forecastData = filteredForecastDates.map((date, index) => ({
//                 x: new Date(date).toISOString(),
//                 Forecast: filteredForecastRates[index],
//               }));
//               const mergedData = [...historicalData, ...forecastData].sort(
//                 (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
//               );

//               return (
//                 <div style={{ overflowX: 'auto' }}>
//                   <div style={{ width: '1200px' }}>
//                     <LineChart
//                       h={300}
//                       data={mergedData}
//                       dataKey="x"
//                       series={[
//                         {
//                           name: 'Historical',
//                           color: 'gray',
//                           label: 'Historical',
//                           strokeDasharray: '',
//                         },
//                         {
//                           name: 'Forecast',
//                           color: 'green',
//                           label: 'Forecast',
//                           strokeDasharray: '4 2',
//                         },
//                       ]}
//                       curveType="linear"
//                       withLegend
//                       withDots
//                       gridAxis="xy"
//                       xAxisProps={{
//                         interval: 0,
//                         tickFormatter: value =>
//                           new Date(value).toLocaleString('default', { month: 'short', year: '2-digit' }),
//                         tick: { fontSize: 12 },
//                       }}
//                       yAxisProps={{
//                         tickFormatter: value => `${value.toFixed(2)} %`,
//                         domain: [
//                           Math.min(...baseHistoricalRates, ...forecastRates) - 0.1,
//                           Math.max(...baseHistoricalRates, ...forecastRates) + 0.1,
//                         ],
//                         tick: { fontSize: 12 },
//                         label: {
//                           value: 'Base Rate (%)',
//                           angle: -90,
//                           position: 'insideLeft',
//                           offset: 10,
//                           style: { textAnchor: 'middle', fontSize: 12 },
//                         },
//                       }}
//                       tooltipProps={{
//                         formatter: (value: number) => `${value.toFixed(3)} %`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               );
//             })()}
//           </Tabs.Panel>
//         </Tabs>
//       </div>
//     )}
//       </>
//     )}
//   </div>
// );


// }



// ==================================
'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import { Play, ChevronRight } from 'lucide-react'
import MainNavPages from '@/components/navbars/main-nav-pages';
import { PropertyOverviewChart } from '@/components/chart-tab';
import { cn } from '@/lib/utils';
import { DonutChart, LineChart } from '@mantine/charts';
import CustomInput from '@/components/customs/input';
import axios from 'axios';
import { Button, Group, Select, Tabs } from '@mantine/core';
export default function HowItWorksPage() {

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
  const [showResults, setShowResults] = useState(false);


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
      // setCalcResult(res.data?.calc_result || null);
      setShowResults(true); // Show the results and hide form

    } catch (err) {
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed w-full z-50 top-0 left-0 bg-black">
        <MainNavPages />
      </div>
      <div className='pt-16'>
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Mortgage Rate Forecast</h3>

          {/* FORM SECTION */}
          {!showResults && (
            <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Choose Listing"
                  placeholder="Select listing"
                  data={listingOptions}
                  value={formData.listing_id}
                  onChange={value => handleChange('listing_id', value || '')}
                />
                <CustomInput
                  label="Property Value ($)"
                  value={formData.property_value}
                  onChange={e => handleChange('property_value', e.currentTarget.value)}
                />
                <CustomInput
                  label="Down-payment ($)"
                  type="number"
                  value={formData.downpayment}
                  onChange={e => handleChange('downpayment', e.target.value)}
                  leftSection="$"
                />
                <CustomInput
                  label="Loan Amount ($) optional"
                  type="number"
                  value={formData.loan_amount}
                  onChange={e => handleChange('loan_amount', e.target.value)}
                  leftSection="$"
                />
                <CustomInput
                  label="Credit Score (300-850)"
                  type="number"
                  value={formData.credit_score}
                  onChange={e => handleChange('credit_score', e.target.value)}
                />
                <CustomInput
                  label="Income Stability (years)"
                  type="number"
                  value={formData.income_stability}
                  onChange={e => handleChange('income_stability', e.target.value)}
                />
                <Select
                  label="Loan Term (years)"
                  data={[
                    { value: '15', label: '15' },
                    { value: '20', label: '20' },
                    { value: '25', label: '25' },
                    { value: '30', label: '30' },
                    { value: '35', label: '35' },
                  ]}
                  value={formData.loan_term}
                  onChange={value => handleChange('loan_term', value || '')}
                />
                <Select
                  label="Loan Type / Program"
                  data={[
                    { value: 'Conventional', label: 'Conventional' },
                    { value: 'FHA', label: 'FHA' },
                    { value: 'VA', label: 'VA' },
                    { value: 'USDA', label: 'USDA' },
                    { value: 'Jumbo', label: 'Jumbo' },
                  ]}
                  value={formData.loan_type}
                  onChange={value => handleChange('loan_type', value || '')}
                />
                <Select
                  label="Employment Type"
                  data={[
                    { value: 'w2', label: 'W-2 Employee' },
                    { value: 'self_employed', label: 'Self-Employed / 1099' },
                  ]}
                  value={formData.employment_type}
                  onChange={value => handleChange('employment_type', value || '')}
                />
                <Select
                  label="Property Type"
                  data={[
                    { value: 'Primary Residence', label: 'Primary Residence' },
                    { value: 'Second Home', label: 'Second Home' },
                    { value: 'Investment', label: 'Investment' },
                  ]}
                  value={formData.property_type}
                  onChange={value => handleChange('property_type', value || '')}
                />
                <CustomInput
                  label="Property State"
                  value={formData.property_state}
                  onChange={e => handleChange('property_state', e.currentTarget.value)}
                />
              </div>

              {/* Advanced Options Toggle */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="light" size="xs" onClick={() => setShowAdvanced(prev => !prev)}>
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </Button>
              </div>

              {/* Advanced Fields */}
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <CustomInput
                    label="Reserves (months)"
                    type="number"
                    value={formData.reserves_months}
                    onChange={e => handleChange('reserves_months', e.target.value)}
                  />
                  <Select
                    label="Loan Purpose"
                    data={[
                      { value: 'purchase', label: 'Purchase' },
                      { value: 'refinance', label: 'Refinance' },
                    ]}
                    value={formData.loan_purpose}
                    onChange={value => handleChange('loan_purpose', value || '')}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button fullWidth onClick={handleCalculate} loading={loading}>
                  {loading ? 'Calculating...' : 'Calculate Rate & See Forecast'}
                </Button>
              </div>
            </div>
          )}

          {/* RESULTS SECTION */}
          {showResults && (
            <>
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-semibold text-gray-800">Forecast Results</h4>
                <Button variant="outline" size="xs" onClick={() => setShowResults(false)}>
                  ← Back to Form
                </Button>
              </div>

              {/* Adjustments Section */}
              {calcResult && (
                <div className="bg-white border rounded-lg shadow-sm p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Adjustment Breakdown for Today’s Rate</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {Object.entries(calcResult.adjustments || {}).map(([label, value], index) => {
                      const rate = value as number;
                      return (
                        <li key={index}>
                          {label}: {rate >= 0 ? '+' : ''}
                          {rate.toFixed(3)} %
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Adjustment Summary */}
              {calcResult && (
                <div className="bg-white border rounded-lg shadow-sm p-6 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Adjustment Breakdown for Today’s Rate</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {Object.entries(calcResult.adjustments || {}).map(([label, value], index) => {
                      const rate = value as number;
                      return (
                        <li key={index}>
                          {label}: {rate >= 0 ? '+' : ''}
                          {rate.toFixed(3)} %
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Graph / Forecast Tabs Section - PRESERVED */}
              {forecastDates.length > 0 && forecastRates.length > 0 && (
                <div className="bg-white border rounded-lg shadow-sm p-6">
                  <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
                    <Tabs.List>
                      <Tabs.Tab value="base">Calculate Rate Today</Tabs.Tab>
                      <Tabs.Tab value="final">View Market Rates</Tabs.Tab>
                    </Tabs.List>

                    {/* Final Rate Forecast Tab */}
                    <Tabs.Panel value="base" pt="xs">
                      {calcResult && (
                        <div className="space-y-3 mt-6">
                          <div className="bg-green-100 text-green-900 px-4 py-3 rounded border border-green-300">
                            <div>
                              <strong>Final Rate Today:</strong> {calcResult.final_rate.toFixed(2)} %
                            </div>
                            <div>
                              <strong>Base Rate Today:</strong> {calcResult.base_rate.toFixed(2)} %{' '}
                              <span className="text-gray-500 text-sm">(as of {calcResult.as_of})</span>
                            </div>
                          </div>
                          <div className="bg-blue-100 text-blue-900 px-4 py-3 rounded border border-blue-300">
                            <strong>Estimated Monthly Payment:</strong> ${calcResult.monthly_payment.toFixed(2)}
                          </div>
                        </div>
                      )}

                      <h4 className="text-md font-semibold mt-4 mb-2">Your Personalized 2-Year Rate Forecast</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        This graph shows your estimated final interest rate over the next two years, based on your profile and the market forecast.
                      </p>

                      {/* 🧠 Final Rate LineChart */}
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
                                  tickFormatter: value =>
                                    new Date(value).toLocaleString('default', { month: 'short', year: '2-digit' }),
                                  tick: { fontSize: 12 },
                                }}
                                yAxisProps={{
                                  tickFormatter: value => `${value.toFixed(2)} %`,
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

                    {/* Market Forecast Tab */}
                    <Tabs.Panel value="final" pt="xs">
                      <h4 className="text-md font-semibold mt-4 mb-2">2-Year Base-Rate Market Forecast</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        This graph shows the likely direction of the base interest rate based on macro-economic modelling. Hover for details.
                      </p>

                      {/* 🧠 Historical + Forecast LineChart */}
                      {(() => {
                        const filteredForecastDates = forecastDates.filter(date => !baseHistoricalDates.includes(date));
                        const filteredForecastRates = forecastRates.slice(baseHistoricalDates.includes('2025-07-01') ? 1 : 0);

                        const historicalData = baseHistoricalDates.map((date, index) => ({
                          x: new Date(date).toISOString(),
                          Historical: baseHistoricalRates[index],
                        }));
                        const forecastData = filteredForecastDates.map((date, index) => ({
                          x: new Date(date).toISOString(),
                          Forecast: filteredForecastRates[index],
                        }));
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
                                  tickFormatter: value =>
                                    new Date(value).toLocaleString('default', { month: 'short', year: '2-digit' }),
                                  tick: { fontSize: 12 },
                                }}
                                yAxisProps={{
                                  tickFormatter: value => `${value.toFixed(2)} %`,
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
            </>
          )}
        </div>
      </div>

    </>
  )
}