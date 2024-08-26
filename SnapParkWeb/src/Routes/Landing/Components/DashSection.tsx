import {
  QrCodeIcon,
  ChartBarIcon,
  BellIcon,
  CreditCardIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
} from "@heroicons/react/20/solid";
import DashboardExample from '../../../assets/DashboardExample.png'
import { appName } from "@/Reusable/constants";

const features = [
  {
    name: "QR Code Management",
    description:
      "Generate and customize QR codes for each parking spot with ease, directly from the dashboard.",
    icon: QrCodeIcon,
  },
  {
    name: "Parking Spot Tracking",
    description:
      "Monitor parking spot usage in real-time, ensuring efficient utilization of your parking resources.",
    icon: ChartBarIcon,
  },
  {
    name: "Adjustable Notifications",
    description:
      "Set and update notification rules as needed, whether it’s for a full lot or just a few remaining spaces.",
    icon: BellIcon,
  },
  {
    name: "Billing Management",
    description:
      "Manage your subscriptions and billing directly through the dashboard for hassle-free administration.",
    icon: CreditCardIcon,
  },
  {
    name: "Comprehensive Settings",
    description:
      "Fine-tune the app’s settings, from notification preferences to parking lot details, all in one place.",
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: "Usage Analytics",
    description:
      "Access detailed reports on parking trends to better understand peak times and optimize your parking strategy.",
    icon: ClockIcon,
  },
];

export default function DashSection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Dashboard Overview
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Efficient Parking Management
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The {appName.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())} dashboard offers tools for QR code generation, parking
            occupancy tracking, and notifications, providing a complete solution
            for efficient parking spot administration.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <img
            src={DashboardExample}
            alt="App screenshot"
            className="mb-[-8%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            width={2432}
            height={1442}
          />
          <div className="relative" aria-hidden="true">
            <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-gray-900">
                <feature.icon
                  className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                  aria-hidden="true"
                />
                {feature.name}
              </dt>
              <dd className="mt-2">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
