import { useState } from "react";
import { functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import JoinAlert from "../Alerts/JoinAlert";
import Spinner from "@/Reusable/Spinner";
// Define the type for the response data
interface AddToAppLaunchListResponse {
  added: boolean;
  message?: string;
}

export default function JoinAppNotifications() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const addToAppLaunchList = httpsCallable<
        { email: string },
        AddToAppLaunchListResponse
      >(functions, "addToAppLaunchList");
      const result =  addToAppLaunchList({ email });
      console.log('Result: ', result)

      setMessage("We'll notify you when the App launches.");
      setSuccess(true);
      setLoading(false);
      setShow(true);
      setTimeout(() => {
        setShow(false), setMessage("");
      }, 4000);
      // if (result.data.added) {
      // } else {
      //   setMessage("Failed to add to the list.");
      //   setSuccess(false);
      //   setLoading(false);
      //   setShow(true);
      //   setTimeout(() => {
      //     setShow(false), setMessage("");
      //   }, 2000);
      // }
    } catch (error) {
      console.error("Error adding to app launch list:", error);
      setMessage("An error occurred. Please try again.");
      setSuccess(false);
      setLoading(false);
      setShow(true);
      setTimeout(() => {
        setShow(false), setMessage("");
      }, 4000);
    }
  };

  return (
    <>
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get notified when the App launches.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
              We'll send you an email letting you know the App is available. No
              newsletters, no spam.
            </p>
            <form
              className="mx-auto mt-10 flex max-w-md gap-x-4"
              onSubmit={handleSubmit}
            >
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-md min-w-[90px] bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {loading ? <Spinner /> : "Notify me"}
              </button>
            </form>

            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient
                  id="759c1415-0410-454c-8f7c-9a820de03641"
                  cx={0}
                  cy={0}
                  r={1}
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(512 512) rotate(90) scale(512)"
                >
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <JoinAlert
        show={show}
        setShow={setShow}
        message={message}
        success={success}
      />
    </>
  );
}
