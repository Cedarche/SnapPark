import { Fragment, useState, useMemo, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CreditCardIcon } from "@heroicons/react/24/outline";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Spinner from "@/Reusable/Spinner";
import ShowPaymentMethods from "./Stripe/ShowPaymentMethods";

import SetupForm from "./Stripe/SetupForm";
// const stripePromise = loadStripe(
//   "pk_test_51Oq403A0cKv1FNCt83dqrwPexukVkBplnrbVby7vQNs35NTZNk9hANd6ZiaDBboRMPmXYuvL51kmDdxnLkby9ahg00BNC3MMwD",
// );
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK_LIVE);

export default function SlideOver({
  open,
  setOpen,
  userData,
  updateMethod,
}: any) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientSecret = async () => {
      setIsLoading(true);
      if (open && updateMethod && userData?.data?.stripeCustomerId) {
        console.log("Calling for new setupIntent");
        // Fetch the client secret from your Firebase function
        const response = await fetch(
          import.meta.env.VITE_STRIPE_NEW_SETUPINTENT_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerId: userData.data.stripeCustomerId,
            }), // Pass customer ID
          },
        );
        const data = await response.json();
        console.log("Response data: ", data);
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      } else if (open && userData?.data?.subscriptionDetails?.clientSecret) {
        console.log("Secret already exists");
        setClientSecret(userData.data.subscriptionDetails.clientSecret);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchClientSecret();
  }, [updateMethod, userData, open]);

  const options = useMemo(() => {
    if (clientSecret) {
      return { clientSecret };
    }
    return {}; // Return an empty object when clientSecret is not available
  }, [clientSecret]);

  if (isLoading) {
    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                        <button
                          type="button"
                          className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          onClick={() => setOpen(false)}
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    <div
                      className="flex h-full flex-col overflow-y-scroll bg-white 
                py-6 shadow-xl"
                    >
                      <div className="px-4 sm:px-6 mt-14">
                        <div className="inline-flex gap-x-2">
                          <CreditCardIcon className="h-6 w-6" />
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Add Payment Method
                          </Dialog.Title>
                        </div>
                      </div>
                      <div className="relative mt-6 flex pt-20   px-4 sm:px-6 items-center justify-center">
                        <Spinner />
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }

  // Ensure clientSecret is present before rendering Elements
  if (!clientSecret) {
    return null; // Or a fallback UI if you want to show something else
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                        <button
                          type="button"
                          className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          onClick={() => setOpen(false)}
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    <div
                      className="flex h-full flex-col overflow-y-scroll bg-white 
                  py-6 shadow-xl"
                    >
                      <div className="px-4 sm:px-6 mt-14">
                        <div className="inline-flex gap-x-2">
                          <CreditCardIcon className="h-6 w-6" />
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Add Payment Method
                          </Dialog.Title>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        {updateMethod ? (
                          <ShowPaymentMethods setOpen={setOpen} />
                        ) : (
                          <SetupForm setOpen={setOpen} />
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </Elements>
  );
}

// function Payment(props) {

//   return (
//     <>
//       <form>
//         <h1 className="mb-2">Address</h1>
//         <AddressElement options={{ mode: "billing" }} />
//         <h1 className="mb-2 mt-4">Payment details</h1>
//         <PaymentElement />
//         <button>Submit</button>
//       </form>
//     </>
//   );
// }
