import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  PlusCircleIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useRecoilValue } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { countries } from "country-data";
import "../../../Auth/CompleteAccount/MobileSteps/PhoneNumber.css";
import "react-phone-input-2/lib/style.css";
import "react-phone-number-input/style.css";
import countriesTimeZoneData from "../../../Auth/CompleteAccount/MobileSteps/TimeZones.json";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";

import Spinner from "@/Reusable/Spinner";

type Office = {
  id: string; // Assuming id is a string
  data: {
    office: string; // Assuming office is a string within data
  };
};

interface CountryInfo {
  name: string;
  // include other properties that countryInfo might have
  currencies: string[];
  emoji: string;
  // etc.
}

interface RequestData {
  officeName: string;
  country: string;
  countryInfo: CountryInfo;
  mobile: string;
}

interface ResponseData {
  message: string;
}

export default function AddOfficeModal({ open, setOpen }: any) {
  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue<any>(userState);
  const sOffice = useRecoilValue<any>(selectedOffice);
  const [selectedOfficeName, setSelectedOffice] = useState<string>("");
  const [officeName, setOfficeName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [countryAlpha2, setCountryAlpha2] = useState<string>();
  const [countryInfo, setCountryInfo] = useState<CountryInfo>();
  const [notifications, setNotifications] = useState<boolean>(true);

  const cancelButtonRef = useRef(null);
  const navigate = useNavigate()

  useEffect(() => {
    if (userData && sOffice) {
      setSelectedOffice(sOffice?.data.office);
      setCountryAlpha2(userData?.data.countryInfo.alpha2);
    }
  }, [sOffice]);

  useEffect(() => {
    const selectedCountry: any | undefined = countries.all.find(
      (country: any) => country.alpha2 === countryAlpha2,
    );
    const country = selectedCountry?.name;
    const selectedCountryData = countriesTimeZoneData.countries.find(
      (country: any) => country.name === selectedCountry?.name,
    );

    // Extract the timezone_offset
    const timezoneOffset = selectedCountryData?.timezone_offset;
    if (!timezoneOffset) {
      console.log("Doesnt exist in timezone data");
    }
    const countryInfo = { ...selectedCountry, timezoneOffset };

    setCountryInfo(countryInfo);
  }, [countryAlpha2]);

  const handleSubmit = async () => {
    setLoading(true);
    if (!countryInfo || !officeName || !mobile || !userData.id) {
      console.log("Error: Required fields are missing");
      setLoading(false);
      return;
    }

    const functions = getFunctions();
    const createOffice = httpsCallable<RequestData, ResponseData>(
      functions,
      "createOffice",
    );

    try {
      const result = await createOffice({
        officeName,
        country: countryInfo.name,
        countryInfo,
        mobile,
      });
      setLoading(false);
      setOpen(false)
      navigate("/dashboard")
      // console.log("Office created successfully:", result.data.message);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating office:", error.message);
      } else {
        console.error("Error creating office:", String(error));
      }
    }

    setLoading(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-300 bg-opacity-75 lg:bg-gray-300 lg:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-xl bg-white min-w-full md:min-w-0
                text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm md:sm:max-w-xs"
              >
                <div className="bg-blue px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ">
                  {/* <div className="sm:flex sm:items-start"> */}
                  <div className="sm:flex sm:flex-col sm:w-full sm:items-center sm:justify-center">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left  w-full">
                      <Dialog.Title
                        as="h3"
                        className=" inline-flex gap-x-2 items-center text-base font-semibold leading-6 lg:w-4/5  text-gray-900"
                      >
                        <div
                          className="mx-auto  flex h-12 w-12 mr-3 flex-shrink-0 items-center justify-center rounded-full
                     bg-green-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <BuildingOffice2Icon
                            className="h-6 w-6 text-green-400"
                            aria-hidden="true"
                          />
                        </div>
                        Add a new Office
                      </Dialog.Title>
                      <div className="mt-5 lg:mt-2 flex flex-col  items-start">
                        <div className="flex flex-col  w-full lg:w-full items-start mt-2">
                          <label
                            htmlFor="name"
                            className="block text-xs font-medium leading-6 text-gray-600"
                          >
                            Office Name
                          </label>
                          <div className="mt-0 w-full">
                            <input
                              type="name"
                              name="name"
                              id="name"
                              value={officeName}
                              onChange={(e) => setOfficeName(e.target.value)}
                              className="block w-full rounded-md border-1 pl-3 py-1.5 text-gray-900 shadow-sm
                               ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2
                                focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder=""
                            />
                          </div>
                        </div>

                        <CountrySelect
                          defaultCountry={userData.data.countryInfo.alpha2}
                          setCountryAlpha2={setCountryAlpha2}
                          // savedProfile={savedProfile}
                          // setCallingCode={setCallingCode}
                        />
                        <div className="flex flex-col  w-full lg:w-full items-start mt-2">
                          <label
                            htmlFor="phone-number"
                            className="block text-xs font-medium leading-6 text-gray-600"
                          >
                            Contact Phone Number
                          </label>
                          <div className="relative mt-0 rounded-md shadow-sm w-full">
                            <PhoneInput
                              // country="AU"
                              className="my-phone-input"
                              placeholder="Enter phone number"
                              defaultCountry={
                                userData.data.countryInfo.alpha2 || "AU"
                              }
                              value={mobile}
                              onChange={(value) => {
                                // Call setMobile with the value if it's not undefined, otherwise set it to an empty string or handle it as you see fit
                                setMobile(value || "");
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-row mt-5 justify-between w-full lg:w-full items-start">
                          <span className="block text-xs font-bold leading-6 text-gray-600">
                            Status
                          </span>
                          <ToggleSwitch
                            notifications={notifications}
                            setNotifications={setNotifications}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3
                     py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 
                     sm:ml-2 sm:w-auto"
                    onClick={handleSubmit}
                  >
                    {loading ? <Spinner /> : "Add"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3
                     py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset
                      ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

function ToggleSwitch({ notifications, setNotifications }: any) {
  const [enabled, setEnabled] = useState(true);

  return (
    <Switch
      checked={notifications}
      onChange={setNotifications}
      className={classNames(
        notifications ? "bg-green-400" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          notifications ? "translate-x-5" : "translate-x-0",
          "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        )}
      >
        <span
          className={classNames(
            notifications
              ? "opacity-0 duration-100 ease-out"
              : "opacity-100 duration-200 ease-in",
            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-gray-400"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={classNames(
            notifications
              ? "opacity-100 duration-200 ease-in"
              : "opacity-0 duration-100 ease-out",
            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-indigo-600"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  );
}

interface CountrySelectProps {
  defaultCountry: string;
  setCountryAlpha2: any;
  // setCallingCode: (code: string) => void; // Assuming setCallingCode accepts a string argument
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  defaultCountry,
  setCountryAlpha2,
}) => {
  // Filtering countries to include only those with an emoji
  const countriesWithEmoji = countries.all.filter(
    (country: any) => country.emoji,
  );
  // console.log(countriesWithEmoji);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryCode = event.target.value;
    // setCallingCode(selectedCountryCode);
    setCountryAlpha2(selectedCountryCode);
  };

  return (
    <div className="flex flex-col items-start w-full lg:w-full mt-2">
      <label
        htmlFor="location"
        className="block text-xs font-medium leading-6 text-gray-600"
      >
        Country
      </label>
      <select
        id="location"
        name="location"
        className="mt-0 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        defaultValue={defaultCountry || "AU"}
        onChange={handleChange}
        required
      >
        {countriesWithEmoji.map((country: any, index: number) => (
          <option key={index} value={country.alpha2}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
};
