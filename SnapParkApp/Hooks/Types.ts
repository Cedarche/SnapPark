export interface UserStateTypes {
  company: string;
  mobile: string;
  name: string;
  notifications: boolean;
  office: string;
  anonymous: boolean
}

export interface OfficeData {
  company?: string;
  companyID?: string;
  office?: string;
  officeID?: string;
  parkingSpots?: {
    name: string;
    available: boolean;
    createdAt: string;
    office: string;
    utilisation: number;
    lastToggledDate: string;
    totalUsedDays: number;
  }[];
  logoURL?: string;
  logoAlt?: string;
  notificationSettings?: any;
  messageSent?: boolean;
  customMessageSent?: boolean;
  threeSpotsMessageSent?: boolean;
  address?: any;
  alternativeParkingList?: any;
}
