/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment, useEffect, useState, useMemo } from "react";
import { Dialog, Listbox, Menu, Transition } from "@headlessui/react";
import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import {
  BellIcon,
  PlusCircleIcon,
  CreditCardIcon,
  XMarkIcon as XMarkIconOutline,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Stats from "../Home/Stats";
import BarChartExample from "./BarChart";
import SelectOffice from "./SelectOffice";
import InvoicesList from "./InvoicesList";
import { useRecoilState } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import { DocumentData } from "firebase/firestore";
import { auth } from "@/firebase";
import Spinner from "@/Reusable/Spinner";
import SlideOver from "./SlideOver";
import { LogosMastercard, LogosAmex } from "./Stripe/CardLogos";
import AccountStatus from "./AccountStatus";
import ExpirationDate from "./ExpirationDate";
import { ParentSize } from "@visx/responsive";
import MainPlot from "./Plots/AreaToolTip";
import BarChart from "./Plots/BarChart";
import PlotYearDropdown from "./Plots/PlotYearDropdown";
import BillingStats from "./Plots/BillingStats";
import { ExampleData, ExampleBarData } from "./Plots/ExampleData";
import ChangePlanModal from "./Stripe/ChangePlanModal";

import {
  yearCombinator,
  summarizeDailyUsage,
  combineUsageData,
  summarizeData,
  combineStats,
} from "./Functions/Combinator";

interface OfficeData {
  id: string;
  data: {
    office: string;
    usage: Array<{
      date: { seconds: number; nanoseconds: number };
      messageType?: string;
      messageSent?: boolean;
      status: string;
      messageCount: number;
    }>;
  };
}

export default function Billing() {
  const [usageData, setUsageData] = useState<any>(null); // State to hold the office document data
  const [userData] = useRecoilState<DocumentData | undefined>(userState);
  const [chartData, setChartData] = useState<any>([]);
  const [planData, setPlanData] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const [openSlide, setOpenSlide] = useState(false);
  const [updateMethod, setUpdateMethod] = useState(false);
  const [targetYear, setTargetYear] = useState(2024);
  const [combinedStatistics, setCombinedStatistics] = useState(null);
  const [yearUsage, setYearUsage] = useState(null);
  const [open, setOpen] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (userData) {
      // console.log("Offices Data: ", userData.offices);

      const plan = userData?.data.plan;

      const status = userData?.data.status;
      // console.log("Plan: ", plan.priceMonthly);
      // console.log("Status: ", userData?.data.status);
      setPlanData({ plan, status });
      if (
        userData.data.paymentDetails &&
        Object.keys(userData.data.paymentDetails).length > 0
      ) {
        const defaultPayment = userData?.data.paymentDetails;
        // console.log("default Payment", defaultPayment);
        setPaymentDetails(defaultPayment);
      }
    }

    // console.log('Offices Arra: ', userData?.offices)

    if (userData?.offices) {
      const stats = combineStats(userData?.offices, targetYear);

      setCombinedStatistics(stats);
    }

    if (userData?.usage) {
      const officeDetails = userData.offices.map((office) => ({
        id: office.id, // Get the office ID
        name: office.data.office, // Get the office name from the nested data object
      }));

      const yearUsage = yearCombinator(userData?.usage, targetYear);
      setYearUsage(yearUsage);

      const dailySummary = summarizeDailyUsage(
        userData?.usage,
        officeDetails,
        targetYear,
      );
      setPlotData(dailySummary);
      // console.log('New summary: ', dailySummary)

      const summary = summarizeData(userData?.usage, userData?.data.plan);
      setSummary(summary);

      const combinedData = combineUsageData(
        userData?.usage,
        officeDetails,
        targetYear,
      );
      // console.log('Combined data: ',combinedData)
      setChartData(combinedData);
    }
  }, [userData]);

  const handleAddPaymentMethod = () => {
    setUpdateMethod(true);
    setOpenSlide(true);
  };

  if (!userData || !planData || !summary) {
    return (
      <div className="w-full h-screen flex items-center justify-center pb-60">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <SlideOver
        open={openSlide}
        setOpen={setOpenSlide}
        userData={userData}
        updateMethod={updateMethod}
      />
      <ChangePlanModal open={open} setOpen={setOpen} />
      <main>
        <header className="sticky  isolate pt-0">
          <div
            className="absolute inset-0 -z-10 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
          </div>

          <div className=" mx-auto max-w-7xl px-0 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
              <div className="flex items-center gap-x-6">
                <h2 className="text-2xl font-bold leading-7 text-black sm:truncate sm:text-3xl sm:tracking-normal">
                  {user ? user.displayName : "Company Name"}
                </h2>
              </div>
              <div className="flex items-center gap-x-4 sm:gap-x-6">
                {/* <SelectOffice /> */}
                <div className="text-sm text-gray-500 ">
                  <span className="text-gray-900 mr-3">Account:</span>
                  {userData ? userData.data.accountNumber : ""}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-0 py-5 sm:px-0 xl:px-8 ">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-5 gap-y-5 xl:mx-0 lg:max-w-none xl:grid-cols-3">
            {/* Cards summary */}
            <div className="xl:col-start-3 xl:row-end-1 ">
              {/* <div
              className="-mx-4 px-4 shadow-md ring-1 ring-gray-900/5 sm:mx-0 rounded-lg sm:px-8 
                sm:pb-5 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-5 xl:pb-2 xl:pt-2 mb-5 bg-white"
            > */}
              <h2 className="sr-only">Summary</h2>
              <div className="rounded-lg  -mx-4 sm:mx-8 xl:mx-0 shadow-sm ring-1 ring-gray-900/20 mb-5 pb-2 bg-white">
                <dl className="flex flex-wrap">
                  <div className="flex-auto pl-3 pt-3">
                    <div className="flex items-center justify-between  ">
                      <div className="flex items-center justify-between">
                        <dt className="flex-none">
                          <span className="sr-only">Payment Method</span>
                          <CreditCardIcon
                            className="h-6 w-5 text-gray-900"
                            aria-hidden="true"
                          />
                        </dt>
                        <dd className="text-sm leading-6 font-bold text-gray-900 ml-2">
                          <time dateTime="2023-01-31">Payment Method</time>
                        </dd>
                      </div>
                    </div>
                  </div>
                </dl>
                {paymentDetails ? (
                  <div className="rounded-md bg-blue-100 px-6 py-5 flex justify-between sm:flex sm:items-center sm:justify-between mx-3 mb-1 mt-2">
                    <h4 className="sr-only">{paymentDetails.brand}</h4>
                    <div className="inline-flex gap-x-2 items-center sm:flex sm:items-start">
                      {paymentDetails.brand === "visa" ? (
                        <div className="pt-2">
                          <svg
                            className="h-8 w-auto sm:h-6 sm:flex-shrink-0"
                            viewBox="0 0 36 24"
                            aria-hidden="true"
                          >
                            <rect
                              width={36}
                              height={24}
                              fill="#224DBA"
                              rx={4}
                            />
                            <path
                              fill="#fff"
                              d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                            />
                          </svg>
                        </div>
                      ) : paymentDetails.brand === "mastercard" ? (
                        <div className="pt-2">
                          <LogosMastercard />
                        </div>
                      ) : (
                        <div className="pt-2">
                          <LogosAmex />
                        </div>
                      )}

                      <div className="mt-3 sm:ml-4 sm:mt-0">
                        <div className="text-sm font-medium text-gray-900">
                          Ending with {paymentDetails.last4}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
                          <div>
                            Expires {paymentDetails.exp_month}/
                            {String(paymentDetails.exp_year).slice(-2)}
                          </div>
                          <span
                            className="hidden sm:mx-2 sm:inline"
                            aria-hidden="true"
                          ></span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:ml-6 sm:mt-0 sm:flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={handleAddPaymentMethod}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-md bg-blue-100 px-6 py-5 flex-row flex sm:items-center justify-between mx-3
                   cursor-pointer hover:bg-indigo-100 mt-2"
                    onClick={() => setOpenSlide(true)}
                  >
                    <div className="text-sm ">Add Payment Details</div>
                    <PlusCircleIcon
                      className="h-6 w-5 text-gray-900"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              {/* Month Summary */}

              <div className="rounded-lg -mx-4 sm:mx-8 xl:mx-0 bg-gray-200 shadow-sm ring-1 ring-gray-900/20">
                {summary ? (
                  <dl className="flex flex-wrap">
                    <div className="flex-auto pl-6 py-6">
                      <div className="flex items-center justify-between  ">
                        <div className="flex items-center justify-between">
                          <dt className="flex-none">
                            <span className="sr-only">Summary period</span>
                            <CalendarDaysIcon
                              className="h-6 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </dt>
                          <dd className="text-sm leading-6 text-gray-500 ml-2">
                            <time dateTime="2023-01-31">{summary.period}</time>
                          </dd>
                        </div>
                      </div>

                      <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
                        {summary.totalUsage} Messages
                      </dd>
                    </div>
                    <div className="flex-none self-end px-6 py-6">
                      <dt className="sr-only">Summary cost</dt>
                      <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                        {planData.status === "trialing"
                          ? "Free"
                          : `$${summary.totalCost} ${summary.currency}`}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <div className="flex w-full items-center justify-center min-h-16">
                    <Spinner />
                  </div>
                )}

                {/* <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
                  <a
                    href="#"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    See last month <span aria-hidden="true">&rarr;</span>
                  </a>
                </div> */}
              </div>
            </div>

            <div
              className="-mx-4 px-4 py-0 sm:mx-0 sm:rounded-lg 
            sm:px-8 sm:pb-14 xl:col-span-2 xl:row-span-2 xl:row-end-2 xl:px-0 xl:pb-20 "
            >
              {/* Current Plan */}
              <div
                className="-mx-4  shadow-md ring-1 ring-gray-900/20 sm:mx-0 rounded-lg sm:px-8 
                sm:pb-3 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-0 xl:pb-0 xl:pt-0 mb-5 bg-white"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Current Plan
                  </h3>
                  <div className="mt-2">
                    <div className="rounded-md bg-slate-100 px-6 py-5 sm:flex sm:items-start sm:justify-between">
                      <h4 className="sr-only">Plan</h4>
                      <div className="sm:flex sm:items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#5900ff"
                          className="w-6 h-6 mt-0.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>

                        <div className="mt-3 sm:ml-4 sm:mt-0">
                          <div className="text-lg font-medium text-gray-900 flex flex-col items-start xl2:items-center xl2:flex-row">
                            {planData?.plan.name}
                            <AccountStatus planData={planData} />
                          </div>
                          {/* <div className="text-sm font-sm text-gray-700 flex items-center flex-row">
                           <AccountStatus planData={planData} />
                          </div> */}
                          <ExpirationDate
                            userData={userData}
                            planData={planData}
                          />
                        </div>
                      </div>
                      <div className="mt-4 sm:ml-6 sm:mt-0 sm:flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          disabled={true}
                          className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:ring-gray-400 hover:bg-gray-50"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="-mx-4 px-4 shadow-md ring-1 ring-gray-900/20 sm:mx-0 rounded-lg sm:px-8 
                sm:pb-5 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-5 xl:pb-2 xl:pt-2 mb-5 bg-white"
                style={{ minHeight: "400px" }} // Setting a minimum height
              >
                <div className="pl-4 pt-4  lg:-ml-2 w-full flex items-center justify-between">
                  <h3 className="text-lg font-semibold leading-6  text-gray-900">
                    Total Usage
                  </h3>
                  <PlotYearDropdown />
                </div>

                {plotData.length === 0 || !plotData ? (
                  <div className="w-full min-h-[320px] bg-gray-50 mt-2  rounded-lg shadow-sm flex flex-col items-center justify-center">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-300 mb-2" />
                    Theres nothing here yet...
                    <span className="text-sm mt-1 text-gray-500 text-wrap">
                      Usage data will start to populate once your first
                      notification is sent out.{" "}
                    </span>
                  </div>
                ) : (
                  <ParentSize>
                    {({ width, height }) => (
                      <MainPlot
                        width={width}
                        height={350}
                        // data={summary?.dailyUsage}
                        data={plotData}
                        // data={ExampleData}
                        // data={staticData}
                      />
                      // <MainPlot width={width} height={350} data={ExampleData} />
                    )}
                  </ParentSize>
                )}
              </div>
              <div
                className="-mx-4 px-4 shadow-md ring-1 ring-gray-900/20 sm:mx-0 rounded-lg sm:px-8 
                sm:pb-5 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-5 xl:pb-2 xl:pt-2 mb-5 bg-white"
                style={{ minHeight: "400px" }} // Setting a minimum height
              >
                <div className="pl-4 pt-4  lg:-ml-2 w-full flex items-center justify-between">
                  <h3 className="text-lg font-semibold leading-6  text-gray-900">
                    Monthly Usage
                  </h3>
                  <PlotYearDropdown />
                </div>

                {isChartDataEmpty(chartData) ? (
                  <div className="w-full min-h-[320px] bg-gray-50 mt-2  rounded-lg shadow-sm flex flex-col items-center justify-center">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-300 mb-2" />
                    Theres nothing here yet...
                    <span className="text-sm mt-1 text-gray-500 text-wrap">
                      Usage data will start to populate once your first
                      notification is sent out.{" "}
                    </span>
                  </div>
                ) : (
                  // <BarChartExample chartData={chartData} />
                  <ParentSize>
                    {({ width, height }) => (
                      <BarChart
                        width={width}
                        height={350}
                        data={chartData}
                        //  data={ExampleBarData}
                      />
                      // <MainPlot width={width} height={350} data={ExampleData} />
                    )}
                  </ParentSize>
                )}
              </div>
              <div
                className="-mx-4 px-4 shadow-md ring-1 ring-gray-900/20 sm:mx-0 rounded-lg sm:px-8 
              sm:pb-5 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-0 xl:pb-0 overflow-hidden xl:pt-2 mb-5 bg-white"
              >
                <BillingStats
                  yearUsage={yearUsage}
                  combinedStatistics={combinedStatistics}
                  PlotYearDropdown={PlotYearDropdown}
                />
              </div>
              <div
                className="-mx-4 px-4 shadow-md ring-1 ring-gray-900/20 sm:mx-0 rounded-lg sm:px-8 
                sm:pb-5 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-5 xl:pb-2 xl:pt-2 mb-5 bg-white"
                style={{ minHeight: "400px" }} // Setting a minimum height
              >
                <div className="px-4 pt-5 lg:-ml-2">
                  <h3 className="text-lg font-semibold leading-6  text-gray-900">
                    Invoices
                  </h3>
                </div>
                <InvoicesList userData={userData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const staticData = [
  { date: new Date("2021-01-01"), value: 10 },
  { date: new Date("2021-02-01"), value: 20 },
  // More static data points...
];

function isChartDataEmpty(data) {
  return data.every((entry) => {
    // Check all keys in each entry except 'date'
    return Object.keys(entry).reduce((isEmpty, key) => {
      if (key !== "date" && entry[key] !== 0) {
        return false; // Found a non-zero value, so data isn't empty
      }
      return isEmpty;
    }, true);
  });
}

{
  /* <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                    <dt className="flex-none">
                      <span className="sr-only">Client</span>
                      <BuildingOfficeIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500">
                      Brisbane Office
                    </dd>
                  </div>
                  <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                    <dt className="flex-none">
                      <span className="sr-only">Due date</span>
                      <BuildingOfficeIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500">
                      <time dateTime="2023-01-31">Adelaide Office</time>
                    </dd>
                  </div>
                  <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                    <dt className="flex-none">
                      <span className="sr-only">Status</span>
                      <BuildingOfficeIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500">
                      Sydney Office
                    </dd>
                  </div> */
}
