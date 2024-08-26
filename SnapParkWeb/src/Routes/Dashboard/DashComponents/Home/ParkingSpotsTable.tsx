import { useEffect, useState } from "react";
import AddSpotModal from "./AddSpotModal";
import { Transition } from "@headlessui/react";
import {
  PlusCircleIcon,
  QrCodeIcon,
  TrashIcon,
  XMarkIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import {
  DocumentCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Spinner from "@/Reusable/Spinner";
import { Link } from "react-router-dom";
import { useParkingSpotActions } from "@/Reusable/Hooks/useParkingSpotActions";

interface spot {
  name: string;
  office: string;
  utilisation: string;
  available: boolean;
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function ParkingSpotsTable({ userData, officeData }: any) {
  const [spots, setSpots] = useState<spot[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData && officeData) {
      setSpots(officeData.parkingSpots);
    }
  }, [officeData, userData]);

  const {
    handleToggle,
    handleLink,
    handlePDFGeneration,
    handleDelete,
    handleChangeName,

    selectedRow,
    setSelectedRow,
  } = useParkingSpotActions(userData, officeData, spots);

  if (!officeData) {
    return;
  }

  return (
    <div className="px-4 sm:px-6 lg2:px-8">
      <AddSpotModal open={open} setOpen={setOpen} />

      <div className="sm:flex sm:items-center mt-5">
        <div className="sm:flex-auto">
          <div className="inline-flex items-center">
            <h1 className="text-2xl font-semibold tracking-normal text-grey">
              Parking Spots
            </h1>
            <div
              className="ml-2 relative  "
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
            >
              <InformationCircleIcon className="h-5 w-5 mt-1 text-gray-400 cursor-pointer" />
              <Transition
                show={isTooltipVisible}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute z-50 top-8 sm:top-5 -left-28 sm:left-5 w-64 max-h-24 p-2 bg-gray-100 text-gray-600 text-sm font-light rounded-lg shadow-md">
                  If you have parking spots in multiple locations for the same
                  office, you can add the separate spots to a custom list in{" "}
                  <Link
                    to="/dashboard/settings/officeSettings"
                    className="text-blue-500 cursor-pointer"
                  >
                    Office Settings
                  </Link>
                  .
                </div>
              </Transition>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the registered parking spots in your{" "}
            {officeData.office} office.{" "}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 flex flex-row">
          <button
            type="button"
            onClick={() => handlePDFGeneration(spots)}
            className="inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 
            shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mr-1"
          >
            {loading ? (
              <Spinner />
            ) : (
              <QrCodeIcon
                className="-ml-0.5 h-5 min-w-5 text-indigo-500 hover:text-indigo-500 cursor-pointer"
                aria-hidden="true"
              />
            )}
            {loading ? "Generating..." : "QR Code Stickers"}
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm
             hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusCircleIcon
              className="-ml-0.5 h-5 w-5 text-white cursor-pointer"
              aria-hidden="true"
            />
            Add
          </button>
        </div>
      </div>
      <div className="mt-3 flow-root">
        {spots?.length === 0 || !spots ? (
          <Empty setOpen={setOpen} />
        ) : (
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
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
                      Office
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Utilisation
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                    >
                      Link
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
                  {spots.map((spot, personIdx) => (
                    <tr
                      key={spot.name}
                      className={classNames(
                        spot.name === selectedRow ? "bg-blue-50" : "",
                        "hover:bg-gray-50", // This line adds a gray background to the selected row
                        // This is an optional addition to highlight rows on hover
                      )}
                    >
                      <td
                        className={classNames(
                          personIdx !== spots.length - 1
                            ? "border-b border-gray-200"
                            : "",

                          "whitespace-nowrap py-4 pl-4 pr-0 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8",
                        )}
                      >
                        {spot.name === selectedRow ? (
                          <input
                            className="border-indigo-300 rounded-lg text-sm mr-0 p-2 bg-inherit w-24 -ml-2 -my-2"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            // onBlur={() => handleChangeName(spot.name, newName)}
                          />
                        ) : (
                          spot.name
                        )}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== spots.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell",
                        )}
                      >
                        {spot.office}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== spots.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell",
                        )}
                      >
                        {Number(spot.utilisation) > 100
                          ? 100
                          : Number(spot.utilisation).toFixed(1)}
                        %
                      </td>
                      <td
                        className={classNames(
                          personIdx !== spots.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap px-3 py-4 text-sm text-gray-500",
                        )}
                        onClick={() => handleToggle(spot.name)}
                      >
                        {spot.available ? (
                          <span
                            className="inline-flex items-center gap-x-1.5 rounded-md
                           bg-green-100 px-2 py-1 text-xs font-medium text-green-700 cursor-pointer"
                          >
                            <svg
                              className="h-1.5 w-1.5 fill-green-500"
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                            >
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            Free
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100
                           px-2 py-1 text-xs font-medium text-red-700 cursor-pointer"
                          >
                            <svg
                              className="h-1.5 w-1.5 fill-red-500"
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                            >
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            Taken
                          </span>
                        )}
                      </td>
                      <td
                        className={classNames(
                          personIdx !== spots.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "whitespace-nowrap  px-3 py-4 text-sm text-gray-500 lg:table-cell",
                        )}
                      >
                        <LinkIcon
                          className="-ml-0.5 h-5 w-5  hover:text-indigo-500 cursor-pointer"
                          aria-hidden="true"
                          onClick={() => handleLink(spot.name)}
                        />
                      </td>
                      <td
                        className={classNames(
                          personIdx !== spots.length - 1
                            ? "border-b border-gray-200"
                            : "",
                          "relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8",
                        )}
                      >
                        {spot.name === selectedRow ? (
                          <div className=" flex items-center justify-end">
                            <div
                              onClick={() =>
                                handleChangeName(spot.name, newName)
                              }
                              className="text-indigo-600 hover:text-indigo-300 cursor-pointer"
                            >
                              <DocumentCheckIcon
                                className="-ml-0.5 h-5 w-5 mr-2 hover:text-green-500 cursor-pointer"
                                aria-hidden="true"
                              />

                              <span className="sr-only">Save</span>
                            </div>

                            <div
                              onClick={() => handleDelete(spot.name)}
                              className="text-indigo-600 hover:text-indigo-300 cursor-pointer"
                            >
                              <TrashIcon
                                className="-ml-0.5 h-5 w-5 mr-2 hover:text-red-500 cursor-pointer"
                                aria-hidden="true"
                              />

                              <span className="sr-only">Delete</span>
                            </div>
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

                              <span className="sr-only">Stop Editing</span>
                            </a>
                          </div>
                        ) : (
                          <a
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default anchor link behavior
                              setSelectedRow(spot.name); // Set the selected row based on the spot name
                            }}
                            className="text-indigo-600 hover:text-indigo-300 cursor-pointer"
                          >
                            Edit<span className="sr-only">, {spot.name}</span>
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

function Empty({ setOpen }: any) {
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex items-center justify-center flex-col w-full  min-h-72 mb-5 rounded-lg border-2 border-dashed border-gray-300 p-12 
      text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 
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
          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
        />
      </svg>

      <span className="mt-2 block text-sm font-semibold text-gray-900">
        Add this Office's carparks to get started!
      </span>
      {/* <span className="mt-2 block text-xs font-semibold text-gray-500">
        If
      </span> */}
    </button>
  );
}
