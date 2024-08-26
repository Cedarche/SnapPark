import React, { useState, useEffect } from "react";
import { CreditCardIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { LogosMastercard, LogosAmex } from "./CardLogos";
import { useRecoilState } from "recoil";
import { userState } from "@/Reusable/RecoilState";
import { DocumentData } from "firebase/firestore";
import AddPaymentMethodForm from "./AddPaymentMethod";
import Spinner from "@/Reusable/Spinner";

const ShowPaymentMethods = ({ setOpen }) => {
  const [userData, setUserData] = useRecoilState<DocumentData | undefined>(
    userState,
  );
  const [planData, setPlanData] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [additionalPaymentMethods, setAdditionalMethods] = useState<any>(null);
  const [addMethod, setAddMethod] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      const plan = userData?.data.plan;
      const status = userData?.data.status;
      setPlanData({ plan, status });
      if (
        userData.data.paymentDetails &&
        Object.keys(userData.data.paymentDetails).length > 0
      ) {
        const defaultPayment = userData?.data.paymentDetails;
        const additionMethods = userData?.data.additionalPaymentDetails
          ? userData?.data.additionalPaymentDetails
          : null;
        setAdditionalMethods(additionMethods);
        setPaymentDetails(defaultPayment);
      }
    }
  }, [userData]);

  const handleSelectPaymentMethod = async (selectedPaymentMethod: any) => {
    setLoading(true);
    try {
      // Update the default payment method in Firestore
      const userId = userData.id; // Adjust this according to your Firestore structure
      const response = await fetch(
        import.meta.env.VITE_STRIPE_UPDATE_PAYMENT_METHOD,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            paymentMethodId: selectedPaymentMethod.paymentMethodId,
          }),
        },
      );

      if (response.ok) {
        // Update local state to reflect the change
        setUserData((prevData: any) => ({
          ...prevData,
          data: {
            ...prevData.data,
            paymentDetails: selectedPaymentMethod,
            additionalPaymentDetails: additionalPaymentMethods
              .filter(
                (method: any) =>
                  method.paymentMethodId !==
                  selectedPaymentMethod.paymentMethodId,
              )
              .concat(paymentDetails),
          },
        }));
        setLoading(false);
      } else {
        console.error("Failed to update default payment method");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating default payment method:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {addMethod ? (
        <AddPaymentMethodForm setOpen={setOpen} setAddMethod={setAddMethod} />
      ) : (
        <form>
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">
                Available Payment Methods
              </span>
            </div>
          </div>
          <div className="rounded-lg shadow-sm ring-1 ring-gray-900/20 my-3 pb-2 bg-white">
            <dl className="flex flex-wrap">
              <div className="flex-auto pl-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <dt className="flex-none">
                      <span className="sr-only">Current Payment Method</span>
                      <CreditCardIcon
                        className="h-6 w-5 text-gray-900"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 font-bold text-gray-900 ml-2">
                      <time dateTime="2023-01-31">Current Payment Method</time>
                    </dd>
                  </div>
                </div>
              </div>
            </dl>
            {paymentDetails ? (
              <div className="rounded-md bg-green-100 ring-2 ring-green-200 px-6 py-5 flex justify-between sm:flex sm:items-center sm:justify-between mx-2 mt-2">
                <h4 className="sr-only">{paymentDetails.brand}</h4>
                <div className="inline-flex gap-x-2 items-center sm:flex sm:items-start">
                  {paymentDetails.brand === "visa" ? (
                    <div className="pt-2">
                      <svg
                        className="h-8 w-auto sm:h-6 sm:flex-shrink-0"
                        viewBox="0 0 36 24"
                        aria-hidden="true"
                      >
                        <rect width={36} height={24} fill="#224DBA" rx={4} />
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
                    // onClick={handleAddPaymentMethod}
                  >
                    Current
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="rounded-md bg-blue-50 px-6 py-5 flex-row flex sm:items-center justify-between mx-2
                   cursor-pointer hover:bg-indigo-100 mt-2"
              >
                <div className="text-sm ">Add Payment Details</div>
                <PlusCircleIcon
                  className="h-6 w-5 text-gray-900"
                  aria-hidden="true"
                />
              </div>
            )}
            {additionalPaymentMethods && (
              <dl className="flex flex-wrap">
                <div className="flex-auto pl-3 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                      <dt className="flex-none">
                        <span className="sr-only">Current Payment Method</span>
                        <CreditCardIcon
                          className="h-6 w-5 text-gray-900"
                          aria-hidden="true"
                        />
                      </dt>
                      <dd className="text-sm leading-6 font-bold text-gray-900 ml-2">
                        <time dateTime="2023-01-31">Additional</time>
                      </dd>
                    </div>
                  </div>
                </div>
              </dl>
            )}
            {additionalPaymentMethods &&
              additionalPaymentMethods.map((addPaymentDetail, index) => (
                <div
                  key={index}
                  className="rounded-md bg-blue-50 px-6 py-5 flex justify-between sm:flex sm:items-center sm:justify-between mx-2 mt-2"
                >
                  <h4 className="sr-only">{addPaymentDetail.brand}</h4>
                  <div className="inline-flex gap-x-2 items-center sm:flex sm:items-start">
                    {addPaymentDetail.brand === "visa" ? (
                      <div className="pt-2">
                        <svg
                          className="h-8 w-auto sm:h-6 sm:flex-shrink-0"
                          viewBox="0 0 36 24"
                          aria-hidden="true"
                        >
                          <rect width={36} height={24} fill="#224DBA" rx={4} />
                          <path
                            fill="#fff"
                            d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                          />
                        </svg>
                      </div>
                    ) : addPaymentDetail.brand === "mastercard" ? (
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
                        Ending with {addPaymentDetail.last4}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
                        <div>
                          Expires {addPaymentDetail.exp_month}/
                          {String(addPaymentDetail.exp_year).slice(-2)}
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
                      onClick={() => handleSelectPaymentMethod(addPaymentDetail)}
                    >
                      {loading ? <Spinner /> : "Select"}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-1 w-full inline-flex gap-x-1.5 items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setAddMethod(true)}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add new method
              <PlusCircleIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default ShowPaymentMethods;
