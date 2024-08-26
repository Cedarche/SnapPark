import { PlusCircleIcon } from "@heroicons/react/20/solid";
import Spinner from "@/Reusable/Spinner";
import { useState, useRef, useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  stepsArrayState,
  EditProfilState,
  toastError,
  showErrorToast,
} from "@/Reusable/RecoilState";
import { auth } from "@/firebase";
import { Switch } from "@headlessui/react";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { countries } from "country-data";
import "react-phone-input-2/lib/style.css";
import "./PhoneNumber.css";
import "./TextBubble.css";
import countriesTimeZoneData from "./TimeZones.json";
import AddressInput from "./AddressInput";

const EditProfile = () => {
  const [steps, setSteps] = useRecoilState(stepsArrayState);
  const [savedProfile, setSavedProfile] = useRecoilState(EditProfilState);
  const [loading, setLoading] = useState(false);
  const [offices, setOffices] = useState<string[]>([]);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [mobile, setMobile] = useState("");
  const [, setErrorMessage] = useRecoilState(toastError);
  const [, setShowError] = useRecoilState(showErrorToast);
  const [inputValue, setInputValue] = useState(offices[0]); // Initialize with the first office name
  const [callingCode, setCallingCode] = useState<any | undefined>("AU");

  const handleChange = (event: any) => {
    setInputValue(event.target.value); // Update the state on every keystroke
  };

  const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input element

  const user = auth.currentUser;

  useEffect(() => {
    if (savedProfile) {
      // Prefill the offices list
      if (savedProfile?.offices) {
        setOffices(savedProfile?.offices);
        setInputValue(savedProfile.offices[0]);
      }

      if (savedProfile?.logoPath) {
        setLogoPath(savedProfile?.logoPath);
      }
      if (savedProfile?.mobile) {
        setMobile(savedProfile?.mobile);
      }
    }
  }, [savedProfile, inputRef]);

  const handleAddOffice = (newOffice: string) => {
    setOffices([...offices, newOffice]);
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the input after adding
    }
  };

  const handleRemoveOffice = (officeIndex: number) => {
    setOffices(offices.filter((_, index) => index !== officeIndex));
  };

  const handleClick = () => {
    if (inputRef.current) {
      const newOffice = inputRef.current.value;
      handleAddOffice(newOffice);
    }
  };

  const updateStepStatus = (clickedStepName: any) => {
    const updatedSteps = steps.map((step) => {
      if (step.name === clickedStepName) {
        return { ...step, status: "current" };
      } else {
        if (step.status === "current") {
          return { ...step, status: "complete" };
        }

        return step;
      }
    });

    setSteps(updatedSteps);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setShowError(false);
    setErrorMessage("");
    setLoading(true);
    if (!mobile) {
      setErrorMessage("Please enter a valid phone number");
      setShowError(true);
      setLoading(false);
    }

    if (!isValidPhoneNumber(String(mobile))) {
      setErrorMessage("Please enter a valid phone number");
      setShowError(true);
      setLoading(false);
      return;
    }
    const website = event.target.website?.value || "";
    // const mobile = event.target.mobile.value;

    const form = event.target as typeof event.target & {
      location: { value: string };
    };
    const countryAlpha2 = form.location.value;
    // console.log("Country Alpha: ", countryAlpha2);

    const selectedCountry: any | undefined = countries.all.find(
      (country: any) => country.alpha2 === countryAlpha2,
    );

    // console.log("Selected Country: ", selectedCountry);

    const country = selectedCountry?.name;
    const selectedCountryData = countriesTimeZoneData.countries.find(
      (country: any) => country.name === selectedCountry?.name,
    );

    // console.log("Selected Country Data: ", selectedCountryData);

    // Extract the timezone_offset
    const timezoneOffset = selectedCountryData?.timezone_offset;
    console.log(timezoneOffset);
    if (timezoneOffset != 0 && !timezoneOffset) {
      setErrorMessage("Something went wrong, please try again.");
      setShowError(true);
      setLoading(false);
      return;
    }
    const countryInfo = { ...selectedCountry, timezoneOffset };
    // console.log("Selected country", countryInfo);

    if (!enabled) {
      const offices = [event.target.office.value];

      // console.log(profileState);
      setSavedProfile((prevProfile) => ({
        ...prevProfile, // Spread the existing state to preserve other properties
        website: website,
        mobile: mobile,
        country: country,
        countryInfo: countryInfo,
        offices: offices,
      }));
    } else {
      // console.log(profileState);
      // setSavedProfile(profileState);
      setSavedProfile((prevProfile) => ({
        ...prevProfile, // Spread the existing state to preserve other properties
        website: website,
        mobile: mobile,
        country: country,
        countryInfo: countryInfo,
        offices: offices,
      }));
    }

    try {
      // Create an array of promises
      const promises: Promise<any>[] = [];
      // if (user && logoPath && file) {
      //   promises.push(handleLogoUpload(user.uid, file));
      // }
      if (user && website && mobile && country && offices) {
        console.log("savedprofile: ", savedProfile);
      }

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Update step status after all operations are complete
      updateStepStatus("Add Parking Spots");
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle errors appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        className="w-full m-2 sm:m-0 sm:p-5 sm:pb-2.5 bg-white"
        onSubmit={handleSubmit}
      >
        <CountrySelect
          savedProfile={savedProfile}
          setCallingCode={setCallingCode}
        />
        <div className="flex flex-col  w-full lg:w-3/5 items-start mt-2">
          <AddressInput countryRestriction={[callingCode.toLowerCase()]} />
        </div>
        <div className="flex flex-col  w-full lg:w-3/5 items-start mt-6">
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
              defaultCountry={callingCode || "AU"}
              value={mobile}
              onChange={(value) => {
                // Call setMobile with the value if it's not undefined, otherwise set it to an empty string or handle it as you see fit
                setMobile(value || "");
              }}
            />
          </div>
        </div>

        {enabled ? (
          <div className="flex flex-col items-start  w-full lg:w-3/5 mt-2">
            <label
              htmlFor="office"
              className="block text-xs font-medium leading-6 text-gray-600"
            >
              Add any separate offices:
              <br />
              {offices.map((office, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center rounded-md mb-2 bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-600 ${index !== 0 ? "ml-2" : ""}`}
                >
                  {office}
                  <button
                    onClick={() => handleRemoveOffice(index)}
                    className="ml-1 w-4 h-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="cursor-pointer"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </label>
            <div className="relative mt-0.0 rounded-md shadow-sm w-full">
              <input
                ref={inputRef}
                type="text"
                name="office"
                id="office"
                className="block w-full min-w-full text-md rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
                placeholder="E.g. Brisbane"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <PlusCircleIcon
                  onClick={handleClick} // Add onClick handler
                  className="h-5 w-5 text-blue-400 cursor-pointer" // Add cursor-pointer for better UX
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start  w-full lg:w-3/5 mt-2">
            <label
              htmlFor="office"
              className="block text-xs font-medium leading-6 text-gray-600"
            >
              What's your office called? E.g. the Suburb or City.
              <br />
            </label>
            <div className="relative mt-0.0 rounded-md shadow-sm w-full">
              <input
                ref={inputRef}
                type="text"
                name="office"
                id="office"
                value={inputValue}
                maxLength={20}
                onChange={handleChange}
                className="block w-full min-w-full text-[14px] font-normal rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
                placeholder="E.g. Downtown"
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-start justify-center w-full lg:w-full mt-2 mb-1">
          <label
            htmlFor="Example Notification"
            className="block text-xs font-medium leading-6 text-gray-600"
          >
            Example Notification:
          </label>
          <div className="flex w-full items-center justify-center md:justify-start">
            <div className="flex justify-center ml-3 my-2 w-3/5 z-10 border rounded-xl p-1.5 bg-[#E9E9EB] relative text-bubble max-w-[240px]">
              <span className="text-sm font-normal z-10 ">
                {user?.displayName} - The {inputValue} office parking is full.
                <br />
                <br />
                See{" "}
                <span className="text-[#0b81f6] underline">
                  snappark.co/all/123456
                </span>{" "}
                for the status of all parking spots.
              </span>
            </div>
          </div>
          {/* <div className="flex w-full mt-1 items-center justify-center md:justify-start">
            <div
              className="flex flex-row items-center border border-gray-100 rounded-3xl p-3 max-w-[330px]"
              style={{ backgroundColor: "#f9f9f9c6" }}
            >
              <div className="mr-3">
                <img
                  className="h-10 w-auto rounded-lg"
                  src={AppIcon}
                  alt="Logo"
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <div className="inline-flex justify-between">
                  <h3 className="text-xs font-semibold tracking-wide">Office Parking Full</h3>
                  <span className="text-[10px] font-light text-gray-400 tracking-wide">now</span>
                </div>
                <span className="text-xs font-light tracking-wide">
                  The {inputValue} office parking is now full. Please press here
                  for a list of alternative parking spots.
                </span>
              </div>
            </div>
          </div> */}
        </div>

        <div className="flex flex-col items-start  w-full lg:w-full mt-2 mb-1">
          <Toggle enabled={enabled} setEnabled={setEnabled} />
        </div>

        <div className="pt-2.5 w-full  flex  justify-end  ">
          <button
            type="submit"
            disabled={loading}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {loading ? <Spinner /> : "Next"}
          </button>
        </div>
      </form>
    </>
  );
};

export default EditProfile;

// enabled, setEnabled
function Toggle({}: any) {
  return (
    <Switch.Group
      as="div"
      className="flex items-center justify-between w-full lg:w-3/5"
    >
      <span className="flex flex-grow flex-col">
        <Switch.Label
          as="span"
          className="block text-xs font-medium leading-6 text-gray-600"
          passive
        >
          If you have more than one office, you can add more in the Settings
          page.
        </Switch.Label>
      </span>
    </Switch.Group>
  );
}

// Define a type for the component's props
interface CountrySelectProps {
  savedProfile?: {
    countryInfo?: any;
  };
  setCallingCode: (code: string) => void; // Assuming setCallingCode accepts a string argument
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  savedProfile,
  setCallingCode,
}) => {
  // Filtering countries to include only those with an emoji
  const countriesWithEmoji = countries.all;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryCode = event.target.value;
    setCallingCode(selectedCountryCode);
  };

  return (
    <div className="flex flex-col items-start w-full lg:w-3/5 -mt-1">
      <label
        htmlFor="location"
        className="block text-xs font-medium leading-6 text-gray-600"
      >
        Main Office Country
      </label>
      <select
        id="location"
        name="location"
        className="mt-0 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        defaultValue={savedProfile?.countryInfo?.alpha2 || "AU"}
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
