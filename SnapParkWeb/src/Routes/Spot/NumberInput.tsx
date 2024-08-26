import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

import Spinner from "@/Reusable/Spinner";
import { addToNotificationList } from "@/Reusable/Functions/notificationFunctions";

export default function Popup({ open, setOpen, companyID, officeName }: any) {
  const [userName, setUserName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    setLoading(true);
    if (userName && mobile && companyID && officeName) {
      console.log(userName, mobile, companyID, officeName);
      const newEmployee = {
        name: userName,
        mobile: mobile,
        office: officeName,
        notifications: true,
      };

      await addToNotificationList(companyID, officeName, newEmployee);
      console.log("Success");
      localStorage.setItem("notifications", "true");
      localStorage.setItem("name", userName);
      const sMobile = String(mobile);
      localStorage.setItem("mobile", sMobile);

      setLoading(false);
      setOpen(false);

      try {
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-0 pb-0 pt-0 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="p-4 sm:min-w-80" style={{ minWidth: "350px" }}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <BellAlertIcon
                        className="h-6 w-6 mt-0.5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0">
                      <p className="text-md font-bold text-gray-900">
                        Join the notification list
                      </p>
                      <p className="mt-1 text-xs text-gray-500"></p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="isolate -space-y-px rounded-md shadow-sm  mt-3 w-full">
                    <div className="relative rounded-md rounded-b-none px-3 pb-1.5 pt-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div className="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label
                        htmlFor="job-title"
                        className="block text-xs font-medium text-gray-900"
                      >
                        Phone Number
                      </label>
                      <input
                        type="number"
                        name="mobile"
                        id="mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="+61 0400 222 222"
                      />
                    </div>
                    <div
                      className="px-3 py-3 sm:p-5 flex flex-row justify-center items-center bg-gray-100 
                  rounded-b-lg ring-gray-900/5 ring-inset"
                    >
                      <button
                        type="button"
                        onClick={handleAddUser}
                        disabled={mobile === ""}
                        className="rounded-xl w-full bg-blue-600 px-6 py-3 text-center text-sm font-semibold
                   text-white shadow-md hover:bg-indigo-500 focus-visible:outline 
                   focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-indigo-600"
                      >
                        {loading ? (
                          <div className="w-full flex justify-center">
                            <Spinner />
                          </div>
                        ) : (
                          "Join list"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
