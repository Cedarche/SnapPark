import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import Spinner from "@/Reusable/Spinner";
import {
  BellIcon,
  PlusCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { updatingBillingAddress } from "@/Reusable/Functions/billingFunctions";

const SetupForm = ({ setOpen }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState<any>(null);

  const handleSubmit = async (event: any) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();
    setIsLoading(true);
    console.log("Submitting...");

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      console.log("Error stripe not loaded...");
      // Make sure to disable form submission until Stripe.js has loaded.
      return null;
    }

    const { error } = await stripe.confirmSetup({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });
    setIsLoading(false);

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
      setIsLoading(false);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
      setIsLoading(false);
      setSuccess(true);
    }
  };

  const handleUpdateBillingAddress = (address: any) => {
    if (address) {
      updatingBillingAddress(address);
    }
  };

  if (success) {
    return (
      <div className="flex w-full items-center justify-center flex-col border p-4 rounded-xl bg-gray-50">
        <ShieldCheckIcon
          className="h-11 w-11 text-green-300"
          aria-hidden="true"
        />
        <div className="mt-5 px-0 font-light text-center text-gray-600">
          Success! Your payment details have been updated. You can now close
          this panel.
        </div>
        <div className="w-full flex items-center justify-end mt-3">
          <button
            type="button"
            className="rounded-md flex items-center flex-row bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white 
            mr-1 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 
            focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setOpen(false)}
          >
            Close <XMarkIcon className="ml-1 mt-0.3 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const paymentElementOptions: any = {
    layout: "tabs",
  };

  const appearance: any = {
    theme: 'stripe',
  
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
      // See all possible variables below
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-sm text-gray-500">
            Billing Address
          </span>
        </div>
      </div>
      <div className="mb-5">
        <AddressElement
          options={{ mode: "billing" }}
          onChange={(event) => {
            if (event.complete) {
              const address = event.value.address;
              handleUpdateBillingAddress(address);
              console.log(address);
            }
          }}
        />
      </div>
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-sm text-gray-500">
            Payment Method
          </span>
        </div>
      </div>
      <PaymentElement id="payment-element1" options={paymentElementOptions} />
      <div className="w-full  flex items-center justify-end mt-4">
        <button
          type="submit"
          disabled={!stripe}
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white mr-1 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {isLoading ? (
            <div className="min-w-12 flex justify-center">
              <Spinner />
            </div>
          ) : (
            "Submit"
          )}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setOpen(false)}
          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default SetupForm;
