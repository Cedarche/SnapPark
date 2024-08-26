import { useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { useRecoilState } from "recoil";
import { stepsArrayState, userState } from "@/Reusable/RecoilState";
import { auth } from "@/firebase";
import Spinner from "@/Reusable/Spinner";
import { DocumentData } from "firebase/firestore";

import {
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
const plans = [
  {
    name: `Standard App`,
    priceMonthly: {
      AUD: 0.05,
      USD: 0.03,
      EUR: 0.03,
      GBP: 0.03,
    },
    limit: "Free for 30 Days",
    description:
      "Notifies employees via the Snap Park app. The most cost effective option for most businesses. Requires employees to download the App.",

    priceID: import.meta.env.VITE_STANDARD_APP_PRICEID,
    comingSoon: false,
    billingType: "usage",
    metricName: "Notification",
  },
  {
    name: "Standard SMS",
    priceMonthly: {
      AUD: 0.12,
      USD: 0.07,
      EUR: 0.09,
      GBP: 0.06,
    },
    limit: "Free for 30 Days",
    description:
      "Notifies employees via SMS. For small businesses, or those who don't like downloading apps.",
    // priceID: "price_1OxOIOA0cKv1FNCtRO56c3Za",
    priceID: import.meta.env.VITE_STANDARD_SMS_PRICEID,
    comingSoon: false,
    billingType: "usage",
    metricName: "Notification",
  },

  // {
  //   name: "Whatsapp - Coming Soon!",
  //   priceMonthly: {
  //     AUD: 0.125 / 2,
  //     USD: 0.085 / 2,
  //     EUR: 0.085 / 2,
  //     GBP: 0.06 / 2,
  //   },
  //   limit: "Free for 30 Days",
  //   description: "Our cheapest option ",

  //   priceID: "price_1OqX7xA0cKv1FNCtCtrVYBUj",
  //   comingSoon: true,
  // },
];

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "$",
  // Add more currencies and symbols as needed
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function PlanOptions({
  closeModal,
  setNewPlanData,
  setConfirm,
}) {
  const [selected, setSelected] = useState(plans[0]);
  const [loading, setLoading] = useState(false);
  const [userData] = useRecoilState<DocumentData | undefined>(userState);

  const user = auth.currentUser;
  const planData = userData?.data.plan;

  //   useEffect(() => {
  //     console.log(userData.data.plan);
  //   }, [userData]);

  const handleSubmit = async () => {
    setLoading(true);

    if (selected.priceID === planData?.priceID) {
      console.log("Cant change to the same plane");
      setLoading(false);
      return;
    }
    try {
      if (user && selected) {
        const currencyCode = planData?.subscriptionCurrency;
        const price = selected.priceMonthly[currencyCode];
        const newPlanData = {
          name: selected.name,
          priceID: selected.priceID,
          currencyCode: currencyCode,
          price: price,
          billingType: selected.billingType,
          metricName: selected.metricName,
          subscriptionCurrency: planData?.subscriptionCurrency,
        };

        console.log(newPlanData);
        setNewPlanData(newPlanData);
        setConfirm(true);
        setLoading(false);
      }
    } catch (error) {
      console.log("Something went wrong: ", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white sm:p-4">
      <div className="inline-flex gap-x-3 items-center">
        <h3 className="px-2 pb-0 text-base font-semibold leading-6 text-gray-900">
          Choose a New Plan
        </h3>
        <div className="flex items-center justify-end  pr-2 text-xs">
          <span
            className="inline-flex mb-3 mt-3 lg:mb-0 lg:mt-0 items-center gap-x-1.5 rounded-md bg-blue-50 px-3 py-1 text-sm 
          font-light text-black-900 hover:cursor-pointer"
          >
            <InformationCircleIcon
              className="h-4 w-4 text-blue-400"
              aria-hidden="true"
            />
            Learn more
          </span>
        </div>
      </div>
      <div className="p-2 max-w-xl text-sm text-gray-500">
        <p>
          Plan changes take effect immediately after confirmation, and future
          usage within the billing period will be charged at the new price.
        </p>
      </div>
      <RadioGroup value={selected} onChange={setSelected}>
        <RadioGroup.Label className="sr-only w-full ">
          Pricing plans
        </RadioGroup.Label>
        <div className="relative -space-y-px rounded-md bg-white m-2">
          {plans.map((plan, planIdx) => {
            const currencyCode = planData?.subscriptionCurrency;

            const price = plan.priceMonthly[currencyCode];

            const currencySymbol = currencySymbols[currencyCode];

            return (
              <RadioGroup.Option
                key={plan.name}
                value={plan}
                disabled={plan.comingSoon}
                className={({ checked, disabled }) =>
                  classNames(
                    planIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                    planIdx === plans.length - 1
                      ? "rounded-bl-md rounded-br-md"
                      : "",
                    checked
                      ? "z-10 border-indigo-200 bg-indigo-50"
                      : "border-gray-200",
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer", // Add opacity and cursor styles for disabled option

                    "relative cursor-pointer border flex flex-col md:flex-row border-t p-4 focus:outline-none md:grid md:grid-cols-2",
                  )
                }
              >
                {({ active, checked }) => (
                  <>
                    <span className="flex items-center text-sm flex-3 ">
                      <span
                        className={classNames(
                          checked
                            ? "bg-indigo-600 border-transparent"
                            : "bg-white border-gray-300",
                          active ? "ring-2 ring-offset-2 ring-indigo-600" : "",
                          "min-h-4 min-w-4 rounded-full border flex items-center justify-center",
                        )}
                        aria-hidden="true"
                      >
                        <span className="rounded-full bg-white w-1.5 h-1.5" />
                      </span>
                      <div className="flex flex-col items-start min-w-[250px] ">
                        <RadioGroup.Label
                          as="span"
                          className={classNames(
                            checked ? "text-indigo-900" : "text-gray-900",
                            "ml-3 font-bold",
                          )}
                        >
                          {plan.name}
                          {plan.name === planData.name && (
                            <span className="inline-flex items-center gap-x-1.5 ml-2 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              <svg
                                className="h-1.5 w-1.5 fill-green-500"
                                viewBox="0 0 6 6"
                                aria-hidden="true"
                              >
                                <circle cx={3} cy={3} r={3} />
                              </svg>
                              Current Plan
                            </span>
                          )}
                        </RadioGroup.Label>
                        <span className="ml-3 mt-1 text-xs font-light">
                          {plan.description}
                        </span>
                        {/* {plan.name === "Snap Park App" && (
                          <span className="ml-3 text-xs font-extralight">
                            * Requires all employees to download the free app.
                          </span>
                        )} */}
                      </div>
                    </span>
                    <RadioGroup.Description
                      as="span"
                      className="ml-6 pl-1 text-sm md:ml-0 md:pl-0 flex mt-2 sm:mt-0  sm:items-center sm:justify-end md:text-center "
                    >
                      <span
                        className={classNames(
                          checked ? "text-indigo-600" : "text-gray-600",
                          "font-light",
                        )}
                      >
                        {currencySymbol}
                        {price} {currencyCode} /{" "}
                        {plan.name === "SNAP PARK App"
                          ? "Monthly"
                          : "Message sent"}
                      </span>{" "}
                    </RadioGroup.Description>
                  </>
                )}
              </RadioGroup.Option>
            );
          })}
        </div>
        <div className=" sm:ml-6 sm:mt-0 flex justify-end sm:flex-shrink-0 sm:items-center m-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={closeModal}
            className="rounded-md bg-white px-3 py-2 mr-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {loading ? <Spinner /> : "Next"}
          </button>
        </div>
      </RadioGroup>
    </div>
  );
}
