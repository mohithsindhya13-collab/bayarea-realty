'use client';

import React from 'react';
import { Button } from './ui/button';

interface HeaderProps {
  onAdminClick: () => void;
  onSellClick: () => void;
  isAdminLoggedIn: boolean;
}

export function Header({ onAdminClick, onSellClick, isAdminLoggedIn }: HeaderProps) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-slate-950/75 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-width-1280 mx-auto px-6 h-full flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-wider text-slate-900">
          <div className="w-8 h-8 rounded-full border-2 border-[#991b1b] flex items-center justify-center text-xs font-black text-[#991b1b]">
            V
          </div>
          VALLEY & CO. <span className="font-serif font-normal text-[#991b1b]">REALTY</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a
            href="#properties-section"
            onClick={(e) => handleScroll(e, 'properties-section')}
            className="hover:text-[#d4af37] transition-colors"
          >
            Properties
          </a>
          <a
            href="#calculator-section"
            onClick={(e) => handleScroll(e, 'calculator-section')}
            className="hover:text-[#d4af37] transition-colors"
          >
            Mortgage Calculator
          </a>
          <button
            onClick={onAdminClick}
            className={`hover:text-[#d4af37] transition-colors text-left ${
              isAdminLoggedIn ? 'text-[#d4af37]' : ''
            }`}
          >
            {isAdminLoggedIn ? 'Admin Panel' : 'Agent Portal'}
          </button>
          <Button
            onClick={onSellClick}
            className="bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold transition-all px-4 py-2 rounded-lg text-xs"
          >
            List Your Home
          </Button>
        </nav>
      </div>
    </header>
  );
}
