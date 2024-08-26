import { useState, useEffect } from "react";
import AddUserModal from "./AddUserModal";

import {
  toggleEmployeeNotification,
  removeFromNotificationList,
} from "@/Reusable/Functions/notificationFunctions";
import {
  CheckCircleIcon,
  PlusCircleIcon,
  QrCodeIcon,
  TrashIcon,
  XMarkIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import AppLinkingModal from "./AppLinkingModal";

interface Person {
  name: string;
  mobile: string;
  office: string;
  notifications: string; // Or boolean, if that's what you're using
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function NotificationList({ userData, officeData }: any) {
  const [people, setEmployees] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [openLinkingModal, setOpenLinkingModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  useEffect(() => {
    if (userData && officeData) {
      // console.log("Notification Data", officeData.notificationList);
      // console.log(officeData?.linkingCode);
      // console.log(userData.data.plan);

      setEmployees(officeData.notificationList);
    }
  }, [officeData, userData]);

  const handleToggle = async (employeeMobile: string) => {
    try {
      await toggleEmployeeNotification(
        userData.id,
        officeData.id,
        employeeMobile,
      );
    } catch (e) {
      console.log("Error:", e);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <AddUserModal open={open} setOpen={setOpen} />
      <AppLinkingModal open={openLinkingModal} setOpen={setOpenLinkingModal} officeData={officeData} />
      <div className="sm:flex sm:items-center mt-5">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold tracking-normal text-grey">
            Notification List
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the employees registered to receive notifications.
          </p>
        </div>
        <div className="inline-flex gap-x-1 mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
      
            <button
              onClick={() => setOpenLinkingModal(true)}
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 cursor-pointer"
            >
              <LinkIcon className="w-4 h-4 mr-1.5"/>
              {/* App Linking Code: {officeData?.linkingCode} */}
              Invite Employees
            </button>
      

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
           Add Employee
          </button>
        </div>
      </div>
      <div className="mt-3 flow-root">
        {people?.length === 0 ? (
          <Empty />
        ) : (
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8 lg:min-h-80">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                    >
                      Mobile
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Office
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                    >
                      Notifications
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people?.map((person, personIdx) => (
                    <tr
                      key={person.mobile}
                      className={classNames(
                        person.mobile === selectedRow ? "bg-blue-50" : "",
                        "hover:bg-gray-50", // This line adds a gray background to the selected row
                        // This is an optional addition to highlight rows on hover
                      )}
                    >
                      <td
                        className={classNames(
                          personIdx !== people.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                        )}
                      >
                        {person.name}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== people.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell",
                        )}
                      >
                        {person.mobile}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== people.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell",
                        )}
                      >
                        {officeData.office}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== people.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer",
                        )}
                        onClick={() => handleToggle(person.mobile)}
                      >
                        {person.notifications ? (
                          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            <svg
                              className="h-1.5 w-1.5 fill-green-500"
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                            >
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            <svg
                              className="h-1.5 w-1.5 fill-red-500"
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                            >
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            Not Active
                          </span>
                        )}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== people.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8",
                        )}
                      >
                        {person.mobile === selectedRow ? (
                          <div className=" flex items-center justify-end">
                            <a
                              onClick={(e) => {
                                e.preventDefault(); // Prevent default anchor link behavior
                                removeFromNotificationList(
                                  userData.id,
                                  officeData.id,
                                  { name: person.name, mobile: person.mobile },
                                );
                                setSelectedRow("");
                              }}
                              className="text-indigo-600 hover:text-indigo-300 cursor-pointer"
                            >
                              <TrashIcon
                                className="-ml-0.5 h-5 w-5 mr-2 hover:text-red-500 cursor-pointer"
                                aria-hidden="true"
                              />

                              <span className="sr-only">, {person.name}</span>
                            </a>
                            <a
                              onClick={(e) => {
                                e.preventDefault(); // Prevent default anchor link behavior
                                setSelectedRow(null); // Set the selected row based on the spot name
                              }}
                              className="text-gray-600 hover:text-indigo-300 cursor-pointer"
                            >
                              <XMarkIcon
                                className="-ml-0.5 h-5 w-5  hover:text-gray-500 cursor-pointer"
                                aria-hidden="true"
                              />

                              <span className="sr-only">, {person.name}</span>
                            </a>
                          </div>
                        ) : (
                          <a
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default anchor link behavior
                              setSelectedRow(person.mobile); // Set the selected row based on the spot name
                            }}
                            className="text-indigo-600 hover:text-indigo-300 cursor-pointer"
                          >
                            Edit<span className="sr-only">, {person.name}</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <button
      type="button"
      className="relative flex items-center justify-center flex-col w-full min-h-72 mb-5 rounded-lg border-2 border-dashed
       border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2
        focus:ring-indigo-500 
      focus:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>

      <span className="mt-2 block text-sm font-semibold text-gray-900">
        Add your first employees to the notification list
      </span>
      <span className="mt-2 block text-xs font-semibold text-gray-500">
        Alternatively they can choose to sign up to recieve notifications when
        they scan their first QR code.
      </span>
    </button>
  );
}
