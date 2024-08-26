import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useRecoilValue } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import { addParkingSpot } from "@/Reusable/Functions/parkingSpotFunctions";
import Spinner from "@/Reusable/Spinner";

type Office = {
  id: string; // Assuming id is a string
  data: {
    office: string; // Assuming office is a string within data
  };
};

export default function AddSpotModal({ open, setOpen }: any) {
  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue<any>(userState);
  const sOffice = useRecoilValue<any>(selectedOffice);
  const [, setSelectedOffice] = useState<string>("");
  const [spotName, setSpotName] = useState<string>("");

  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (userData && sOffice) {
      // console.log(sOffice?.data.id);
      setSelectedOffice(sOffice?.data);
    }
  }, [sOffice]);

  const handleAddParkingSpot = async () => {
    setLoading(true);
    if (!sOffice || !spotName) {
      alert("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const newSpot = {
      name: spotName,
      available: true, // or any default value you need
      office: sOffice?.data.office,
      utilisation: 0, // or any default value you need
    };

    try {
      await addParkingSpot(userData.id, sOffice?.data.id, newSpot);
      console.log("Parking spot added successfully");
      setLoading(false);

      setOpen(false); // Close the modal
      // Optionally, reset form fields here
    } catch (error) {
      console.error("Failed to add parking spot:", error);
      setLoading(false);

      // Optionally, handle error (e.g., show error message to the user)
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
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
          <div
            className="flex min-h-full items-end justify-center p-4 text-center
           sm:items-center sm:p-0"
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-lg bg-white 
              text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg md:sm:max-w-md"
              >
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div
                      className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full
                     bg-green-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                      <PlusCircleIcon
                        className="h-6 w-6 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Add Parking Spot
                      </Dialog.Title>
                      <div className="mt-5 lg:mt-2 flex flex-row  min-w-full">
                        <div className="flex flex-col w-full  items-start">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Spot Name
                          </label>
                          <div className="mt-0">
                            <input
                              type="name"
                              name="name"
                              id="name"
                              maxLength={6}
                              value={spotName}
                              onChange={(e) => setSpotName(e.target.value)}
                              className="block w-full rounded-md border-1 pl-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="E.g. L1-01"
                            />
                          </div>
                        </div>
                        <div className="ml-2 flex flex-col w-full items-start">
                          <label
                            htmlFor="location"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Location
                          </label>
                          <select
                            id="location"
                            name="location"
                            value={sOffice?.data.office}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                            className="mt-0 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            defaultValue={sOffice?.data.office}
                          >
                            {userData?.offices.map((office: Office) => (
                              <option
                                key={office.id}
                                value={office.data.office}
                              >
                                {office.data.office}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3
                     py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 
                     sm:ml-2 sm:w-auto"
                    onClick={handleAddParkingSpot}
                  >
                    {loading ? <Spinner /> : "Add"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3
                     py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset
                      ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
