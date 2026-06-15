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
        const marbellaData: Omit<Property, 'id' | 'days_on_market'> = {
          title: "Stunning Cambrian Upgraded Family Home",
          neighborhood: "Cambrian",
          price: 2399000,
          beds: 4,
          baths: 3,
          sqft: 1671,
          type: "House",
          status: "Buy",
          school_rating: 9,
          school_details: "Union School District: Carlton Elementary, Union Middle, Leigh High (9/10)",
          commute_times: { apple: 18, google: 22, nvidia: 20, adobe: 12 },
          solar: false,
          ev_charging: false,
          turnkey: true,
          image: "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=0&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
          images: [
            "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=0&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
            "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=1&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
            "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=2&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
            "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=3&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
            "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=4&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
            "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=5&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747"
          ],
          description: "Stunning 1993-built home in the top-rated Union School District where over $120K in recent upgrades has transformed it into a modern masterpiece. The bright and open floor plan boasts high ceilings, premium flooring, custom lighting, and gourmet chef's kitchen. Located on a quiet cul-de-sac with beautiful curb appeal, private backyard, and easy access to top parks, dining, and Silicon Valley commuter routes."
        };

        // Filter duplicates: Keep only the first listing that contains the word "Marbella"
        let marbellaFound = false;
        let merged = parsed.filter(p => {
          const isMarbella = 
            (p.title && p.title.toLowerCase().includes('marbella')) || 
            (p.description && p.description.toLowerCase().includes('marbella')) ||
            (p.school_details && p.school_details.toLowerCase().includes('marbella'));
          
          if (isMarbella) {
            if (!marbellaFound) {
              marbellaFound = true;
              return true;
            }
            return false;
          }
          return true;
        });

        const marbellaIndex = merged.findIndex(p => 
          (p.title && p.title.toLowerCase().includes('marbella')) || 
          (p.description && p.description.toLowerCase().includes('marbella')) ||
          (p.school_details && p.school_details.toLowerCase().includes('marbella'))
        );

        if (marbellaIndex !== -1) {
          merged[marbellaIndex] = {
            ...merged[marbellaIndex],
            ...marbellaData
          };
        } else {
          merged.push({
            ...marbellaData,
            id: 8,
            days_on_market: 1
          });
        }

        const updated = merged.map(p => {
          const defaultMatch = defaultProperties.find(dp => dp.id === p.id);
          return defaultMatch ? defaultMatch : p;
        });
        const missing = defaultProperties.filter(
          dp => !updated.some(p => p.id === dp.id)
        );
        const finalMerged = [...updated, ...missing];

        if (JSON.stringify(parsed) !== JSON.stringify(finalMerged)) {
          setProperties(finalMerged);
          localStorage.setItem('valley_properties', JSON.stringify(finalMerged));
        } else {
          setProperties(parsed);
        }
      } else {
        const initialProperties: Property[] = [
          ...defaultProperties,
          {
            id: 8,
            title: "Stunning Cambrian Upgraded Family Home",
            neighborhood: "Cambrian",
            price: 2399000,
            beds: 4,
            baths: 3,
            sqft: 1671,
            type: "House",
            status: "Buy",
            school_rating: 9,
            school_details: "Union School District: Carlton Elementary, Union Middle, Leigh High (9/10)",
            commute_times: { apple: 18, google: 22, nvidia: 20, adobe: 12 },
            solar: false,
            ev_charging: false,
            turnkey: true,
            days_on_market: 1,
            image: "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=0&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
            images: [
              "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=0&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
              "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=1&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
              "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=2&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
              "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=3&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
              "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=4&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747",
              "https://search.mlslistings.com/MediaServer/GetMedia.ashx?Key=3014871579&TableID=9&Type=1&Number=5&Size=2&exk=3b10f352ca2b5fdb29fcf6f07d295747"
            ],
            description: "Stunning 1993-built home in the top-rated Union School District where over $120K in recent upgrades has transformed it into a modern masterpiece. The bright and open floor plan boasts high ceilings, premium flooring, custom lighting, and gourmet chef's kitchen. Located on a quiet cul-de-sac with beautiful curb appeal, private backyard, and easy access to top parks, dining, and Silicon Valley commuter routes."
          }
        ];
        setProperties(initialProperties);
        localStorage.setItem('valley_properties', JSON.stringify(initialProperties));
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
