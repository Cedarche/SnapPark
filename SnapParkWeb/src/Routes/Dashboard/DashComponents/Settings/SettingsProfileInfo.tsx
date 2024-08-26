import { useState, useEffect } from "react";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { useRecoilState } from "recoil";
import { userState } from "@/Reusable/RecoilState";
import Spinner from "@/Reusable/Spinner";
import {
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import {
  sendPasswordReset,
  reactivateAccount,
} from "@/Reusable/Functions/authFunctions";
import DeleteAccountAlert from "./DeleteAccountAlert";
import SuspendAccountAlert from "./SuspendAccountAlert";

export default function ProfileInfo() {
  const [userData, setUserData] = useRecoilState(userState);
  const [edit, setEdit] = useState(false);
  const [fullAddress, setFullAddress] = useState("");
  const [buttonText, setButtonText] = useState("Change password...");
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSuspend, setOpenSuspend] = useState(false);

  if (!userData) {
    return (
      <div className="w-full h-screen flex items-center justify-center pb-60">
        <Spinner />
      </div>
    );
  }

  const userInfo = {
    userID: userData.id,
    customerID: userData.data.stripeCustomerId,
  };

  const handleSubmit = () => {
    if (userData) {
      setEdit(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsSending(true);
    setButtonText("Sending...");
    const success = await sendPasswordReset(userData.data?.email);
    setButtonText(
      success
        ? "Password reset email sent."
        : "Failed to send - please try again.",
    );
    setIsSending(false);

    // Reset button text after 3 seconds
    setTimeout(() => {
      setButtonText("Change password...");
    }, 3000);
  };

  function getFullAddress(billingAddress: any) {
    if (!billingAddress) return "No billing address.";

    const { line1, line2, city, state, postal_code } = billingAddress;
    // Combine the address parts, skipping line2 if it's null or empty
    return `${line1}${line2 ? `, ${line2}` : ""}, ${city}, ${state} ${postal_code}`;
  }

  return (
    <>
      <DeleteAccountAlert open={open} setOpen={setOpen} userInfo={userInfo} />
      <SuspendAccountAlert open={openSuspend} setOpen={setOpenSuspend} />
      <div className="p-4  rounded-xl ring-1 ring-gray-900/20 sm:rounded-t-none sm:rounded-b-xl mt-2 sm:mt-0  lg:p-5 rounded-b-lg shadow-sm  bg-white">
        <div className="px-0 md:px-0 sm:px-0 pr-2 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-black sm:truncate sm:text-3xl sm:tracking-normal">
              Profile Information
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Company details and preferences.
            </p>
          </div>
          <div className="">
            {edit ? (
              <div className="inline-flex gap-x-1  mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setEdit(false)}
                  className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className=" inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEdit(true)}
                className=" mt-2 sm:mt-0 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PencilSquareIcon
                  className="-ml-0.5 h-5 w-5"
                  aria-hidden="true"
                />
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Company name
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {userData.data?.company}
              </dd>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Account Number
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {userData.data?.accountNumber}
              </dd>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Contact Phone Number
              </dt>
              <dd className="mt-1.5 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {/* {userData.data?.mobile} */}
                {edit ? (
                  <div>
                    {" "}
                    <div className=" flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 -my-1 border-gray-300 px-3 text-gray-500 sm:text-sm">
                        +61
                      </span>
                      <input
                        type="number"
                        name="mobile"
                        id="mobile"
                        // value={mobile}
                        // onChange={(e) => setMobile(Number(e.target.value))}
                        className="block w-[140px] pr-1.5 rounded-none rounded-r-md border-0 py-1 -my-1 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0400 111 222"
                      />
                    </div>
                  </div>
                ) : (
                  userData.data?.mobile
                )}
              </dd>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Email address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {/* {userData.data?.email} */}
                {edit ? (
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="block w-4/5 sm:w-3/5 rounded-md border-0 sm:-my-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="admin@example.com"
                    // value={officeName}
                    // onChange={(e) => setOfficeName(e.target.value)}
                  />
                ) : (
                  userData.data?.email
                )}
              </dd>
            </div>
            <div className="px-0 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Password
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {edit ? (
                  // If edit is true, show the button
                  <button
                    type="button"
                    className="rounded-md bg-white px-2 py-1 -my-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={handlePasswordReset} // Optionally, toggle back to false when the button is clicked
                  >
                    {buttonText}
                  </button>
                ) : (
                  // If edit is false, show the dots
                  <span className="text-sm text-gray-700">••••••••</span>
                )}
              </dd>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Country
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {userData.data?.country}
              </dd>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Billing Address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {userData.data?.billingAddress
                  ? getFullAddress(userData.data?.billingAddress)
                  : "No billing address."}
                {/* 58 Shannon Park Rd, Highfields, QLD 4352 */}
              </dd>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Payment method
              </dt>
              {/* {userData.data?.paymentDetails ? <} */}
              <Link
                to="/dashboard/billing"
                className="flex items-center min-w-[300px] pr-2 text-xs "
              >
                <span
                  className="inline-flex mb-3 mt-3 lg:mb-0 lg:mt-0 items-center gap-x-1.5 rounded-md bg-blue-50 px-3 py-1 text-sm 
          font-light text-black-900 hover:cursor-pointer"
                >
                  <svg
                    className="h-1.5 w-1.5 fill-blue-500"
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                  >
                    <circle cx={3} cy={3} r={3} />
                  </svg>
                  Add or Edit in the Billing page
                  <ArrowTrendingUpIcon
                    className="h-4 w-4 text-blue-400"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
            <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Modify Account
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {userData?.data.status === "suspended" ? (
                  <button
                    type="button"
                    onClick={() => reactivateAccount()}
                    className="rounded-md mb-1 sm:mb-0 inline-flex gap-x-1.5 bg-green-100 mr-2 px-2.5 py-1.5 text-sm font-semibold text-green-600 shadow-sm hover:bg-green-100"
                  >
                    Unsuspend Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenSuspend(true)}
                    className="rounded-md mb-1 sm:mb-0 inline-flex gap-x-1.5 bg-yellow-50 mr-2 px-2.5 py-1.5 text-sm font-semibold text-yellow-600 shadow-sm hover:bg-orange-100"
                  >
                    Suspend Account
                    <InformationCircleIcon
                      className="-mr-0.5 h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Deactivate Account
                  <InformationCircleIcon
                    className="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </dd>
            </div>

            {/* <div className="px-0   py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Attachments
            </dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                className="divide-y divide-gray-100 rounded-md border border-gray-200"
              >
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon
                      className="h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        resume_back_end_developer.pdf
                      </span>
                      <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Download
                    </a>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon
                      className="h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        coverletter_back_end_developer.pdf
                      </span>
                      <span className="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Download
                    </a>
                  </div>
                </li>
              </ul>
            </dd>
          </div> */}
          </dl>
        </div>
      </div>
    </>
  );
}
