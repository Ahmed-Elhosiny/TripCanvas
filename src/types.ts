/* ------------------------------------------------------------------ */
/*  TripCanvas — domain models                                         */
/* ------------------------------------------------------------------ */

export type CityId =
  | 'rome' | 'florence' | 'venice'
  | 'paris'
  | 'tokyo' | 'kyoto' | 'osaka';

export type PlaceCategory =
  | 'attraction' | 'restaurant' | 'cafe'
  | 'museum' | 'shopping' | 'nature';

/** Activities can also be logistics (trains, flights…) */
export type ActivityCategory = PlaceCategory | 'other';

export type ExpenseCategory =
  | 'stays' | 'food' | 'transport' | 'activities' | 'shopping' | 'other';

export type TripStatus = 'draft' | 'planning' | 'ready' | 'done';
export type Currency = 'EUR' | 'USD' | 'GBP';
export type DistanceUnit = 'km' | 'mi';

export interface Place {
  id: string;
  name: string;
  city: CityId;
  area: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  rating: number;      // 0..5
  reviews: number;
  cost: number;        // EUR, per person
  durationMin: number; // suggested dwell
  hours: string;
  image?: string;
  blurb: string;
}

export interface Activity {
  id: string;
  placeId?: string;
  title: string;
  category: ActivityCategory;
  time: string;        // "HH:MM"
  durationMin: number;
  cost: number;        // EUR estimate
  note?: string;
  lat?: number;
  lng?: number;
}

export interface Day {
  id: string;
  date: string;        // ISO yyyy-mm-dd
  city: CityId;
  activities: Activity[];
}

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;      // EUR
  date: string;
  note?: string;
}

export interface Memory {
  id: string;
  date: string;
  place: string;
  city: CityId;
  image?: string;
  caption: string;
  note?: string;
}

export interface Trip {
  id: string;
  name: string;
  cover?: string;
  start: string;
  end: string;
  cities: CityId[];
  budget: number;      // EUR
  status: TripStatus;
  savedPlaceIds: string[];
  days: Day[];
  expenses: Expense[];
  memories: Memory[];
}

export interface Settings {
  traveler: string;
  email: string;
  home: string;
  currency: Currency;
  unit: DistanceUnit;
}

export interface AppState {
  trips: Trip[];
  settings: Settings;
}

/* ------------------------------------------------------------------ */
/*  Reference metadata                                                 */
/* ------------------------------------------------------------------ */

export const CITIES: Record<CityId, { name: string; country: string; lat: number; lng: number }> = {
  rome:     { name: 'Rome',     country: 'Italy',   lat: 41.9009, lng: 12.4833 },
  florence: { name: 'Florence', country: 'Italy',   lat: 43.7696, lng: 11.2558 },
  venice:   { name: 'Venice',   country: 'Italy',   lat: 45.4408, lng: 12.3155 },
  paris:    { name: 'Paris',    country: 'France',  lat: 48.8566, lng: 2.3522 },
  tokyo:    { name: 'Tokyo',    country: 'Japan',   lat: 35.6762, lng: 139.6503 },
  kyoto:    { name: 'Kyoto',    country: 'Japan',   lat: 35.0116, lng: 135.7681 },
  osaka:    { name: 'Osaka',    country: 'Japan',   lat: 34.6937, lng: 135.5023 },
};

export const CATEGORY_META: Record<ActivityCategory, { label: string; color: string }> = {
  attraction: { label: 'Attraction', color: '#E8A33D' },
  restaurant: { label: 'Restaurant', color: '#E4572E' },
  cafe:       { label: 'Café',       color: '#8F6A45' },
  museum:     { label: 'Museum',     color: '#2E6B60' },
  shopping:   { label: 'Shopping',   color: '#7E5A78' },
  nature:     { label: 'Nature',     color: '#4C7A52' },
  other:      { label: 'Logistics',  color: '#8A8778' },
};

export const EXPENSE_META: Record<ExpenseCategory, { label: string; color: string }> = {
  stays:      { label: 'Stays',      color: '#2E6B60' },
  food:       { label: 'Food',       color: '#E4572E' },
  transport:  { label: 'Transport',  color: '#E8A33D' },
  activities: { label: 'Activities', color: '#7E5A78' },
  shopping:   { label: 'Shopping',   color: '#C0604F' },
  other:      { label: 'Other',      color: '#8A8778' },
};

export const STATUS_META: Record<TripStatus, { label: string; className: string }> = {
  draft:    { label: 'Draft',    className: 'bg-mist text-moss' },
  planning: { label: 'Planning', className: 'bg-saffron/20 text-[#8a5c14]' },
  ready:    { label: 'Ready',    className: 'bg-teal/15 text-teal' },
  done:     { label: 'Completed', className: 'bg-pine text-chalk' },
};
