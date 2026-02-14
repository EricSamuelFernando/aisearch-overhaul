'use client';

import React from 'react';
import { Info } from 'lucide-react';
type ToggleOption = 'percent' | 'amount';
type TaxMode = 'percent' | 'annual';
type PmiMode = 'percent' | 'monthly';

type MonthlyMortgageCalculatorProps = {
  homePrice?: number;
  hoaMonthly?: number;
  insuranceMonthly?: number;
  taxPercent?: number;
};

const DEFAULTS = {
  price: '450000',
  downPayment: '20',
  downType: 'percent' as ToggleOption,
  term: 30,
  rate: '6.5',
  tax: '1.1',
  taxMode: 'percent' as TaxMode,
  insurance: '120',
  hoa: '0',
  pmiEnabled: false,
  pmi: '0.6',
  pmiMode: 'percent' as PmiMode,
};

const RATE_SERIES_FOR_TERM = (term: number) => (term === 15 ? 15 : 30);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatCurrencyPrecise = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

const toNumber = (value: string) => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const useDebouncedValue = <T,>(value: T, delay = 200) => {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
};

const MonthlyMortgageCalculator: React.FC<MonthlyMortgageCalculatorProps> = ({
  homePrice,
  hoaMonthly,
  insuranceMonthly,
  taxPercent,
}) => {
  const inputClass =
    'mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
  const inlineInputClass =
    'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
  const toggleGroupClass =
    'flex h-10 items-center rounded-xl border border-gray-200 bg-white text-[11px] shadow-sm';
  const [price, setPrice] = React.useState(DEFAULTS.price);
  const [downPayment, setDownPayment] = React.useState(DEFAULTS.downPayment);
  const [downType, setDownType] = React.useState<ToggleOption>(DEFAULTS.downType);
  const [term, setTerm] = React.useState<number>(DEFAULTS.term);
  const [rate, setRate] = React.useState(DEFAULTS.rate);
  const [rateTouched, setRateTouched] = React.useState(false);
  const [rateMeta, setRateMeta] = React.useState<{ date?: string; source?: string } | null>(null);
  const [rateLoading, setRateLoading] = React.useState(false);

  const [tax, setTax] = React.useState(DEFAULTS.tax);
  const [taxMode, setTaxMode] = React.useState<TaxMode>(DEFAULTS.taxMode);
  const [insurance, setInsurance] = React.useState(DEFAULTS.insurance);
  const [hoa, setHoa] = React.useState(DEFAULTS.hoa);
  const [pmiEnabled, setPmiEnabled] = React.useState(DEFAULTS.pmiEnabled);
  const [pmi, setPmi] = React.useState(DEFAULTS.pmi);
  const [pmiMode, setPmiMode] = React.useState<PmiMode>(DEFAULTS.pmiMode);

  React.useEffect(() => {
    let isMounted = true;
    const fetchRate = async () => {
      setRateLoading(true);
      try {
        const seriesTerm = RATE_SERIES_FOR_TERM(term);
        const response = await fetch(`/api/mortgage-rate?term=${seriesTerm}`);
        if (!response.ok) throw new Error('Failed to fetch rate');
        const json = await response.json();
        if (!isMounted) return;
        setRateMeta({ date: json.date, source: json.source });
        if (!rateTouched && typeof json.ratePct === 'number') {
          setRate(json.ratePct.toFixed(3).replace(/\.?0+$/, ''));
        }
      } catch (err) {
        if (!isMounted) return;
        setRateMeta({ date: undefined, source: 'unavailable' });
      } finally {
        if (isMounted) setRateLoading(false);
      }
    };
    fetchRate();
    return () => {
      isMounted = false;
    };
  }, [term, rateTouched]);

  const [priceTouched, setPriceTouched] = React.useState(false);
  const [taxTouched, setTaxTouched] = React.useState(false);
  const [insuranceTouched, setInsuranceTouched] = React.useState(false);
  const [hoaTouched, setHoaTouched] = React.useState(false);

  React.useEffect(() => {
    if (!priceTouched && homePrice && Number.isFinite(homePrice)) {
      setPrice(String(Math.round(homePrice)));
    }
  }, [homePrice, priceTouched]);

  React.useEffect(() => {
    if (!hoaTouched && hoaMonthly && Number.isFinite(hoaMonthly)) {
      setHoa(String(Math.round(hoaMonthly)));
    }
  }, [hoaMonthly, hoaTouched]);

  React.useEffect(() => {
    if (!insuranceTouched && insuranceMonthly && Number.isFinite(insuranceMonthly)) {
      setInsurance(String(Math.round(insuranceMonthly)));
    }
  }, [insuranceMonthly, insuranceTouched]);

  React.useEffect(() => {
    if (!taxTouched && taxPercent && Number.isFinite(taxPercent)) {
      setTax(String(taxPercent));
      setTaxMode('percent');
    }
  }, [taxPercent, taxTouched]);

  const liveInputs = {
    price,
    downPayment,
    downType,
    term,
    rate,
    tax,
    taxMode,
    insurance,
    hoa,
    pmiEnabled,
    pmi,
    pmiMode,
  };

  const debouncedInputs = useDebouncedValue(liveInputs, 200);
  const [calcInputs, setCalcInputs] = React.useState(liveInputs);

  React.useEffect(() => {
    setCalcInputs(debouncedInputs);
  }, [debouncedInputs]);

  const result = React.useMemo(() => {
    const priceValue = toNumber(calcInputs.price);
    const downValue = toNumber(calcInputs.downPayment);
    const downAmount =
      calcInputs.downType === 'percent'
        ? (priceValue * downValue) / 100
        : downValue;
    const loanAmount = Math.max(0, priceValue - downAmount);

    const ratePct = toNumber(calcInputs.rate);
    const r = ratePct / 100 / 12;
    const n = calcInputs.term * 12;
    let pi = 0;
    if (n > 0) {
      if (r === 0) {
        pi = loanAmount / n;
      } else {
        const factor = Math.pow(1 + r, n);
        pi = loanAmount * (r * factor) / (factor - 1);
      }
    }
    const interestMonthly = r === 0 ? 0 : loanAmount * r;
    const principalMonthly = Math.max(0, pi - interestMonthly);

    const taxMonthly =
      calcInputs.taxMode === 'percent'
        ? (priceValue * (toNumber(calcInputs.tax) / 100)) / 12
        : toNumber(calcInputs.tax) / 12;

    const insuranceMonthly = toNumber(calcInputs.insurance);
    const hoaMonthly = toNumber(calcInputs.hoa);

    let pmiMonthly = 0;
    if (calcInputs.pmiEnabled) {
      pmiMonthly =
        calcInputs.pmiMode === 'percent'
          ? (toNumber(calcInputs.pmi) / 100) * loanAmount / 12
          : toNumber(calcInputs.pmi);
    }

    const total = pi + taxMonthly + insuranceMonthly + hoaMonthly + pmiMonthly;

    return {
      loanAmount,
      pi,
      principalMonthly,
      interestMonthly,
      taxMonthly,
      insuranceMonthly,
      hoaMonthly,
      pmiMonthly,
      total,
    };
  }, [calcInputs]);

  const showUseLiveRate = rateTouched && rateMeta?.date && rateMeta?.source !== 'unavailable';
  const liveRateStatus =
    rateMeta?.date && rateMeta?.source !== 'unavailable'
      ? `Live rate - as of ${rateMeta.date}`
      : 'Live rate unavailable';

  
  const LabelWithTip = ({ label, tip }: { label: string; tip: string }) => {
    const [open, setOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLSpanElement | null>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (!wrapperRef.current) return;
        if (!wrapperRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = (event: React.MouseEvent | React.KeyboardEvent) => {
      event.stopPropagation();
      setOpen((prev) => !prev);
    };

    return (
      <span
        ref={wrapperRef}
        className="relative inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-gray-500"
      >
        <span
          role="button"
          tabIndex={0}
          onClick={toggleOpen}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              toggleOpen(event);
            }
          }}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-200 bg-gray-100 text-cyan-500">
            <Info className="h-3.5 w-3.5" />
          </span>
          <span className="text-gray-600">{label}</span>
        </span>
        <span
          className={`pointer-events-auto absolute left-0 top-0 z-50 w-[240px] -translate-y-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] leading-relaxed text-gray-700 shadow-lg transition-all duration-200 ease-out ${
            open ? 'opacity-100 -translate-y-8' : 'opacity-0'
          }`}
        >
          {tip}
        </span>
      </span>
    );
  };

  return (
    <div>
      <div className="w-full rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-orange-500">Monthly mortgage</p>
            <h3 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
              Payment Calculator
            </h3>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Estimated Monthly Payment
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrencyPrecise(result.total)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col">
            <LabelWithTip
              label="Home price ($)"
              tip="The purchase price of the home you are considering."
            />
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => setPriceTouched(true)}
              className={inputClass}
            />
          </label>

          <div className="flex flex-col">
            <LabelWithTip
              label="Down payment"
              tip="Up-front amount paid at closing. Use % of price or a fixed dollar amount."
            />
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className={`flex-1 ${inlineInputClass}`}
              />
              <div className={toggleGroupClass}>
                <button
                  type="button"
                  onClick={() => setDownType('percent')}
                  className={`px-3 h-10 rounded-l-xl ${downType === 'percent' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDownType('amount')}
                  className={`px-3 h-10 rounded-r-xl ${downType === 'amount' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                >
                  $
                </button>
              </div>
            </div>
          </div>

          <label className="flex flex-col">
            <LabelWithTip
              label="Loan term"
              tip="How long you will repay the loan. Shorter terms usually mean higher payments but less interest."
            />
            <select
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className={inputClass}
            >
              <option value={30}>30 years</option>
              <option value={20}>20 years</option>
              <option value={15}>15 years</option>
            </select>
          </label>

          <div className="flex flex-col">
            <LabelWithTip
              label="Interest rate (%)"
              tip="Annual mortgage rate. Pulled from live FRED data unless you override it."
            />
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                setRateTouched(true);
              }}
              className={inputClass}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
              <span>{rateLoading ? 'Loading live rate...' : liveRateStatus}</span>
              {showUseLiveRate && (
                <button
                  type="button"
                  onClick={() => {
                    if (rateMeta?.source !== 'unavailable') {
                      setRateTouched(false);
                    }
                  }}
                  className="text-orange-600 hover:underline"
                >
                  Use live rate
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <LabelWithTip
              label="Property tax"
              tip="Annual property tax. Enter % of home value or a fixed annual dollar amount."
            />
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={tax}
                onChange={(e) => {
                  setTax(e.target.value);
                  setTaxTouched(true);
                }}
                className={`flex-1 ${inlineInputClass}`}
              />
              <div className={toggleGroupClass}>
                <button
                  type="button"
                  onClick={() => setTaxMode('percent')}
                  className={`px-3 h-10 rounded-l-xl ${taxMode === 'percent' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                >
                  %/yr
                </button>
                <button
                  type="button"
                  onClick={() => setTaxMode('annual')}
                  className={`px-3 h-10 rounded-r-xl ${taxMode === 'annual' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                >
                  $/yr
                </button>
              </div>
            </div>
          </div>

          <label className="flex flex-col">
            <LabelWithTip
              label="Home insurance ($/mo)"
              tip="Estimated monthly homeowner's insurance premium."
            />
            <input
              type="text"
              inputMode="decimal"
              value={insurance}
              onChange={(e) => {
                setInsurance(e.target.value);
                setInsuranceTouched(true);
              }}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col">
            <LabelWithTip
              label="HOA ($/mo)"
              tip="Monthly homeowners association dues (if applicable)."
            />
            <input
              type="text"
              inputMode="decimal"
              value={hoa}
              onChange={(e) => {
                setHoa(e.target.value);
                setHoaTouched(true);
              }}
              className={inputClass}
            />
          </label>

          <div className="flex flex-col">
            <LabelWithTip
              label="PMI"
              tip="Private Mortgage Insurance. Usually required if down payment is under 20%."
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPmiEnabled((prev) => !prev)}
                className={`h-10 px-3 rounded-xl border text-xs ${
                  pmiEnabled
                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                {pmiEnabled ? 'Enabled' : 'Off'}
              </button>
              {pmiEnabled && (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={pmi}
                    onChange={(e) => setPmi(e.target.value)}
                    className={`flex-1 ${inlineInputClass}`}
                  />
                  <div className={toggleGroupClass}>
                    <button
                      type="button"
                      onClick={() => setPmiMode('percent')}
                      className={`px-3 h-10 rounded-l-xl ${pmiMode === 'percent' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                    >
                      %/yr
                    </button>
                    <button
                      type="button"
                      onClick={() => setPmiMode('monthly')}
                      className={`px-3 h-10 rounded-r-xl ${pmiMode === 'monthly' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                    >
                      $/mo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-[#FAFAFA] px-4 py-3">
          <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600">
            <span className="font-medium text-gray-700">Principal</span>
            <span className="text-right text-gray-900">{formatCurrencyPrecise(result.principalMonthly)}</span>
            <span className="font-medium text-gray-700">Interest</span>
            <span className="text-right text-gray-900">{formatCurrencyPrecise(result.interestMonthly)}</span>
            {result.taxMonthly > 0 && (
              <>
                <span className="font-medium text-gray-700">Tax</span>
                <span className="text-right text-gray-900">{formatCurrencyPrecise(result.taxMonthly)}</span>
              </>
            )}
            {result.insuranceMonthly > 0 && (
              <>
                <span className="font-medium text-gray-700">Insurance</span>
                <span className="text-right text-gray-900">{formatCurrencyPrecise(result.insuranceMonthly)}</span>
              </>
            )}
            {result.hoaMonthly > 0 && (
              <>
                <span className="font-medium text-gray-700">HOA</span>
                <span className="text-right text-gray-900">{formatCurrencyPrecise(result.hoaMonthly)}</span>
              </>
            )}
            {result.pmiMonthly > 0 && (
              <>
                <span className="font-medium text-gray-700">PMI</span>
                <span className="text-right text-gray-900">{formatCurrencyPrecise(result.pmiMonthly)}</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Loan amount: {formatCurrency(result.loanAmount)}
          </p>
          <button
            type="button"
            onClick={() => setCalcInputs(liveInputs)}
            className="rounded-full bg-black px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-900 transition-colors"
          >
            Calculate
          </button>
        </div>
      </div>
    </div>
  );

};

export default MonthlyMortgageCalculator;
