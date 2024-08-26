import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spot } from "@/Reusable/Types/types";
import { DocumentData } from "firebase/firestore";
import { LinkIcon, QrCodeIcon } from "@heroicons/react/20/solid";
import Spinner from "@/Reusable/Spinner";
import AddSpotModal from "../Home/AddSpotModal";
import { useParkingSpotActions } from "@/Reusable/Hooks/useParkingSpotActions";

// ============================================================
// TO DO
// - Change GeneratePDF so that Instructions & All Spots stickers can be toggled  
// - Add modal to customize stickers
// - Add option for user to purchase professionally made stickers?


function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}



export default function SpotTable({ userData, officeData }: any) {
  const checkbox = useRef<HTMLInputElement | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedSpots, setSelectedSpots] = useState<Spot[]>([]); 
  const [parkingSpots, setSpots] = useState<Spot[]>([]); 
  const [open, setOpen] = useState(false);

  const {
    handleToggle,
    handleLink,
    handlePDFGeneration,
    handleDelete,
    handleChangeName,
    selectedRow,
    setSelectedRow,
  } = useParkingSpotActions(userData, officeData, parkingSpots);

  useEffect(() => {
    setLoading(!userData || !officeData);
    console.log(userData.id, officeData);
    if (userData && officeData) {
      setSpots(officeData.parkingSpots);
    }
  }, [userData, officeData]);

  useEffect(() => {
    console.log("Selected Spots: ", selectedSpots);
  }, [selectedSpots]);

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedSpots.length > 0 && selectedSpots.length < parkingSpots.length;
    setChecked(selectedSpots.length === parkingSpots.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedSpots, parkingSpots?.length]);

  if (loading) {
    return (
      <div className="w-full h-[500px] border flex items-center justify-center ">
        <Spinner />
      </div>
    );
  }

  function toggleAll() {
    setSelectedSpots(checked || indeterminate ? [] : parkingSpots);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  const spotsToGenerate =
    selectedSpots.length > 0 ? selectedSpots : parkingSpots;

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <AddSpotModal open={open} setOpen={setOpen} />

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Parking Spots
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Pick which parking spots you would like to generate stickers for.{" "}
          </p>
        </div>
        <div className="inline-flex gap-x- 2mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => handlePDFGeneration(spotsToGenerate)}
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
            className="block rounded-md bg-indigo-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Parking Spot
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedSpots.length > 0 && (
                <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                  {/* <button
                    type="button"
                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                  >
                    Bulk edit
                  </button> */}
                  <button
                    type="button"
                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                  >
                    Delete all
                  </button>
                </div>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Office
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Utilisation
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Link
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {parkingSpots.map((spot: Spot) => (
                    <tr
                      key={spot.name}
                      className={
                        selectedSpots.includes(spot) ? "bg-gray-50" : undefined
                      }
                    >
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedSpots.includes(spot) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          value={spot.name}
                          checked={selectedSpots.includes(spot)}
                          onChange={(e) =>
                            setSelectedSpots(
                              e.target.checked
                                ? [...selectedSpots, spot]
                                : selectedSpots.filter((p) => p !== spot),
                            )
                          }
                        />
                      </td>
                      <td
                        className={classNames(
                          "whitespace-nowrap py-4 pr-3 text-sm font-medium",
                          selectedSpots.includes(spot)
                            ? "text-indigo-600"
                            : "text-gray-900",
                        )}
                      >
                        {spot.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {spot.office}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {spot.utilisation}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <LinkIcon
                          className="-ml-0.5 h-5 w-5  hover:text-indigo-500 cursor-pointer"
                          aria-hidden="true"
                          onClick={() => handleLink(spot.name)}
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit<span className="sr-only">, {spot.name}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
