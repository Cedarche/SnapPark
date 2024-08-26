import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Link as RouterLink } from "react-router-dom";
import { paymentTiers } from "@/Reusable/RecoilState";
import { useRecoilState } from "recoil";
import { ipLocationState } from "@/Reusable/RecoilState";
import { CurrencyCode } from "@/Reusable/Types/types";
import { approvedCurrencyArray, currencySymbols } from "@/Reusable/constants";

const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AppPricing() {
  const [frequency, setFrequency] = useState(frequencies[0]);
  const [ipLocation, setIPLocation] = useRecoilState(ipLocationState);

  const symbol = currencySymbols[ipLocation.currency]
    ? currencySymbols[ipLocation.currency]
    : "$";

  const currency: CurrencyCode = approvedCurrencyArray.includes(
    ipLocation.currency,
  )
    ? (ipLocation.currency as CurrencyCode)
    : "USD";

  return (
    <div className="bg-white py-24 sm:py-32" id="Pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            App Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            The new Snap Park App - Coming Soon!
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          {/* Try it free for 30 Days, cancel at any time. Choose an plan that works
          best for your business, or get in{" "}
          <a href="/contact" className="text-blue-500 cursor-pointer">
            contact{" "}
          </a>{" "}
          for more information. */}
          The Snap Park App will allow a simpler, cheaper, and more streamlined
          experience for your employees. Register your interest below to be
          notified when it's available - or get in{" "}
          <a href="/contact" className="text-blue-500 cursor-pointer">
            contact{" "}
          </a>{" "}
          for more information.
        </p>
        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
          >
            <RadioGroup.Label className="sr-only">
              Payment frequency
            </RadioGroup.Label>
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  classNames(
                    checked ? "bg-indigo-600 text-white" : "text-gray-500",
                    "cursor-pointer rounded-full px-2.5 py-1",
                  )
                }
              >
                <span>{option.label}</span>
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
          {paymentTiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? "ring-2 ring-indigo-600"
                  : "ring-1 ring-gray-200",
                tier.comingSoon ? "bg-gray-100 opacity-45" : "",
                "rounded-3xl p-8",
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.mostPopular ? "text-indigo-600" : "text-gray-900",
                  "text-lg font-semibold leading-8",
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.id === "tier-free"
                    ? "Free"
                    : `${symbol}${tier.price[frequency.value][currency]}`}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {tier.id !== "tier-free" && frequency.priceSuffix}
                </span>
              </p>
              <RouterLink
                // to={tier.href}
                to={""}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                    : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                  tier.comingSoon ? "cursor-not-allowed" : "cursor-pointer",
                  "mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                )}
              >
                {/* Get started */}
                Coming Soon
              </RouterLink>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                {tier.features.map((feature) => (
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
          ))}
        </div>
        <div className="w-full flex justify-end text-xs pr-2 mt-2 font-light">
          * All Prices in {currency}
        </div>
      </div>
    </div>
  );
}
