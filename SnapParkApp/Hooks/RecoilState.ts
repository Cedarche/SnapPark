import { atom } from "recoil";
import { lightTheme, darkTheme } from "../Theme/theme";
import { UserStateTypes, OfficeData } from "./Types";
import { storage } from "Hooks/useStorage";

let defaultTheme = lightTheme;
try {
  const savedThemeString = storage.getString("themePreference");
  defaultTheme = savedThemeString === "darkTheme" ? darkTheme : lightTheme;
} catch (error) {
  console.error("Failed to parse theme from storage:", error);
}

export const themeState = atom({
  key: "themeState",
  default: defaultTheme, // or darkTheme
});

export const pushNotificationToken = atom({
  key: "pushNotificationToken",
  default: "",
});

export const userState = atom<UserStateTypes>({
  key: "userState",
  default: {
    company: "",
    mobile: "",
    name: "",
    notifications: false,
    office: "",
    anonymous: false
  },
});

export const initialParams = atom({
  key: 'initialParams',
  default: {
    companyID: '',
    officeID: '',
    linkingCode: ''
  }
})



export const officeState = atom<OfficeData>({
  key: "officeState",
  default: null,
});

export const existsInOfficeState = atom({
  key: "existsInOfficeState",
  default: true,
});



export const bottomSheetState = atom({
  key: "bottomSheetState",
  default: {
    isOpen: false,
    spotData: null,
  },
});
export const mapSheetState = atom({
  key: "mapSheetState",
  default: {
    isOpen: false,
    parkingSpotData: null,
    index: 0,
    component: 'RenderParkingSpots'
  },
});
