'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface FilterState {
  neighborhood: string;
  maxPrice: string;
  type: string;
  status: string;
  minSchools: number;
  commuteTarget: string;
  maxCommuteTime: number;
  solar: boolean;
  evReady: boolean;
  turnkey: boolean;
}

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const next = { ...filters, [key]: value };
    onChange(next);
  };

  return (
    <div className="w-full bg-slate-900/75 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Neighborhood */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="neighborhood" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Neighborhood</Label>
          <Select
            value={filters.neighborhood}
            onValueChange={(val) => val && updateFilter('neighborhood', val)}
          >
            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
              <SelectValue placeholder="All San Jose Areas" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
              <SelectItem value="all">All San Jose Areas</SelectItem>
              <SelectItem value="Evergreen">Evergreen</SelectItem>
              <SelectItem value="Willow Glen">Willow Glen</SelectItem>
              <SelectItem value="Cambrian">Cambrian</SelectItem>
              <SelectItem value="Almaden Valley">Almaden Valley</SelectItem>
              <SelectItem value="Silver Creek">Silver Creek</SelectItem>
              <SelectItem value="Cupertino">Cupertino</SelectItem>
              <SelectItem value="North San Jose">North San Jose</SelectItem>
              <SelectItem value="Downtown San Jose">Downtown San Jose</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Price */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxPrice" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Max Price</Label>
          <Select
            value={filters.maxPrice}
            onValueChange={(val) => val && updateFilter('maxPrice', val)}
          >
            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="800000">Under $800,000</SelectItem>
              <SelectItem value="1200000">Under $1.2M</SelectItem>
              <SelectItem value="1600000">Under $1.6M</SelectItem>
              <SelectItem value="2000000">Under $2.0M</SelectItem>
              <SelectItem value="3500000">Under $3.5M</SelectItem>
              <SelectItem value="5000000">Under $5.0M</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="type" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Property Type</Label>
          <Select
            value={filters.type}
            onValueChange={(val) => val && updateFilter('type', val)}
          >
            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="House">Single Family House</SelectItem>
              <SelectItem value="Condo">Condominium</SelectItem>
              <SelectItem value="Townhouse">Townhome</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="status" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Transaction</Label>
          <Select
            value={filters.status}
            onValueChange={(val) => val && updateFilter('status', val)}
          >
            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
              <SelectValue placeholder="Buy or Rent" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
              <SelectItem value="all">Buy or Rent</SelectItem>
              <SelectItem value="Buy">For Sale (Buy)</SelectItem>
              <SelectItem value="Rent">For Lease (Rent)</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-4 text-[#d4af37] text-xs font-semibold uppercase tracking-wider hover:underline flex items-center gap-1"
      >
        {showAdvanced ? 'Hide Advanced Filters (- Options)' : 'Advanced Bay Area Filters (+ Options)'}
      </button>

      {/* Advanced Panel */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5 animate-fadeIn">
          
          {/* Min School Rating */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="minSchools" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Min School Rating</Label>
            <Select
              value={filters.minSchools.toString()}
              onValueChange={(val) => val && updateFilter('minSchools', parseInt(val))}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="7">7+/10 (Good)</SelectItem>
                <SelectItem value="8">8+/10 (Very Good)</SelectItem>
                <SelectItem value="9">9+/10 (Elite)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Commute Target */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="commuteTarget" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Commute Target</Label>
            <Select
              value={filters.commuteTarget}
              onValueChange={(val) => val && updateFilter('commuteTarget', val)}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
                <SelectValue placeholder="Any Campus" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                <SelectItem value="any">Any Campus</SelectItem>
                <SelectItem value="apple">Apple Park (Cupertino)</SelectItem>
                <SelectItem value="google">Googleplex (Mountain View)</SelectItem>
                <SelectItem value="nvidia">Nvidia HQ (Santa Clara)</SelectItem>
                <SelectItem value="adobe">Adobe HQ (Downtown SJ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Commute Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="maxCommuteTime" className="text-xs uppercase tracking-wider text-slate-400 font-medium">Max Commute Time</Label>
            <Select
              value={filters.maxCommuteTime.toString()}
              onValueChange={(val) => val && updateFilter('maxCommuteTime', parseInt(val))}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl text-slate-100 h-11">
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                <SelectItem value="999">Any Time</SelectItem>
                <SelectItem value="10">Under 10 mins</SelectItem>
                <SelectItem value="15">Under 15 mins</SelectItem>
                <SelectItem value="25">Under 25 mins</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      )}

      {/* Feature Checkboxes */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="solar"
            checked={filters.solar}
            onCheckedChange={(val) => updateFilter('solar', !!val)}
            className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
          />
          <Label htmlFor="solar" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
            Solar Panels Installed
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="evReady"
            checked={filters.evReady}
            onCheckedChange={(val) => updateFilter('evReady', !!val)}
            className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
          />
          <Label htmlFor="evReady" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
            EV Charging Ready
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="turnkey"
            checked={filters.turnkey}
            onCheckedChange={(val) => updateFilter('turnkey', !!val)}
            className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
          />
          <Label htmlFor="turnkey" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
            Turnkey / Renovated
          </Label>
        </div>
      </div>

    </div>
  );
}
