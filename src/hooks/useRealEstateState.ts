import { useState, useEffect } from 'react';
import { Property, TourRequest, SellerLead } from '@/lib/types';
import { defaultProperties, defaultTours, defaultSellers } from '@/lib/data';

export function useRealEstateState() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [sellers, setSellers] = useState<SellerLead[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProps = localStorage.getItem('valley_properties');
      const storedTours = localStorage.getItem('valley_tours');
      const storedSellers = localStorage.getItem('valley_sellers');

      if (storedProps) {
        const parsed = JSON.parse(storedProps) as Property[];
        const updated = parsed.map(p => {
          const defaultMatch = defaultProperties.find(dp => dp.id === p.id);
          return defaultMatch ? defaultMatch : p;
        });
        const missing = defaultProperties.filter(
          dp => !updated.some(p => p.id === dp.id)
        );
        const merged = [...updated, ...missing];

        if (JSON.stringify(parsed) !== JSON.stringify(merged)) {
          setProperties(merged);
          localStorage.setItem('valley_properties', JSON.stringify(merged));
        } else {
          setProperties(parsed);
        }
      } else {
        setProperties(defaultProperties);
        localStorage.setItem('valley_properties', JSON.stringify(defaultProperties));
      }

      if (storedTours) {
        setTours(JSON.parse(storedTours));
      } else {
        setTours(defaultTours);
        localStorage.setItem('valley_tours', JSON.stringify(defaultTours));
      }

      if (storedSellers) {
        setSellers(JSON.parse(storedSellers));
      } else {
        setSellers(defaultSellers);
        localStorage.setItem('valley_sellers', JSON.stringify(defaultSellers));
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Helpers to persist updates
  const saveProperties = (updated: Property[]) => {
    setProperties(updated);
    localStorage.setItem('valley_properties', JSON.stringify(updated));
  };

  const saveTours = (updated: TourRequest[]) => {
    setTours(updated);
    localStorage.setItem('valley_tours', JSON.stringify(updated));
  };

  const saveSellers = (updated: SellerLead[]) => {
    setSellers(updated);
    localStorage.setItem('valley_sellers', JSON.stringify(updated));
  };

  // CRUD for properties
  const addProperty = (newProp: Omit<Property, 'id' | 'days_on_market'>) => {
    const fresh: Property = {
      ...newProp,
      id: Date.now(),
      days_on_market: 1
    };
    saveProperties([fresh, ...properties]);
  };

  const editProperty = (id: number | string, fields: Partial<Property>) => {
    const updated = properties.map(p => p.id === id ? { ...p, ...fields } : p);
    saveProperties(updated);
  };

  const deleteProperty = (id: number | string) => {
    const updated = properties.filter(p => p.id !== id);
    saveProperties(updated);
  };

  const bulkImportProperties = (imported: Property[]) => {
    // Generate unique ids to avoid overrides
    const verified = imported.map((p, index) => ({
      ...p,
      id: p.id || `csv-${Date.now()}-${index}`,
      days_on_market: p.days_on_market || 1
    }));
    saveProperties([...verified, ...properties]);
  };

  // CRUD for leads
  const addTour = (tour: Omit<TourRequest, 'id' | 'time' | 'status'>) => {
    const fresh: TourRequest = {
      ...tour,
      id: Date.now(),
      time: 'Just now',
      status: 'Pending'
    };
    saveTours([fresh, ...tours]);
  };

  const addSeller = (seller: Omit<SellerLead, 'id' | 'time' | 'status'>) => {
    const fresh: SellerLead = {
      ...seller,
      id: Date.now(),
      time: 'Just now',
      status: 'Pending'
    };
    saveSellers([fresh, ...sellers]);
  };

  const updateTourStatus = (id: number, status: 'Pending' | 'Contacted' | 'Archived') => {
    const updated = tours.map(t => t.id === id ? { ...t, status } : t);
    saveTours(updated);
  };

  const updateSellerStatus = (id: number, status: 'Pending' | 'Contacted' | 'Archived') => {
    const updated = sellers.map(s => s.id === id ? { ...s, status } : s);
    saveSellers(updated);
  };

  return {
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
  };
}
