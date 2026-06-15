'use client';

import React, { useState, useTransition } from 'react';
import { useRealEstateState } from '@/hooks/useRealEstateState';
import { FilterState, SearchFilters } from '@/components/SearchFilters';
import { MortgageCalculator } from '@/components/MortgageCalculator';
import { AdminPortal } from '@/components/AdminPortal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Property, TourRequest, SellerLead } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Home() {
  const {
    properties,
    tours,
    sellers,
    isLoaded,
    addProperty,
    editProperty,
    deleteProperty,
    bulkImportProperties,
    addTour,
    addSeller,
    updateTourStatus,
    updateSellerStatus
  } = useRealEstateState();

  // Active filters state
  const [filters, setFilters] = useState<FilterState>({
    neighborhood: 'all',
    maxPrice: 'all',
    type: 'all',
    status: 'all',
    minSchools: 0,
    commuteTarget: 'any',
    maxCommuteTime: 999,
    solar: false,
    evReady: false,
    turnkey: false
  });

  // Sorting
  const [sortBy, setSortBy] = useState('price-asc');

  // Modals visibility
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);

  // Detail Dialog Modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  // Card-specific active image indices for grid cycling
  const [cardImageIndices, setCardImageIndices] = useState<Record<string | number, number>>({});

  const handleNextImage = (propId: string | number, imagesCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardImageIndices(prev => ({
      ...prev,
      [propId]: ((prev[propId] || 0) + 1) % imagesCount
    }));
  };

  const handlePrevImage = (propId: string | number, imagesCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardImageIndices(prev => ({
      ...prev,
      [propId]: ((prev[propId] || 0) - 1 + imagesCount) % imagesCount
    }));
  };

  // Mortgage Calculator Sync Target Price
  const [calculatorPrice, setCalculatorPrice] = useState<number>(1500000);

  // Form states
  const [tourForm, setTourForm] = useState({ name: '', phone: '', date: '' });
  const [sellForm, setSellForm] = useState({
    name: '',
    email: '',
    street: '',
    neighborhood: 'Evergreen',
    beds: 3,
    baths: 2.5,
    sqft: 1800,
    type: 'House',
    solar: false,
    ev: false,
    turnkey: false,
    notes: ''
  });

  // Filter listings helper
  const getFilteredProperties = () => {
    let list = [...properties];

    if (filters.neighborhood !== 'all') {
      list = list.filter(p => p.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase()));
    }
    if (filters.maxPrice !== 'all') {
      list = list.filter(p => p.price <= parseFloat(filters.maxPrice));
    }
    if (filters.type !== 'all') {
      list = list.filter(p => p.type.toLowerCase().includes(filters.type.toLowerCase()));
    }
    if (filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters.minSchools > 0) {
      list = list.filter(p => p.school_rating >= filters.minSchools);
    }
    if (filters.commuteTarget !== 'any') {
      list = list.filter(p => p.commute_times[filters.commuteTarget as keyof typeof p.commute_times] <= filters.maxCommuteTime);
    }
    if (filters.solar) {
      list = list.filter(p => p.solar === true);
    }
    if (filters.evReady) {
      list = list.filter(p => p.ev_charging === true);
    }
    if (filters.turnkey) {
      list = list.filter(p => p.turnkey === true);
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'schools-desc') {
      list.sort((a, b) => b.school_rating - a.school_rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => a.days_on_market - b.days_on_market);
    }

    return list;
  };

  const filteredProperties = getFilteredProperties();

  // Footer click handlers
  const handleLocationClick = (neighborhood: string) => {
    setFilters(prev => ({ ...prev, neighborhood }));
    const el = document.getElementById('properties-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStatusClick = (status: 'Buy' | 'Rent') => {
    setFilters(prev => ({ ...prev, status }));
    const el = document.getElementById('properties-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEstimateClick = (price: number, status: string) => {
    setCalculatorPrice(price);
    const el = document.getElementById('calculator-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Form actions
  const handleTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    const formattedDate = new Date(tourForm.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    addTour({
      property: selectedProperty.title,
      client: tourForm.name,
      phone: tourForm.phone,
      date: `${formattedDate}, Afternoon`,
      notes: "Lead generated via Property Detail Modal."
    });

    setSelectedProperty(null);
    setTourForm({ name: '', phone: '', date: '' });
    alert(`Thank you, ${tourForm.name}! Your tour booking has been logged in our Operations Dashboard.`);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addSeller({
      name: sellForm.name,
      email: sellForm.email,
      address: `${sellForm.street}, ${sellForm.neighborhood}`,
      type: sellForm.type,
      beds: sellForm.beds,
      baths: sellForm.baths,
      sqft: sellForm.sqft,
      solar: sellForm.solar,
      ev: sellForm.ev,
      turnkey: sellForm.turnkey,
      notes: sellForm.notes || "Listing valuation request."
    });

    setIsSellOpen(false);
    setSellForm({
      name: '',
      email: '',
      street: '',
      neighborhood: 'Evergreen',
      beds: 3,
      baths: 2.5,
      sqft: 1800,
      type: 'House',
      solar: false,
      ev: false,
      turnkey: false,
      notes: ''
    });
    alert(`Thank you, ${sellForm.name}! Your property details have been recorded. Our team will generate your comparative valuation report.`);
  };

  return (
    <div className="bg-[#f5f2eb] min-h-screen text-slate-800 selection:bg-[#fee2e2] selection:text-[#991b1b]">

      {/* Navbar header */}
      <Header
        onAdminClick={() => setIsAdminOpen(true)}
        onSellClick={() => setIsSellOpen(true)}
        isAdminLoggedIn={isAdminOpen}
      />

      {/* Hero section */}
      <section className="relative min-h-[70vh] flex items-center pt-16 pb-8 overflow-hidden bg-cover bg-center hero-section-bg">
        <div className="max-w-[1280px] mx-auto px-6 w-full relative z-10 flex flex-col justify-center">
          <div className="max-w-[800px]">
            <h1 className="reveal-1 text-5xl md:text-7xl font-bold tracking-tight text-[#7f1d1d] mb-6 leading-tight">
              Find Your <span className="text-[#991b1b]">Silicon Valley</span><br />
              <span className="font-serif font-normal italic text-slate-800">Dream Home</span>
            </h1>
            <p className="reveal-2 text-slate-600 text-lg md:text-xl font-medium mb-6 max-w-[620px] leading-relaxed">
              Tailored real estate services for the California Bay Area. View premium listings aligned with elite school districts and proximity to major tech campuses.
            </p>

            <div className="reveal-3 flex flex-wrap gap-8 mt-4">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#d4af37] tracking-tight">$1.5M</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">Median Price</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#d4af37] tracking-tight">13 Days</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">Avg. on Market</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#d4af37] tracking-tight">6.5%</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">Interest Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter cards */}
      <section className="relative z-20 max-w-[1280px] mx-auto px-6 -mt-12 mb-12">
        <SearchFilters filters={filters} onChange={setFilters} />
      </section>

      {/* Listing directory grid */}
      <section id="properties-section" className="py-8 max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
          <div className="text-slate-300 text-sm font-medium">
            {!isLoaded ? 'Loading listings...' : `Showing ${filteredProperties.length} property listings`}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Sort By</span>
            <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 cursor-pointer outline-none font-medium"
              >
                <option value="price-asc" className="bg-slate-900 text-slate-300">Price: Low to High</option>
                <option value="price-desc" className="bg-slate-900 text-slate-300">Price: High to Low</option>
                <option value="schools-desc" className="bg-slate-900 text-slate-300">School Rating</option>
                <option value="newest" className="bg-slate-900 text-slate-300">Newest Listings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const activeIdx = cardImageIndices[prop.id] || 0;
            const imagesList = prop.images && prop.images.length > 0 ? prop.images : [prop.image];
            const currentImg = imagesList[activeIdx % imagesList.length];

            return (
              <div
                key={prop.id}
                onClick={() => { setSelectedProperty(prop); setActiveImageIdx(activeIdx); }}
                className="group flex flex-col bg-slate-900/40 border border-white/5 hover:border-[#d4af37]/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >

                {/* Card Image header */}
                <div className="relative h-60 overflow-hidden">
                  <img src={currentImg} alt={prop.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />

                  {/* Left / Right Cycle Arrows */}
                  {imagesList.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevImage(prop.id, imagesList.length, e)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-[#d1d5db] hover:text-[#ffffff] bg-[#111827]/70 hover:bg-[#111827]/90 transition-all opacity-0 group-hover:opacity-100"
                        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                        title="Previous Image"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <button
                        onClick={(e) => handleNextImage(prop.id, imagesList.length, e)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-[#d1d5db] hover:text-[#ffffff] bg-[#111827]/70 hover:bg-[#111827]/90 transition-all opacity-0 group-hover:opacity-100"
                        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                        title="Next Image"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>

                      {/* Image dots indicator */}
                      <div 
                        className="absolute bottom-4 right-4 z-10 flex gap-1 bg-[#111827]/60 px-2 py-1 rounded-full border border-white/5"
                        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                      >
                        {imagesList.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? 'bg-[#991b1b] w-3' : 'bg-slate-400'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                    {prop.solar && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm badge-solar">Solar</span>}
                    {prop.ev_charging && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm badge-ev">EV Ready</span>}
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm badge-schools">{prop.school_rating}/10 Schools</span>
                  </div>
                  <div 
                    className="absolute bottom-4 left-4 border border-white/10 rounded-lg px-3 py-1.5 text-lg font-bold text-[#ffffff] shadow-lg z-10"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                  >
                    {prop.status === 'Rent' ? `$${prop.price.toLocaleString()}/mo` : `$${prop.price.toLocaleString()}`}
                  </div>
                </div>

                {/* Card Content body */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-[#d4af37] transition-colors line-clamp-1">{prop.title}</h3>
                  <div className="text-slate-400 text-xs flex items-center gap-1 mb-2.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" /></svg>
                    {prop.neighborhood}, San Jose
                  </div>

                  <div className="flex gap-4 pb-3 border-b border-white/5 mb-3 text-xs text-slate-300">
                    <div><strong>{prop.beds}</strong> Bed</div>
                    <div><strong>{prop.baths}</strong> Bath</div>
                    <div><strong>{prop.sqft.toLocaleString()}</strong> Sq Ft</div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#d4af37]"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>District: {prop.school_details.split(' (')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#d4af37]"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>Nvidia Commute: {prop.commute_times.nvidia} mins</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProperty(prop); setActiveImageIdx(activeIdx); }}
                      className="flex items-center justify-center text-xs font-semibold text-slate-300 border border-white/10 hover:border-[#d4af37] hover:text-[#d4af37] transition-all px-3 h-8 rounded-lg"
                    >
                      Explore details
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEstimateClick(prop.price, prop.status); }}
                      className="flex items-center justify-center text-xs font-semibold text-slate-950 bg-[#d4af37] hover:bg-[#f3cf65] transition-all px-3 h-8 rounded-lg"
                    >
                      Estimate cost
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400">
              <h3 className="text-xl font-serif mb-1">No matching properties</h3>
              <p className="text-sm">Try clearing your filters or widening your search area.</p>
            </div>
          )}
        </div>
      </section>

      {/* Mortgage calculator widget */}
      <MortgageCalculator initialPrice={calculatorPrice} />

      {/* Admin control panel component */}
      <AdminPortal
        properties={properties}
        tours={tours}
        sellers={sellers}
        onAddProperty={addProperty}
        onEditProperty={editProperty}
        onDeleteProperty={deleteProperty}
        onImportProperties={bulkImportProperties}
        onUpdateTourStatus={updateTourStatus}
        onUpdateSellerStatus={updateSellerStatus}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Footer layout */}
      <Footer
        onLocationClick={handleLocationClick}
        onStatusClick={handleStatusClick}
        onValuationClick={() => setIsSellOpen(true)}
      />

      {/* DIALOGS */}

      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        {selectedProperty && (
          <DialogContent className="bg-[#faf9f6] border-[#e6e1d5] text-[#1f2937] sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex justify-between items-start">
              <DialogTitle className="font-bold tracking-tight text-2xl text-[#7f1d1d]">{selectedProperty.title}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-4">

              {/* Left Column: Image, Description, Schools */}
              <div className="col-span-1 md:col-span-3">
                {(() => {
                  const imagesList = selectedProperty.images && selectedProperty.images.length > 0
                    ? selectedProperty.images
                    : [selectedProperty.image];
                  const activeImg = imagesList[activeImageIdx] || selectedProperty.image;
                  return (
                    <div className="mb-6">
                      <div className="w-full h-80 rounded-xl overflow-hidden border border-white/5">
                        <img src={activeImg} alt={selectedProperty.title} className="w-full h-full object-cover" />
                      </div>
                      {imagesList.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-2 mt-3">
                          {imagesList.map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setActiveImageIdx(i)}
                              className={`relative w-20 h-14 rounded-lg overflow-hidden border transition-all shrink-0 ${activeImageIdx === i
                                ? 'border-[#d4af37] ring-1 ring-[#d4af37]'
                                : 'border-white/10 hover:border-white/30'
                                }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37] border-b border-white/5 pb-2 mb-3">About this Home</h4>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {selectedProperty.description && selectedProperty.description !== 'null'
                    ? selectedProperty.description
                    : "This exceptional Silicon Valley residence offers a premium lifestyle in a highly desirable neighborhood. Highlights include a spacious layout, proximity to elite school districts, and convenient commutes to major Bay Area tech employers. Contact our agent team for complete details and to schedule a private viewing."}
                </p>

                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">Elite Schools</h4>
                <div className="flex flex-col gap-3">
                  {selectedProperty.school_details.split(', ').map((school, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/2 border border-white/5 text-xs">
                      <span>{school.replace(` (${selectedProperty.school_rating}/10)`, '')}</span>
                      <span className="font-bold text-[#10b981]">{selectedProperty.school_rating}/10 Rating</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Listing specs, commutes, booking form */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                <div className="bg-white/2 border border-white/5 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center font-bold">M</div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Mohith Sindhia</div>
                      <div className="text-[10px] text-slate-400">Listing Specialist</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-2xl font-bold text-[#d4af37]">
                      {selectedProperty.status === 'Rent' ? `$${selectedProperty.price.toLocaleString()}/mo` : `$${selectedProperty.price.toLocaleString()}`}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {selectedProperty.beds} Bed | {selectedProperty.baths} Bath | {selectedProperty.sqft.toLocaleString()} Sq Ft
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-3">Estimated Commutes</h4>
                  <div className="flex flex-col gap-2.5 text-xs mb-6">
                    <div className="flex justify-between text-slate-400">
                      <span>Apple Park (Cupertino)</span>
                      <span className="font-semibold text-slate-200">{selectedProperty.commute_times.apple} mins</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Googleplex (Mountain View)</span>
                      <span className="font-semibold text-slate-200">{selectedProperty.commute_times.google} mins</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Nvidia HQ (Santa Clara)</span>
                      <span className="font-semibold text-slate-200">{selectedProperty.commute_times.nvidia} mins</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Adobe HQ (Downtown SJ)</span>
                      <span className="font-semibold text-slate-200">{selectedProperty.commute_times.adobe} mins</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-3">Schedule private viewing</h4>
                  <form onSubmit={handleTourSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="tName" className="text-[10px] uppercase text-slate-400">Your Name</Label>
                      <Input
                        id="tName"
                        required
                        value={tourForm.name}
                        onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-lg text-slate-100 text-xs h-9"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="tPhone" className="text-[10px] uppercase text-slate-400">Phone</Label>
                      <Input
                        id="tPhone"
                        required
                        type="tel"
                        value={tourForm.phone}
                        onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-lg text-slate-100 text-xs h-9"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="tDate" className="text-[10px] uppercase text-slate-400">Date</Label>
                      <Input
                        id="tDate"
                        required
                        type="date"
                        value={tourForm.date}
                        onChange={(e) => setTourForm({ ...tourForm, date: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-lg text-slate-100 text-xs h-9"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold text-xs h-9 mt-1">
                      Request Appointment
                    </Button>
                  </form>
                </div>
              </div>

            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={isSellOpen} onOpenChange={setIsSellOpen}>
        <DialogContent className="bg-[#faf9f6] border-[#e6e1d5] text-[#1f2937] sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight text-lg text-[#7f1d1d]">List Your Bay Area Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSellSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">

            <div className="flex flex-col gap-2">
              <Label htmlFor="sName" className="text-xs text-slate-400 font-medium">Owner Name</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="sName"
                  required
                  value={sellForm.name}
                  onChange={(e) => setSellForm({ ...sellForm, name: e.target.value })}
                  placeholder="Marcus Brody"
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sEmail" className="text-xs text-slate-400 font-medium">Email Address</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="sEmail"
                  type="email"
                  required
                  value={sellForm.email}
                  onChange={(e) => setSellForm({ ...sellForm, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sStreet" className="text-xs text-slate-400 font-medium">Street Address</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="sStreet"
                  required
                  value={sellForm.street}
                  onChange={(e) => setSellForm({ ...sellForm, street: e.target.value })}
                  placeholder="1234 Silver Creek Road"
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sNeigh" className="text-xs text-slate-400 font-medium">Neighborhood</Label>
              <Select
                value={sellForm.neighborhood}
                onValueChange={(val) => val && setSellForm({ ...sellForm, neighborhood: val })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[46px]">
                  <SelectValue placeholder="Evergreen" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="Evergreen">Evergreen</SelectItem>
                  <SelectItem value="Willow Glen">Willow Glen</SelectItem>
                  <SelectItem value="Almaden Valley">Almaden Valley</SelectItem>
                  <SelectItem value="Silver Creek">Silver Creek</SelectItem>
                  <SelectItem value="Cupertino">Cupertino</SelectItem>
                  <SelectItem value="North San Jose">North San Jose</SelectItem>
                  <SelectItem value="Downtown San Jose">Downtown San Jose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sBeds" className="text-xs text-slate-400 font-medium">Bedrooms</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="sBeds"
                  type="number"
                  required
                  value={sellForm.beds}
                  onChange={(e) => setSellForm({ ...sellForm, beds: parseInt(e.target.value) || 1 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sBaths" className="text-xs text-slate-400 font-medium">Bathrooms</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="sBaths"
                  type="number"
                  step={0.5}
                  required
                  value={sellForm.baths}
                  onChange={(e) => setSellForm({ ...sellForm, baths: parseFloat(e.target.value) || 1 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sSqft" className="text-xs text-slate-400 font-medium">Living Area (Sq Ft)</Label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Input
                  id="sSqft"
                  type="number"
                  required
                  value={sellForm.sqft}
                  onChange={(e) => setSellForm({ ...sellForm, sqft: parseInt(e.target.value) || 500 })}
                  className="bg-transparent border-none p-0 text-slate-100 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sType" className="text-xs text-slate-400 font-medium">Home Type</Label>
              <Select
                value={sellForm.type}
                onValueChange={(val) => val && setSellForm({ ...sellForm, type: val })}
              >
                <SelectTrigger className="bg-white/5 border border-white/10 rounded-xl text-slate-100 h-[46px]">
                  <SelectValue placeholder="House" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                  <SelectItem value="House">Single Family House</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
              <Label className="text-xs text-slate-400 font-medium">Property Features</Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sSolar"
                    checked={sellForm.solar}
                    onCheckedChange={(val) => setSellForm({ ...sellForm, solar: !!val })}
                    className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
                  />
                  <Label htmlFor="sSolar" className="text-sm text-slate-300 font-medium cursor-pointer">Paid Solar Panels</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sEv"
                    checked={sellForm.ev}
                    onCheckedChange={(val) => setSellForm({ ...sellForm, ev: !!val })}
                    className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
                  />
                  <Label htmlFor="sEv" className="text-sm text-slate-300 font-medium cursor-pointer">EV Charging Ready</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sTurnkey"
                    checked={sellForm.turnkey}
                    onCheckedChange={(val) => setSellForm({ ...sellForm, turnkey: !!val })}
                    className="border-white/20 data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-slate-950"
                  />
                  <Label htmlFor="sTurnkey" className="text-sm text-slate-300 font-medium cursor-pointer">Turnkey / Renovated</Label>
                </div>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="sNotes" className="text-xs text-slate-400 font-medium">Notes / Messages</Label>
              <Textarea
                id="sNotes"
                value={sellForm.notes}
                onChange={(e) => setSellForm({ ...sellForm, notes: e.target.value })}
                placeholder="Give details about upgrades, condition..."
                className="bg-white/5 border-white/10 rounded-xl text-slate-100 focus-visible:ring-0 min-h-[90px]"
              />
            </div>

            <DialogFooter className="col-span-1 sm:col-span-2 mt-4 gap-3">
              <Button type="button" onClick={() => setIsSellOpen(false)} className="bg-transparent border border-white/10 text-slate-200 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#d4af37] text-slate-950 hover:bg-[#f3cf65] font-semibold">
                Submit Listing Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
