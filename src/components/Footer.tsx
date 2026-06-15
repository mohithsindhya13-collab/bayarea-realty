'use client';

import React from 'react';

interface FooterProps {
  onLocationClick: (neighborhood: string) => void;
  onStatusClick: (status: 'Buy' | 'Rent') => void;
  onValuationClick: () => void;
}

export function Footer({ onLocationClick, onStatusClick, onValuationClick }: FooterProps) {
  return (
    <footer className="bg-slate-950/90 border-t border-white/5 pt-20 pb-12">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-6">
          <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-wider text-white">
            <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] flex items-center justify-center text-xs font-black text-[#d4af37]">
              V
            </div>
            VALLEY & CO. <span className="font-serif font-normal text-slate-300">REALTY</span>
          </a>
          <p className="text-slate-400 text-sm max-w-[320px]">
            Premium real estate advisory group serving San Jose, Cupertino, Santa Clara, and the broader California Bay Area.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Key Locations</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li>
              <button onClick={() => onLocationClick('Evergreen')} className="hover:text-[#d4af37] transition-all hover:pl-1">
                Evergreen
              </button>
            </li>
            <li>
              <button onClick={() => onLocationClick('Silver Creek')} className="hover:text-[#d4af37] transition-all hover:pl-1">
                Silver Creek
              </button>
            </li>
            <li>
              <button onClick={() => onLocationClick('Willow Glen')} className="hover:text-[#d4af37] transition-all hover:pl-1">
                Willow Glen
              </button>
            </li>
            <li>
              <button onClick={() => onLocationClick('Cupertino')} className="hover:text-[#d4af37] transition-all hover:pl-1">
                Cupertino
              </button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Services</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li>
              <button onClick={() => onStatusClick('Buy')} className="hover:text-[#d4af37] transition-all hover:pl-1">
                Buy a Home
              </button>
            </li>
            <li>
              <button onClick={() => onStatusClick('Rent')} className="hover:text-[#d4af37] transition-all hover:pl-1">
                Rent or Lease
              </button>
            </li>
            <li>
              <button onClick={onValuationClick} className="hover:text-[#d4af37] transition-all hover:pl-1 text-left">
                Home Valuation
              </button>
            </li>
            <li>
              <a href="#calculator-section" className="hover:text-[#d4af37] transition-all hover:pl-1">
                Mortgage Advisor
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Our Team</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li>Mohith Sindhia</li>
            <li>Shyam</li>
            <li>Aryan</li>
            <li>Pracheta (Lead Agent)</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>&copy; 2026 Valley & Co. Realty. All rights reserved. Created in partnership with Antigravity.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#d4af37] transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-[#d4af37] transition-colors">Zillow Agent Profile</a>
          <a href="#" className="hover:text-[#d4af37] transition-colors">Redfin Partner</a>
        </div>
      </div>
    </footer>
  );
}
