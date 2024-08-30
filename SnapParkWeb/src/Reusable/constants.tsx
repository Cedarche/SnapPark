export const appName = 'SNAP PARK'
export const companyName = 'SNAP PARK'
export const contactEmailAddress = 'contact@snappark.co'
export const websiteURL = 'https://snappark.co'
import {
  Cog6ToothIcon,
  ChartBarSquareIcon,
  CreditCardIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";


export const approvedCurrencyArray = ["AUD", "EUR", "GBP", "USD"];

export const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "$",
  // Add more currencies and symbols as needed
};

export const defaultCurrency = "USD";

export const appAvailable = false

export const StandardSMSTier = {
    name: "Standard SMS",
    id: "tier-standard-sms",
    href: "register",
    // price: { monthly: "$25", annually: "$275" },
    price: {
      AUD: 0.12,
      USD: 0.07,
      EUR: 0.07,
      GBP: 0.06,
    },
    priceID: "price_1P6VzeA0cKv1FNCtUQnERcMr",
    limits: {
      offices: 100000,
      employees: 100000,
    },
    description:
      "Pay as you go SMS notifications. Only get charged for what you use, but at a higher rate. Unlimited offices and employees, billed monthly.",
    features: [
      "Unlimited Offices",
      "Unlimited Employees",
      "Standard SMS",
      // "WhatsApp Notifications",
      "Unlimited QR Code Stickers",
      "Unlimited Notifications",
    ],
  
    mostPopular: false,
    metricName: "per Notification",
  };

  export const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: ChartBarSquareIcon,
      current: true,
    },
  
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCardIcon,
      current: false,
    },
    // {
    //   name: "Notifications",
    //   href: "/dashboard/notifications",
    //   icon: BellAlertIcon,
    //   current: false,
    // },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Cog6ToothIcon,
      current: false,
    },
    {
      name: "QR Code Stickers",
      href: "/dashboard/stickers",
      icon: QrCodeIcon,
      current: false,
    },
  ];
  
  export const teamsArray = [
    { id: 1, name: "", href: "#", initial: "", current: true },
  ];