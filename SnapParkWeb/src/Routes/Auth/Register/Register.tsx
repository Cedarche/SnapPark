import { useState } from "react";
import { SignUp } from "@/Reusable/Functions/authFunctions";
import { useNavigate } from "react-router-dom";
import Spinner from "@/Reusable/Spinner";
import Alert from "../../../Reusable/Alert";
import QRViewLogo from "../../../assets/QRView_Logo_200.png";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import SnapParkLogo from "../../../assets/SnapParkLogo-01.png";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { appName } from "@/Reusable/constants";
import { Transition } from "@headlessui/react";
import { Link } from "react-router-dom";
import { usePostHog } from "posthog-js/react";

import "./Register.css";

export default function Register() {
  const [loading, setIsLoading] = useState(false);
  const [messageArray, setMessageArray] = useState<string[]>([]);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const navigate = useNavigate();
  const posthog = usePostHog();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessageArray([]); // Reset message array at the start
    posthog?.capture("clicked_register_submit");

    // Access form elements directly
    const form = event.currentTarget;
    const emailElement = form.elements.namedItem("email") as HTMLInputElement;
    const passwordElement = form.elements.namedItem(
      "password",
    ) as HTMLInputElement;
    const confirmPasswordElement = form.elements.namedItem(
      "confirm",
    ) as HTMLInputElement;
    const companyElement = form.elements.namedItem(
      "company",
    ) as HTMLInputElement;

    if (
      emailElement &&
      passwordElement &&
      confirmPasswordElement &&
      companyElement
    ) {
      const email = emailElement.value;
      const password = passwordElement.value;
      const confirmPassword = confirmPasswordElement.value;
      const company = companyElement.value;

      if (!validateEmail(email)) {
        setMessageArray(["Please enter a valid email address."]);
        setIsLoading(false);
        setTimeout(() => setMessageArray([]), 5000);
        return;
      }

      if (password !== confirmPassword) {
        setMessageArray(["Passwords do not match"]);
        setIsLoading(false);
        setTimeout(() => setMessageArray([]), 5000);
        return;
      }

      try {
        const success = await SignUp(email, password, company);
        if (success) {
          console.log("Success!");
          navigate("/dashboard");
        } else {
          console.log("Error during sign up.");
          setMessageArray(["An unexpected error occurred. Please try again."]);
        }
      } catch (error: any) {
        posthog?.capture("register_error");

        let errorCode = "unknown_error";
        let errorMessage = "An unexpected error occurred. Please try again.";

        if (error && typeof error === "object" && "code" in error) {
          errorCode = error.code;
          errorMessage = error.message || errorMessage;
        } else if (error.message === "Error: alreadyExistsError") {
          errorCode = "alreadyExistsError";
        }

        switch (errorCode) {
          case "auth/email-already-in-use":
            setMessageArray([
              "The email address is already in use by another account.",
            ]);
            break;
          case "auth/weak-password":
            setMessageArray([
              "Password should be at least 6 characters and include a special character.",
            ]);
            break;
          case "alreadyExistsError":
            setMessageArray(["The company name is already in use."]);
            break;
          default:
            setMessageArray([errorMessage]);
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => setMessageArray([]), 5000);
      }
    } else {
      console.error("Form elements not found.");
    }
  };

  return (
    <>
      <div
        className="flex min-h-full h-full flex-1 flex-col items-center justify-center px-3 py-12 pb-40 lg:px-8 "
        style={{ minHeight: "100vh" }}
      >
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
          />
        </svg>

        <div className="bg-white w-max border p-10 rounded-xl shadow-lg container mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
            <Link to="/" className="w-full flex items-center justify-center">
              <img
                className="h-9 w-auto"
                src={SnapParkLogo}
                alt="Snap Park Logo"
              />
            </Link>
            <h2 className="mt-5 lg:mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Create a new account
            </h2>
          </div>

          <div
            className="mt-5 lg:mt-7 sm:mx-auto sm:w-full sm:max-w-sm "
            style={{ minWidth: "320px" }}
          >
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <div
                  className="inline-flex items-center "
                  onMouseEnter={() => setIsTooltipVisible(true)}
                  onMouseLeave={() => setIsTooltipVisible(false)}
                >
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Company name
                  </label>
                  <div className="ml-1 relative  z-50">
                    <InformationCircleIcon className="h-5 w-5 mt-0 text-gray-400 cursor-pointer" />
                    <Transition
                      show={isTooltipVisible}
                      enter="transition-opacity duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition-opacity duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute z-50 top-8 sm:top-5 left-0 sm:left-5 w-44 max-h-24 p-2 bg-gray-100 text-gray-600 text-sm font-light rounded-lg shadow-md">
                        Only a shortform name is required. No need to include
                        PTY LTD etc.
                      </div>
                    </Transition>
                  </div>
                </div>
                <div className="mt-0">
                  <input
                    id="company"
                    name="company"
                    type="text"
                    data-testid="company"
                    autoComplete="organization"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-0">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    data-testid="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  {/* <div className="text-xs" >
                    <a className="font-semibold text-indigo-400 hover:text-indigo-500">
                      Passwords should be at least 6 characters long
                    </a>
                  </div> */}
                </div>
                <div className="mt-0">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    data-testid="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="confirm"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Confirm Password
                  </label>
                  {/* <div className="text-sm">
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div> */}
                </div>
                <div className="mt-0 mb-2">
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    data-testid="confirm"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {loading ? (
                    <div className="my-0.5">
                      <Spinner />
                    </div>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-sm text-gray-500">
              Already have an account?
              <Link
                to="/login"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                {" "}
                Sign in
              </Link>
            </p>
          </div>

          {messageArray.length > 0 && <Alert messageArray={messageArray} />}
        </div>
        <div className="flex items-center justify-end mr-14 sm:mr-6 w-[400px] py-1">
          <Link
            to="/privacy-policy"
            className="text-xs text-indigo-400 mr-2 cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </Link>
          <Link
            to="/terms-and-conditions"
            className="text-xs text-indigo-400 cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </>
  );
}

const validateEmail = (email: string): boolean => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};
