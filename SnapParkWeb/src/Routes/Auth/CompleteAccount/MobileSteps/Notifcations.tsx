import { useState } from "react";
import { Label, RadioGroup, Radio, Description } from "@headlessui/react";
import { useRecoilState } from "recoil";
import {
  stepsArrayState,
  EditProfilState,
  paymentTiers,
  ipLocationState,
} from "@/Reusable/RecoilState";
import { CurrencyCode, Plan } from "@/Reusable/Types/types";
import { auth } from "@/firebase";
import Spinner from "@/Reusable/Spinner";
import {
  currencySymbols,
  approvedCurrencyArray,
  defaultCurrency,
  appAvailable,
  StandardSMSTier,
} from "@/Reusable/constants";
import {  SparklesIcon } from "@heroicons/react/24/outline";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}
const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];

export default function Notifications() {
  const [selected, setSelected] = useState(paymentTiers[2]);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useRecoilState(stepsArrayState);
  const [savedProfile, setSavedProfile] = useRecoilState<any>(EditProfilState);
  const [ipLocation, setIPLocation] = useRecoilState(ipLocationState);
  const [frequency, setFrequency] = useState(frequencies[0]);

  const user = auth.currentUser;

  const updateStepStatus = (clickedStepName: any) => {
    const updatedSteps = steps.map((step) => {
      if (step.name === clickedStepName) {
        return { ...step, status: "current" };
      } else {
        if (step.status === "current") {
          return { ...step, status: "complete" };
        }
        // Do not change the status of 'complete' or 'upcoming' steps
        return step;
      }
    });

    setSteps(updatedSteps);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (user && selected) {
        console.log(selected);

        let price: any = null;
        let priceID = "";
        let metricName = "";

        if (selected.id === "tier-standard-sms") {
          price =
            selected.price[currencyCode as CurrencyCode] ||
            selected.price["USD"];
          priceID = selected.priceID as string;
          metricName = selected.metricName;
        } else {
          const freqPrices = selected.price as Record<
            string,
            Record<CurrencyCode, string | number>
          >;
          price =
            freqPrices[frequency.value][currencyCode as CurrencyCode] ||
            freqPrices[frequency.value]["USD"];

          const priceIDRecord = selected.priceID as Record<string, string>;
          priceID = priceIDRecord[frequency.value] || priceIDRecord["USD"];

          metricName = frequency.priceSuffix;
        }

        const plan: Plan = {
          name: selected.name,
          priceID: priceID,
          currencyCode: currencyCode as CurrencyCode,
          price: price,
          billingType: frequency.value,
          metricName: metricName,
          limits: selected.limits,
          id: selected.id,
        };

        setSavedProfile({ ...savedProfile, plan: plan });
        setLoading(false);
        updateStepStatus("Complete");
      }
    } catch (error) {
      console.log("Something went wrong: ", error);
      setLoading(false);
    }
  };

  const currencyCode: CurrencyCode = approvedCurrencyArray.includes(
    savedProfile?.countryInfo?.currencies[0],
  )
    ? savedProfile?.countryInfo?.currencies[0]
    : "USD";
  const currencySymbol =
    currencySymbols[currencyCode] || currencySymbols["USD"];

  return (
    <div className="w-full bg-white sm:p-4">
      <div className="inline-flex gap-x-3 items-center">
        <h3 className="px-2 pb-0 text-base font-semibold leading-6 text-gray-900">
          Choose Plan
        </h3>
        <div className="flex items-center justify-end  pr-2 text-xs">
          <span
            className="inline-flex text-xs font-normal tracking-wide mb-3 mt-3 lg:mb-0 lg:mt-0 items-center gap-x-1.5 rounded-md bg-blue-50 px-3 py-1 
       text-black-900 hover:cursor-pointer"
          >
            <SparklesIcon
              className="h-4 w-4 text-blue-400"
              aria-hidden="true"
            />
            Free for 30 Days
          </span>
        </div>
      </div>
      {appAvailable && (
        <div className="flex p-2.5 m-2 flex-row items-center justify-between border rounded-lg mt-4 bg-gray-50">
          <div className="flex flex-col">
            <span className="text-sm ">Billing frequency: </span>
            <span className="text-xs text-gray-500">
              Choose Annual billing for ~10% off across all plans.{" "}
            </span>
          </div>
          <div className="max-w-[175px] ">
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
        </div>
      )}

      <div className="p-2 max-w-xl text-sm text-gray-500">
        <p>
          No credit card required during the free trial. Change or cancel plan
          at any time.
        </p>
        <p className="mt-1">
          We'll prompt you again in a month to check if you'd like to continue
          using the service.
        </p>
      </div>
      <RadioGroup value={selected} onChange={setSelected}>
        <Label className="sr-only w-full ">Pricing plans</Label>
        {appAvailable && (
          <div className="relative -space-y-px rounded-md bg-white m-2">
            {paymentTiers.map((plan, planIdx) => {
              const price =
                plan.price[frequency.value as keyof typeof plan.price][
                  currencyCode
                ] ||
                plan.price[frequency.value as keyof typeof plan.price]["USD"];

              return (
                <Radio
                  key={plan.name}
                  value={plan}
                  className={({ checked, disabled }) =>
                    classNames(
                      planIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                      planIdx === paymentTiers.length - 1
                        ? "rounded-bl-md rounded-br-md"
                        : "",
                      checked
                        ? "z-10 border-indigo-200 bg-indigo-50"
                        : "border-gray-200",
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                      "relative cursor-pointer border flex flex-col md:flex-row border-t p-4 focus:outline-none md:grid md:grid-cols-3",
                    )
                  }
                >
                  {({ active, checked }: any) => (
                    <>
                      <span
                        className=" items-center text-sm flex-3 col-span-2"
                        style={{ display: "flex", flex: 1 }}
                      >
                        <span
                          className={classNames(
                            checked
                              ? "bg-indigo-600 border-transparent"
                              : "bg-white border-gray-300",
                            active
                              ? "ring-2 ring-offset-2 ring-indigo-600"
                              : "",
                            "min-h-4 min-w-4 rounded-full border flex items-center justify-center",
                          )}
                          aria-hidden="true"
                        >
                          <span className="rounded-full bg-white w-1.5 h-1.5" />
                        </span>
                        <div className="flex flex-col items-start min-w-[250px] ">
                          <Label
                            as="span"
                            className={classNames(
                              checked ? "text-indigo-900" : "text-gray-900",
                              "ml-3 font-bold",
                            )}
                          >
                            {plan.name}
                          </Label>
                          <span className="ml-3 mt-1 text-xs font-light">
                            {plan.description}
                          </span>
                          <span className="ml-3 mt-1 text-xs font-light inline-flex">
                            <span className="inline-flex items-center rounded-md mr-1 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                              {plan.limits.offices === 100000
                                ? "Unlimited"
                                : plan.limits.offices}{" "}
                              {plan.limits.offices === 1 ? "Office" : "Offices"}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                              {plan.limits.employees === 100000
                                ? "Unlimited"
                                : plan.limits.employees}
                              {plan.limits.employees === 100000
                                ? " Employees"
                                : " Employees/Office"}
                            </span>
                          </span>
                        </div>
                      </span>
                      <Description
                        as="span"
                        className="ml-6 pl-1 text-sm md:ml-0 md:pl-0 flex mt-2 sm:mt-0  sm:items-center sm:justify-end md:text-center "
                      >
                        {price === "Free" ? (
                          <span
                            className={classNames(
                              checked ? "text-indigo-600" : "text-gray-800",
                              "font-bold",
                            )}
                          >
                            Free
                          </span>
                        ) : (
                          <span
                            className={classNames(
                              checked ? "text-indigo-600" : "text-gray-600",
                              "font-light",
                            )}
                          >
                            {currencySymbol}
                            {price} {currencyCode || defaultCurrency}{" "}
                            {frequency.priceSuffix}
                          </span>
                        )}
                      </Description>
                    </>
                  )}
                </Radio>
              );
            })}
          </div>
        )}

        <div>
          {appAvailable && (
            <div className="p-2 max-w-xl text-sm text-gray-500">
              <p>
                Snap Park works just as well over SMS, giving more flexibility
                to your employees:
              </p>
            </div>
          )}

          <RadioGroup.Option
            key={StandardSMSTier.id}
            value={StandardSMSTier}
            className={({ checked, disabled }) =>
              classNames(
                checked
                  ? "z-10 border-indigo-200 bg-indigo-50"
                  : "border-gray-200",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer", // Add opacity and cursor styles for disabled option

                "relative rounded-md mx-2 my-2 cursor-pointer border flex flex-col md:flex-row border-t p-4 focus:outline-none md:grid md:grid-cols-3",
              )
            }
          >
            {({ active, checked }) => (
              <>
                <span
                  className=" items-center text-sm flex-3 col-span-2"
                  style={{ display: "flex", flex: 1 }}
                >
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
                      {StandardSMSTier.name}
                    </RadioGroup.Label>
                    <span className="ml-3 mt-1 text-xs font-light">
                      {StandardSMSTier.description}
                    </span>
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
                    {currencySymbols[currencyCode]}
                    {StandardSMSTier.price[currencyCode]}{" "}
                    {currencyCode || "USD"}
                    {" per Notification"}
                  </span>
                </RadioGroup.Description>
              </>
            )}
          </RadioGroup.Option>
        </div>
        <div className=" sm:ml-6 sm:mt-0 flex justify-end sm:flex-shrink-0 sm:items-center m-2.5">
          <button
            type="button"
            disabled={loading}
            // onClick={() => updateStepStatus("Preview")}
            className="rounded-md bg-white px-3 py-2 mr-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Learn more
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
