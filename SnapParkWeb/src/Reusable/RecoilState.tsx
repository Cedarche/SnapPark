import { atom } from "recoil";
import { DocumentData } from "firebase/firestore";
import { Spot, ProfileState, OfficeData, PaymentTier} from "./Types/types";

const stepsArray = [
  {
    name: "Profile Information",
    description: "Please provide a bit more info about your company",
    status: "current",
  },
  {
    name: "Add Parking Spots",
    description: "You can edit or add more spots later in the dashboard",
    status: "upcoming",
  },
  {
    name: "QR Code Stickers",
    description: "Learn more about generating QR Code stickers",
    status: "upcoming",
  },
  {
    name: "Choose Plan",
    description: "Pick the plan that suits your business best",
    status: "upcoming",
  },
  {
    name: "Complete",
    description: "Review your choices",
    status: "upcoming",
  },
];

export const stepsArrayState = atom({
  key: "stepsArrayState",
  default: stepsArray,
});

export const signedInState = atom({
  key: "signedInState",
  default: false,
});

export const userState = atom<DocumentData | undefined>({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
});



const initialSpots: Spot[] = [
  {
    name: "",
    placeholder: "E.g. L1-32",
    available: true,
    office: "",
    utilisation: 0,
    createdAt: Date.now(), // Add the current timestamp to each spot
    totalUsedDays: 0,
    totalUnusedDays: 0,
    lastToggledDate: "",
  },
  {
    name: "",
    placeholder: "E.g. L1-32",

    available: true,
    office: "",
    utilisation: 0,
    createdAt: Date.now(), // Add the current timestamp to each spot
    totalUsedDays: 0,
    totalUnusedDays: 0,
    lastToggledDate: "",
  },
  {
    name: "",
    placeholder: "E.g. L1-32",

    available: true,
    office: "",
    utilisation: 0,
    createdAt: Date.now(), // Add the current timestamp to each spot
    totalUsedDays: 0,
    totalUnusedDays: 0,
    lastToggledDate: "",
  },
];


export const EditProfilState = atom<ProfileState>({
  key: "EditProfilState",
  default: { spotsArray: initialSpots }, // This works because all properties in ProfileState are optional
});

export const selectedOffice = atom<ProfileState>({
  key: "selectedOffice",
  default: {}, // This works because all properties in ProfileState are optional
});

export const toastError = atom({
  key: "toastError",
  default: "",
});

export const showErrorToast = atom({
  key: "showErrorToast",
  default: false,
});

export const officeSettingsState = atom({
  key: "officeSettingsState", // unique ID (with respect to other atoms/selectors)
  default: {
    notificationSettings: {
      fullNotification: true,
      threeSpotsNotification: true,
      allNotifications: false,
      customSpotsArray: [],
      spotsRemainingValue: 3,
      customSpotsNotification: false,
      customMessage: "",
    },
    mobile: 0,
    timezoneOffset: 0,
    officeName: "",
  },
});


export const setOfficesState = atom<OfficeData[]>({
    key: "setOfficesState",
    default: [], // Correctly defaulting to an empty array
  });

export const ipLocationState = atom({
  key: "ipLocationState", // unique ID (with respect to other atoms/selectors)
  default: {
    country: "",
    currency: "USD", // Default currency
  }, // default value (aka initial value)
});



export const paymentTiers: PaymentTier[] = [
  {
    name: "Free Tier",
    id: "tier-free",
    href: "/register",
    // price: { monthly: "Free", annually: "Free" },
    price: {
      monthly: { AUD: "Free", USD: "Free", EUR: "Free", GBP: "Free" },
      annually: { AUD: "Free", USD: "Free", EUR: "Free", GBP: "Free" },
    },
    priceID: {
      monthly: "price_1PIQ17A0cKv1FNCtyq4rSDhZ",
      annually: "price_1PIQ17A0cKv1FNCtyq4rSDhZ",
    },
    limits: {
      offices: 1,
      employees: 5,
    },
    description: "For personal use or very small businesses.",
    metricName: { monthly: "per Month", annually: "per Year" },
    features: [
      "1 Office",
      "Up to 5 Employees",
      // "Snap Park App Notifications",
      // "WhatsApp Notifications",

      "Unlimited QR Code Stickers",
      "Unlimited Notifications",
    ],
    officeLimit: 1,
    notificationListLimit: 5,
    mostPopular: false,
    comingSoon: true,
  },
  {
    name: "Basic",
    id: "tier-basic",
    href: "register",
    // price: { monthly: "$15", annually: "$160" },
    price: {
      monthly: {
        AUD: 15,
        USD: 10,
        EUR: 10,
        GBP: 7.5,
      },
      annually: {
        AUD: 160,
        USD: 105,
        EUR: 100,
        GBP: 85,
      },
    },
    priceID: {
      monthly: "price_1PIQ3jA0cKv1FNCtRmdz3L7Q",
      annually: "price_1PISs0A0cKv1FNCtMHSUgTfn",
    },
    limits: {
      offices: 2,
      employees: 20,
    },
    description: "Ideal for small businesses with less than 15 employees.",
    features: [
      "2 Offices",
      "Up to 20 Employees/Office",
      // "Snap Park App Notifications",
      "Unlimited QR Code Stickers",
      "Unlimited Notifications",
    ],
    officeLimit: 2,
    notificationListLimit: 20,
    mostPopular: false,
    metricName: { monthly: "per Month", annually: "per Year" },
    comingSoon: true,

  },
  {
    name: "Standard",
    id: "tier-standard",
    href: "register",
    // price: { monthly: "$25", annually: "$275" },
    price: {
      monthly: {
        AUD: 25,
        USD: 16,
        EUR: 16,
        GBP: 13,
      },
      annually: { 
        AUD: 275,
        USD: 185,
        EUR: 170,
        GBP: 145,
      },
    },
    priceID: {
      monthly: "price_1PIQ9EA0cKv1FNCtV6f0FGpU",
      annually: "price_1PISsrA0cKv1FNCtMyh9nUVm",
    },
    limits: {
      offices: 3,
      employees: 45,
    },
    description: "Designed for large businesses with multiple locations.",
    features: [
      "3 Offices",
      "Up to 45 Employees/Office",
      // "Standard SMS",
      // "WhatsApp Notifications",
      "Unlimited QR Code Stickers",
      "Unlimited Notifications",
    ],
    officeLimit: 3,
    notificationListLimit: 45,
    mostPopular: true,
    metricName: { monthly: "per Month", annually: "per Year" },
    comingSoon: true,

  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "/register",
    // price: { monthly: "$45", annually: "$495" },
    price: {
      monthly: {
        AUD: 45,
        USD: 30,
        EUR: 28,
        GBP: 24,
      },
      annually: {
        AUD: 495,
        USD: 330,
        EUR: 300,
        GBP: 260,
      },
    },
    priceID: {
      monthly: "price_1PIQD1A0cKv1FNCtWxRXSD0q",
      annually: "price_1PISttA0cKv1FNCtswre5vpW",
    },
    limits: {
      offices: 100000,
      employees: 100000,
    },
    description: "For corporations or businesses with custom requirements.",
    features: [
      "Unlimited Offices",
      "Unlimited Employees",
      // "Standard SMS",
      // "WhatsApp Notifications",
      "Unlimited QR Code Stickers",
      "Unlimited Notifications",
    ],
    officeLimit: 100000,
    notificationListLimit: 100000,
    mostPopular: false,
    metricName: { monthly: "per Month", annually: "per Year" },
    comingSoon: true,

  },
];
