import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { appName } from "@/Reusable/constants";

const tiers = [
  {
    name: "Standard",
    id: "tier-startup",
    href: "#",
    price: "$15",
    description:
      "Best for larger businesses with a large notification list. Charged monthly, cancel at any time.",
    features: [
      `${appName.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())} App Notifications`,
      // "Standard SMS",
      // "WhatsApp Notifications",
      "Basic analytics",
      "Unlimited QR Code Stickers",
      "Unlimited Offices",
    ],
    priceSuffix: "/month",

    mostPopular: false,
    comingSoon: true,
  },
  {
    name: "Pay-As-You-Go",
    id: "tier-PAYG",
    href: "#",
    price: ["$0.15", "$0.08", "$0.03"],
    description:
      "Best for small businesses with carparks that only occasionally fill up. Charged monthly based on total notifications sent.",
    features: [
      "Standard SMS",
      // "WhatsApp Notifications",
      "Basic analytics",
      "Unlimited QR Code Stickers",
      "Unlimited Offices",
      "Unlimited Notifications",
    ],
    priceSuffix: "/Notification",
    mostPopular: true,
    comingSoon: false,
  },
  {
    name: "Purchase Outright",
    id: "tier-enterprise",
    href: "#",
    price: "$400",
    description: "For those who hate subscriptions - pay once, use it forever.",
    features: [
      `${appName.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())} App Notifications`,
      // "Standard SMS",
      // "WhatsApp Notifications",
      "Basic analytics",
      "Unlimited QR Code Stickers",
      "Unlimited Offices",
    ],
    priceSuffix: "",
    mostPopular: false,
    comingSoon: true,
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Pricing() {
  return (
    <div className="bg-white py-24 sm:py-32" id="Pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            No up-front payment required.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Try it free for 30 Days, cancel at any time. Choose an plan that works best for your business. Or get in <a href="/contact" className="text-blue-500 cursor-pointer">contact </a> for more information.
        </p>
        {/* <div className="mt-16 flex justify-center">
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
        </div> */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? "ring-2 ring-indigo-600"
                  : "ring-1 ring-gray-200",
                "rounded-3xl p-8 xl:p-10",
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.mostPopular ? "text-indigo-600" : "text-gray-900",
                    "text-lg font-semibold leading-8",
                  )}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                    Most popular
                  </p>
                ) : tier.comingSoon ? (
                  <p className="rounded-full bg-gray-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-gray-600">
                    Coming Soon
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {tier.description}
              </p>
              {tier.id === "tier-PAYG" ? (
                <div>
                  <p className="mt-4 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {tier.price[0]}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /SMS
                    </span>
                  </p>
                  {/* <p className="mt-1 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {tier.price[1]}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /WhatsApp Message
                    </span>
                  </p> */}
                  {/* <p className="mt-1 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {tier.price[2]}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /App Notification
                    </span>
                  </p> */}
                </div>
              ) : (
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">
                    {tier.priceSuffix}
                  </span>
                </p>
              )}

              <a
                href={"/signup"}
                aria-describedby={tier.id}
                aria-disabled={tier.comingSoon ? "true" : "false"}
                className={classNames(
                  tier.mostPopular
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                    : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                  tier.comingSoon
                    ? "opacity-50 pointer-events-none"
                    : "hover:opacity-75",
                  "mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                )}
              >
                {tier.comingSoon ? "Coming Soon" : "Get Started!"}
              </a>

              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10"
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
      </div>
    </div>
  );
}
