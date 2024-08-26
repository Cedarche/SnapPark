import { Dispatch, SetStateAction } from "react";

export type CurrencyCode = "AUD" | "USD" | "EUR" | "GBP";
export type Frequency = string;

export interface Price {
  [key: string]: { [key in CurrencyCode]: number | string };
}

interface CountryInfo {
  currencies: string[];
  [key: string]: any; // Add this line to handle any additional properties
}

export interface PaymentTier {
  name: string;
  id: string;
  href: string;
  price: Price;
  priceID: any;
  limits: {
    offices: number;
    employees: number;
  };
  description: string;
  features: string[];
  officeLimit: number;
  notificationListLimit: number;
  mostPopular: boolean;
  comingSoon?: boolean;
  metricName: any;
}

export interface Selected {
  id: string;
  name: string;
  price: Record<CurrencyCode, string | number>;
  priceID: string | Record<string, string>;
  metricName: string;
  limits: any;
}

export interface Plan {
  name: string;
  currencyCode: CurrencyCode;

  limits: {
    offices: number;
    employees: number;
  };
  billingType: Frequency;
  metricName: string;
  price: Record<string, Record<CurrencyCode, string | number>>;
  priceID: string;
  id: string;
}

export interface Spot {
  name: string;
  available: boolean;
  office: string;
  utilisation: number;
  createdAt: any;
  totalUsedDays: number;
  totalUnusedDays: number;
  lastToggledDate: string;
  placeholder: string;
}

export interface Address {
  street: string;
  address2?: any;
  locality: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ProfileState {
  website?: string;
  mobile?: string;
  country?: string;
  countryInfo?: CountryInfo; // Update this line to use the CountryInfo interface
  offices?: string[];
  logoPath?: string | null; // Allow null
  spotsArray?: Spot[];
  plan?: Plan;
  address?: Address;
}

export interface OfficeData {
  id: string;
  data: {
    parkingSpots?: any[];
  };
  [key: string]: any; // Allow dynamic properties if necessary
}

export type Employee = {
  name: string;
  notifications: boolean;
  mobile: string;
};

export interface NotificationSettings {
  allNotifications: boolean;
  fullNotification: boolean;
  threeSpotsNotification: boolean;
}
export interface ToolTipProps {
  isTooltipVisible: boolean;
  setIsTooltipVisible: Dispatch<SetStateAction<boolean>>;
  text: string;
  link?: string; // Optional link prop
}

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type FormattedResult = {
  name: string;
  address: string;
  geometry: {
    lat: number;
    lng: number;
  };
  distance: number;
  place_id: string;
  metadata: {
    business_status?: string;
    types?: string[];
    rating?: number;
    user_ratings_total?: number;
    photos?: any[]; // Using 'any' here due to the complex nature of Google Photos
    icon?: string;
  };
};

export type ParkingResult = {
  name: string;
  address: string;
  geometry: {
    lat: number;
    lng: number;
  };
  place_id: string;
};

export type ParkingPlace = {
  placeId: string;
};
