import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function AddNumber({ show, setShow, open, setOpen }: any) {
  const [seeingAgain, setSeeingAgain] = useState(false);

  const handleOpenNumberPopup = () => {
    setSeeingAgain(false)
    setOpen(true);
    setShow(false);
  };

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg 
            ring-1 ring-black ring-opacity-5"
            >
              <div className="p-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BellAlertIcon
                      className="h-6 w-6 text-green-400 mt-1.5"
                      aria-hidden="true"
                    />
                  </div>
                  {seeingAgain ? (
                    <div className="flex flex-col w-full">
                      <p className="ml-3 mt-1 text-sm text-gray-500">
                      
                        If you've recently cleared your browsing history you'll need to re-add your name and number. 
                      </p>
                      <p className="ml-3 mt-1 text-sm text-indigo-500" onClick={handleOpenNumberPopup}>
                         Click here to continue
                        </p>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full">
                      <div
                        className="ml-3  flex-1 pt-0.5 w-full"
                        onClick={handleOpenNumberPopup}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          Join the notification list?
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {" "}
                          Add your name and number to enable text notifications
                          when your office parking spots are full.
                        </p>
                      </div>
                      <p
                        className=" ml-3 mt-2 text-xs text-indigo-500"
                        onClick={() => setSeeingAgain(true)}
                      >
                        Seeing this again? Click here.
                      </p>
                    </div>
                  )}

                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5 ,t-1.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
