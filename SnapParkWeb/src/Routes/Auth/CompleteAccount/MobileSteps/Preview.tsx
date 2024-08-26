import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { updateCompleteProfile } from "@/Reusable/Functions/authFunctions";
import { useRecoilState } from "recoil";
import { EditProfilState } from "@/Reusable/RecoilState";
import Spinner from "@/Reusable/Spinner";
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ProfileState, Address } from "@/Reusable/Types/types";

export default function Preview() {
  const [savedProfile, setSavedProfile] =
    useRecoilState<ProfileState>(EditProfilState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log("Saved Profile: ", savedProfile);
  }, [savedProfile]);

  const user = auth.currentUser;

  const handleSubmit = async () => {
    setLoading(true);
    const { country, countryInfo, mobile, offices, spotsArray, address } =
      savedProfile;

    if (
      !country ||
      !countryInfo ||
      !mobile ||
      !address ||
      !offices ||
      !spotsArray ||
      spotsArray.length < 1
    ) {
      setLoading(false);
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 5000);
      return;
    }

    let updatedAddress: Address = { ...address };
    if (!address.latitude || !address.longitude) {
      const coords = await getCoordinates(address);
      if (coords.latitude !== null && coords.longitude !== null) {
        updatedAddress = {
          ...address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setSavedProfile((prevProfile) => ({
          ...prevProfile,
          address: updatedAddress,
        }));
      } else {
        console.log("Unable to obtain coordinates for the provided address");
      }
    }

    try {
      if (user && savedProfile) {
        await updateCompleteProfile(user.uid, {
          ...savedProfile,
          address: updatedAddress,
        });
        console.log("Successfully completed profile!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 5000);
    }
  };

  return (
    <div className="bg-white shadow w-full sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Almost there
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            You can change your profile information, add carparks, and generate
            new QR code stickers from the dashboard. To continue using the
            service after your 30 day free trial, please enter your billing
            details in the <span className="text-blue-600">billing</span> page.
          </p>
        </div>
        <section className="mt-3 rounded-xl border bg-gray-50 px-4 py-6 my-2 sm:p-6 lg:col-span-5 lg:mt-3 lg:p-6">
          <h2
            id="summary-heading"
            className="text-lg font-medium text-gray-900 pb-2 border-b"
          >
            Profile Details
          </h2>
          <dl className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Company Name: </dt>
              <dd className="text-sm font-medium text-gray-900">
                {user?.displayName || "N/A"}
              </dd>
            </div>
            <div className="flex items-center justify-between mt-1">
              <dt className="text-sm text-gray-600">Office Name: </dt>
              <dd className="text-sm font-medium text-gray-900">
                {savedProfile.offices?.[0] || "N/A"}
              </dd>
            </div>
            <div className="flex items-center justify-between mt-1">
              <dt className="text-sm text-gray-600">Contact Mobile: </dt>
              <dd className="text-sm font-medium text-gray-900">
                {savedProfile.mobile || "N/A"}
              </dd>
            </div>
            <div className="flex items-start justify-between mt-1">
              <dt className="text-sm text-gray-600">Office Address: </dt>
              <dd className="text-sm font-medium text-right text-gray-900">
                {savedProfile.address?.street}
                <br />
                {savedProfile.address?.locality}, {savedProfile.address?.state},{" "}
                {savedProfile.address?.postalCode}
              </dd>
            </div>
          </dl>
        </section>
        <section
          aria-labelledby="summary-heading"
          className="mt-3 rounded-xl border bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-6"
        >
          <h2
            id="summary-heading"
            className="text-lg font-medium text-gray-900"
          >
            Summary
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-bold text-indigo-600">
                {savedProfile.plan?.name} Plan
              </dt>
              <dd className="text-sm font-medium text-indigo-600 text-right">
                {savedProfile.plan?.currencyCode}{" "}
                {currencySymbols[savedProfile.plan?.currencyCode || "USD"]}
                {
                  savedProfile.plan?.price["monthly"]?.[
                    savedProfile.plan.currencyCode
                  ]
                }{" "}
                {savedProfile.plan?.metricName}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dl className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <dt className="flex text-sm text-gray-600 font-bold">
                    <span>Plan Limits</span>
                  </dt>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex pl-4 text-sm text-gray-600">
                    <span>Offices</span>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {savedProfile.plan?.limits.offices === 100000
                      ? "Unlimited"
                      : savedProfile.plan?.limits.offices}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex pl-5 text-sm text-gray-600">
                    <span>Employees per Office</span>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {savedProfile.plan?.limits.employees === 100000
                      ? "Unlimited"
                      : savedProfile.plan?.limits.employees}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex text-sm text-gray-600">
                <span>Subtotal</span>
              </dt>
              <dd className="text-sm font-medium text-gray-900">$0.00</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex text-sm text-gray-600">
                <span>Tax estimate</span>
                <a
                  href="#"
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Learn more about how tax is calculated
                  </span>
                  <QuestionMarkCircleIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </a>
              </dt>
              <dd className="text-sm font-medium text-gray-900">$0.00</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">
                Order total
              </dt>
              <dd className="text-base font-medium text-gray-900">
                Free Trial
              </dd>
            </div>
          </dl>
        </section>
        {error && (
          <div className="inline-flex items-center mt-3">
            <XCircleIcon
              className="h-5 w-5 mr-2 text-red-400"
              aria-hidden="true"
            />
            <div className="text-sm text-red-400">
              Something went wrong, please review details and try again.
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-end rounded-md bg-indigo-600 px-4 py-2.5 
            text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {loading ? (
              <div className="inline-flex gap-x-2">
                <Spinner /> Preparing profile...
              </div>
            ) : (
              "Continue to Dashboard"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "$",
};

const getCoordinates = async (
  address: Address,
): Promise<{ latitude: number | null; longitude: number | null }> => {
  const addressString = `${address.street}, ${address.locality}, ${address.state}, ${address.postalCode}, ${address.country}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${import.meta.env.VITE_MAPS_TEST_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      console.log("Latitude:", lat, "Longitude:", lng);
      return { latitude: lat, longitude: lng };
    } else {
      console.error("Geocoding failed:", data.status);
      return { latitude: null, longitude: null };
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return { latitude: null, longitude: null };
  }
};
