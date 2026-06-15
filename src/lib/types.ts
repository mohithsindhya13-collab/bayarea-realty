export interface CommuteTimes {
  apple: number;
  google: number;
  nvidia: number;
  adobe: number;
}

export interface Property {
  id: number | string;
  title: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: 'House' | 'Condo' | 'Townhouse' | string;
  status: 'Buy' | 'Rent';
  school_rating: number;
  school_details: string;
  commute_times: CommuteTimes;
  solar: boolean;
  ev_charging: boolean;
  turnkey: boolean;
  days_on_market: number;
  image: string;
  images?: string[];
  description: string;
}

export interface TourRequest {
  id: number;
  property: string;
  client: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
  status?: 'Pending' | 'Contacted' | 'Archived';
}

export interface SellerLead {
  id: number;
  name: string;
  email: string;
  address: string;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  solar: boolean;
  ev: boolean;
  turnkey: boolean;
  time: string;
  notes: string;
  status?: 'Pending' | 'Contacted' | 'Archived';
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  initial: string;
}
