export const defaultSettings = {
    fullNotification: true,
    threeSpotsNotification: false,
    allNotifications: false,
    customSpotsNotification: false,
    spotsRemainingValue: 3,
    customMessage: "",
    customSpotsArray: [],
  };
  
  export interface Activity {
    spot: string;
    name: string;
    timestamp: Date; // Use the correct Timestamp type based on your Firebase version
    available: boolean;
  }
  
  export interface OfficeData {
    company?: string;
    id?: string;
    office?: string;
    parkingSpots?: {
      name: string;
      available: boolean;
      office: string;
      utilisation: number;
      lastToggledDate?: any;
      createdAt: any;
      totalUsedDays: number;
      totalUnusedDays: number;
    }[];
    notificationList: any;
    activity?: Activity[];
    logoURL?: string;
    logoAlt?: string;
    messageSent?: boolean;
    threeSpotsMessageSent: boolean;
    customMessageSent: boolean;
    notificationSettings?: {
      fullNotification: boolean;
      threeSpotsNotification: boolean;
      allNotifications: boolean;
      spotsRemainingValue: number;
      customSpotsArray: any[];
      customSpotsNotification: boolean;
      cutomMessage: string;
    };
  }
  
  export interface CacheEntry {
    data: OfficeData;
    unsubscribe?: () => void; // Make unsubscribe optional
  }
  
  export const officeDataCache: { [key: string]: CacheEntry } = {};