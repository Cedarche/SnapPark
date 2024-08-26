import { CheckIcon } from "@heroicons/react/20/solid";
import { useRecoilState } from "recoil";
import { ipLocationState } from "@/Reusable/RecoilState";
import {
  StandardSMSTier,
  currencySymbols,
  approvedCurrencyArray,
  defaultCurrency,
} from "@/Reusable/constants";

const includedFeatures = [
  "Unlimited Offices",
  "Unlimited Employees",
  "Unlimited notifications",
  "Full access to future upgrades",
];

export default function SMSPricing() {
  const [ipLocation, setIPLocation] = useRecoilState(ipLocationState);
  const symbol = currencySymbols[ipLocation.currency]
    ? currencySymbols[ipLocation.currency]
    : "$";

  const currency = approvedCurrencyArray.includes(ipLocation.currency)
    ? ipLocation.currency
    : "USD";

  return (
    <div className="bg-white py-24 sm:py-32" id="Pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            SMS Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {/* Don't want to use an app? */}
            No up-front payment required.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          {/* Snap Park works just as well over SMS, but for a higher cost. Perfect for offices that rarely fill up. */}
          Try it free for 30 days, then only pay a flat rate for each
          notification sent out.
        </p>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Standard SMS
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Pay as you go SMS notifications - only get charged for what you
              use. Unlimited offices and employees. SMS pricing is calculated
              based on the total number of notifications sent out for each
              billing cycle. Billed monthly.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    className="h-6 w-5 flex-none text-indigo-600"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">
                  Only pay for usage
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {symbol}
                    {
                      StandardSMSTier.price[
                        currency as keyof typeof StandardSMSTier.price
                      ]
                    }
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    {currency} / message
                  </span>
                </p>
                <a
                  href="#"
                  className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Invoices and receipts available for easy cost tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
