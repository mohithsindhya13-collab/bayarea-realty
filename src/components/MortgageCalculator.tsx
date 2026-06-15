'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MortgageCalculatorProps {
  initialPrice?: number;
}

export function MortgageCalculator({ initialPrice = 1500000 }: MortgageCalculatorProps) {
  const [price, setPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(300000);
  const [downPercent, setDownPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [term, setTerm] = useState(30);
  const [taxRate, setTaxRate] = useState(1.25);
  const [hoa, setHoa] = useState(0);

  const [pi, setPi] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  // Sync inputs
  useEffect(() => {
    // When initialPrice changes, update the price state
    setPrice(initialPrice);
  }, [initialPrice]);

  useEffect(() => {
    const calculatedDown = Math.round((downPercent / 100) * price);
    setDownPayment(calculatedDown);
  }, [downPercent, price]);

  const handleDownPaymentChange = (val: number) => {
    setDownPayment(val);
    const calculatedPct = price > 0 ? (val / price) * 100 : 0;
    setDownPercent(parseFloat(calculatedPct.toFixed(1)));
  };

  const handleDownPercentChange = (val: number) => {
    setDownPercent(val);
  };

  // Recalculate
  useEffect(() => {
    const loanPrincipal = price - downPayment;
    const monthlyRate = (interestRate / 12) / 100;
    const totalPayments = term * 12;

    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI = loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPI = loanPrincipal / totalPayments;
    }

    if (isNaN(monthlyPI) || monthlyPI < 0) {
      monthlyPI = 0;
    }

    const monthlyTax = (price * (taxRate / 100)) / 12;
    const monthlyIns = (price * 0.0033) / 12; // 0.33% annual estimate
    const total = monthlyPI + monthlyTax + monthlyIns + hoa;

    setPi(Math.round(monthlyPI));
    setTaxes(Math.round(monthlyTax));
    setInsurance(Math.round(monthlyIns));
    setMonthlyTotal(Math.round(total));
  }, [price, downPayment, interestRate, term, taxRate, hoa]);

  // Dynamic conic-gradient for the pie chart
  const getPieStyle = () => {
    const total = monthlyTotal || 1;
    const pctPi = (pi / total) * 100;
    const pctTax = (taxes / total) * 100;
    const pctInsurance = (insurance / total) * 100;

    return {
      background: `conic-gradient(
        #991b1b 0% ${pctPi}%,
        #c5a059 ${pctPi}% ${pctPi + pctTax}%,
        #4b5563 ${pctPi + pctTax}% ${pctPi + pctTax + pctInsurance}%,
        #8c7e6b ${pctPi + pctTax + pctInsurance}% 100%
      )`
    };
  };

  const formatCurrency = (num: number) => {
    return '$' + Math.round(num).toLocaleString();
  };

  return (
    <section id="calculator-section" className="py-10 bg-slate-900 border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-serif text-white mb-3">San Jose Affordability Calculator</h2>
          <p className="text-slate-400 text-sm max-w-[600px] mx-auto">
            Estimate monthly expenses using current Bay Area tax guidelines and prevailing interest rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label htmlFor="price-slider" className="text-slate-300 font-medium">Home Price</Label>
                <span className="text-[#d4af37] font-semibold">{formatCurrency(price)}</span>
              </div>
              <Slider
                id="price-slider"
                min={400000}
                max={5000000}
                step={50000}
                value={[price]}
                onValueChange={(val) => {
                  if (Array.isArray(val)) {
                    setPrice(val[0]);
                  } else if (typeof val === 'number') {
                    setPrice(val);
                  }
                }}
                className="py-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="downPayment" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Down Payment ($)</Label>
              <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                <span className="text-slate-400 mr-1 text-sm">$</span>
                <Input
                  type="number"
                  id="downPayment"
                  value={downPayment}
                  onChange={(e) => handleDownPaymentChange(parseInt(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="downPercent" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Down Payment (%)</Label>
              <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                <Input
                  type="number"
                  id="downPercent"
                  value={downPercent}
                  onChange={(e) => handleDownPercentChange(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto pr-6"
                />
                <span className="text-slate-400 absolute right-4 text-sm">%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="interestRate" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Interest Rate</Label>
              <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                <Input
                  type="number"
                  id="interestRate"
                  value={interestRate}
                  step={0.1}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto pr-6"
                />
                <span className="text-slate-400 absolute right-4 text-sm">%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="term" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Loan Term</Label>
              <Select
                value={term.toString()}
                onValueChange={(val) => val && setTerm(parseInt(val))}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[50px]">
                  <SelectValue placeholder="30 Years" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="30">30 Years (Fixed)</SelectItem>
                  <SelectItem value="15">15 Years (Fixed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="taxRate" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Property Tax Rate</Label>
              <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                <Input
                  type="number"
                  id="taxRate"
                  value={taxRate}
                  step={0.01}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto pr-6"
                />
                <span className="text-slate-400 absolute right-4 text-sm">%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="hoa" className="text-xs text-slate-400 font-medium uppercase tracking-wider">Monthly HOA Fee</Label>
              <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                <span className="text-slate-400 mr-1 text-sm">$</span>
                <Input
                  type="number"
                  id="hoa"
                  value={hoa}
                  onChange={(e) => setHoa(parseInt(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

          </div>

          {/* Results Display */}
          <div className="bg-slate-950/60 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl p-6 flex flex-col items-center">
            
            <div className="text-center pb-6 border-b border-white/5 w-full">
              <div className="text-slate-400 text-sm mb-1">Estimated Monthly Payment</div>
              <div className="text-5xl font-bold text-[#d4af37] tracking-tight">{formatCurrency(monthlyTotal)}</div>
            </div>

            <div className="w-full flex flex-col gap-3.5 py-6 border-b border-white/5">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-[#991b1b]" /> Principal & Interest
                </span>
                <span className="font-semibold text-slate-200">{formatCurrency(pi)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-[#c5a059]" /> Property Taxes
                </span>
                <span className="font-semibold text-slate-200">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-[#4b5563]" /> Homeowner's Insurance
                </span>
                <span className="font-semibold text-slate-200">{formatCurrency(insurance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-[#8c7e6b]" /> HOA Fees
                </span>
                <span className="font-semibold text-slate-200">{formatCurrency(hoa)}</span>
              </div>
            </div>

            {/* Visual Chart representation */}
            <div className="flex justify-center mt-8">
              <div className="w-40 h-40 rounded-full relative shadow-inner flex items-center justify-center" style={getPieStyle()}>
                <div className="absolute w-[100px] h-[100px] rounded-full bg-slate-950 flex items-center justify-center text-xs font-semibold text-slate-400">
                  Expenses
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
