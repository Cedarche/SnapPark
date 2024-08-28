import { useState } from "react";

import { useNavigate } from "react-router-dom";
import Spinner from "@/Reusable/Spinner";
import Alert from "../../../Reusable/Alert";
import SnapParkLogo from "../../../assets/SnapParkLogo-01.png";
import { Link } from "react-router-dom";

import {
  EmailSignIn,
  sendPasswordReset,
} from "@/Reusable/Functions/authFunctions";

export default function Login() {
  const [loading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("Forgot Password?");
  const [messageArray, setMessageArray] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessageArray([]); // Reset message array at the start
  
    // Access email and password inputs directly
    const form = event.currentTarget;
    const emailElement = form.elements.namedItem("email") as HTMLInputElement;
    const passwordElement = form.elements.namedItem("password") as HTMLInputElement;
  
    if (emailElement && passwordElement) {
      const email = emailElement.value;
      const password = passwordElement.value;
  
      if (!validateEmail(email)) {
        setMessageArray(["Please enter a valid email address."]);
        setIsLoading(false);
        setTimeout(() => setMessageArray([]), 5000);
        return;
      }
  
      try {
        const success = await EmailSignIn(email, password);
        if (success) {
          navigate("/dashboard");
        }
      } catch (error: any) {
        const errorCode = error.code; // Access the error code
        switch (errorCode) {
          case "auth/invalid-email":
            setMessageArray(["Invalid email address"]);
            break;
          case "auth/invalid-credential":
            setMessageArray(["Password is incorrect"]);
            break;
          case "auth/wrong-password":
            setMessageArray(["Password is incorrect"]);
            break;
          // Handle more error codes as needed
          default:
            setMessageArray([
              "An unexpected error occurred. Please try again.",
            ]);
        }
        // console.error("Signup failed:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setMessageArray([]), 5000);
      }
    } else {
      console.error("Email or password field not found.");
    }
  };



  const handleResetPassword = async () => {
    if (!email) {
      setMessageArray(["Please enter your email address."]);
      setTimeout(() => setMessageArray([]), 5000);
      return;
    }

    setIsLoading(true);
    setResetMessage("Sending...");

    const resetSuccess = await sendPasswordReset(email);
    if (resetSuccess) {
      setResetMessage("Sent!");
      // Optionally reset the message after a delay
      setTimeout(() => setResetMessage("Forgot Password?"), 5000);
    } else {
      setResetMessage("Failed to send. Try again?");
    }

    setIsLoading(false);
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
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link to="/" className="w-full flex items-center justify-center">
              <img
                className="h-9 w-auto"
                src={SnapParkLogo}
                alt="Snap Park Logo"
              />
            </Link>
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div
            className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"
            style={{ minWidth: "320px" }}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    onChange={(event) => setEmail(event.currentTarget.value)}
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
                  <div className="text-sm">
                    <div
                      onClick={handleResetPassword}
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      {resetMessage}
                    </div>
                  </div>
                </div>
                <div className="mt-0">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    data-testid="password"
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
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
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-sm text-gray-500">
              Not a member?{" "}
              <Link
                to="/register"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Start a 30 day free trial
              </Link>
            </p>
          </div>
          {messageArray.length > 0 && <Alert messageArray={messageArray} />}
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
