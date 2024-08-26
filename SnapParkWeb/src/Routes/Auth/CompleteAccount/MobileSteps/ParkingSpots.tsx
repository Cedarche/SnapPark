import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useRecoilState } from "recoil";
import {
  stepsArrayState,
  userState,
  EditProfilState,
} from "@/Reusable/RecoilState";
import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import Spinner from "@/Reusable/Spinner";

interface Spot {
  name: string;
  available: boolean;
  office: string;
  utilisation: number;
  createdAt: any;
  totalUsedDays: number;
  totalUnusedDays: number;
  lastToggledDate: string;
  placeholder: string;
}

const initialSpots: Spot[] = [
  {
    name: "",
    placeholder: "E.g. L1-32",
    available: true,
    office: "",
    utilisation: 0,
    createdAt: Date.now(), // Add the current timestamp to each spot
    totalUsedDays: 0,
    totalUnusedDays: 0,
    lastToggledDate: "",
  },
  {
    name: "",
    placeholder: "E.g. L1-33",
    available: true,
    office: "",
    utilisation: 0,
    createdAt: Date.now(), // Add the current timestamp to each spot
    totalUsedDays: 0,
    totalUnusedDays: 0,
    lastToggledDate: "",
  },
  {
    name: "",
    placeholder: "E.g. L1-34",
    available: true,
    office: "",
    utilisation: 0,
    createdAt: Date.now(), // Add the current timestamp to each spot
    totalUsedDays: 0,
    totalUnusedDays: 0,
    lastToggledDate: "",
  },
];

const ParkingSpots = () => {
  const [steps, setSteps] = useRecoilState(stepsArrayState);
  const [spotsArray, setSpotsArray] = useState<Spot[]>([]);
  const [offices, setOffices] = useState<string[]>([]);
  const [selectedOffice, setSelectedOffice] = useState();
  const [loading, setLoading] = useState(false);
  const [savedProfile, setSavedProfile] = useRecoilState(EditProfilState);
  const [isDuplicate, setIsDuplicate] = useState<number | null>(null);

  const user = auth.currentUser;

  // useEffect(() => {
  //   console.log(savedProfile);
  // }, [savedProfile]);

  useEffect(() => {
    const existingOffices = savedProfile?.offices ?? [];
    setOffices(existingOffices);

    // Use the spotsArray from savedProfile as the initial value
    const initialSpotsFromProfile = savedProfile?.spotsArray ?? initialSpots;

    if (existingOffices.length > 0) {
      const firstOfficeName = existingOffices[0]; // Get the name of the first office

      // Update the office property of each spot with the first office's name
      const updatedSpots = initialSpotsFromProfile.map((spot) => ({
        ...spot,
        office: firstOfficeName,
      }));

      setSpotsArray(updatedSpots);
    } else {
      // If there are no offices available, use the initial spots from the profile
      setSpotsArray(initialSpotsFromProfile);
    }
  }, [savedProfile]);

  // const handleOfficeChange = (e: any) => {
  //   const selectedOffice = e.target.value;
  //   const updatedSpots = spotsArray.map((spot) => ({
  //     ...spot,
  //     office: selectedOffice,
  //   }));
  //   setSelectedOffice(selectedOffice);
  //   setSpotsArray(updatedSpots);
  // };

  const handleSpotNameChange = (index: number, newName: string) => {
    const isNameDuplicate = spotsArray.some(
      (spot, idx) => spot.name === newName && idx !== index,
    );

    // Here, we use the ternary operator to directly set the index or null based on duplication check
    setIsDuplicate(isNameDuplicate ? index : null);

    if (!isNameDuplicate) {
      const updatedSpots = [...spotsArray];
      updatedSpots[index].name = newName;
      setSpotsArray(updatedSpots);
    }
  };

  const addParkingSpot = () => {
    const newSpot: Spot = {
      name: "",
      available: true,
      office: offices[0] || "Default Office",
      utilisation: 0,
      createdAt: Date.now(), // Add the current timestamp to each spot
      totalUsedDays: 0,
      totalUnusedDays: 0,
      lastToggledDate: "",
      placeholder: ''
    };
    setSpotsArray([...spotsArray, newSpot]);
  };

  const removeParkingSpot = (spotIndex: number) => {
    setSpotsArray(spotsArray.filter((_, index) => index !== spotIndex));
  };

  const updateStepStatus = (clickedStepName: any) => {
    const updatedSteps = steps.map((step) => {
      if (step.name === clickedStepName) {
        return { ...step, status: "current" };
      } else {
        if (step.status === "current") {
          return { ...step, status: "complete" };
        }
        return step;
      }
    });

    setSteps(updatedSteps);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    // Map over the spotsArray to keep the parking spot objects as they are

    const officeToUse = selectedOffice || offices[0]; // Use the selected office or default to the first one

    try {
      // Call updateParkingSpots with the userId, selected office, and the array of parking spots
      if (user && officeToUse && spotsArray) {
        // await updateParkingSpots(user?.uid, officeToUse, updatedParkingSpots);
        setSavedProfile({ ...savedProfile, spotsArray: spotsArray });
        console.log(
          "Parking spots updated successfully for office:",
          officeToUse,
        );
      }
    } catch (error) {
      console.error("Error updating parking spots: ", error);
    } finally {
      setLoading(false);
      updateStepStatus("QR Code Stickers");
    }
  };

  useEffect(() => {
    console.log(savedProfile);
  }, [savedProfile]);

  return (
    <form
      className="px-0  sm:px-6 lg:px-0 w-full pb-2.5 bg-white"
      onSubmit={handleSubmit}
    >
      <div className="p-2 pt-4 inline-flex items-center gap-x-2">
        <label
          htmlFor="location"
          className="block text-sm ml-0.5 font-medium leading-6 text-gray-900"
        >
          Office:
        </label>
        <div className="mt-0 w-full inline-flex rounded-md border-0 bg-slate-50 py-1.5 pl-3 pr-3 text-sm text-gray-600 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
          <BuildingOfficeIcon className="w-4 mr-2" />
          {offices[0]}
        </div>
 
      </div>

      <div className=" mt-0 sm:-mx-0 min-w-full lg:px-0 ">
        <table className="min-w-full divide-y divide-gray-300 border-t-2 mt-2 ">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-2.5 pl-2 pr-4  text-left text-sm font-semibold text-gray-900 sm:pl-0 lg:pl-3"
              >
                Park No.
              </th>

              <th
                scope="col"
                className="px-2 py-2.5 text-left text-sm font-semibold text-gray-900"
              >
                Office
              </th>
              <th
                scope="col"
                className="px-0 py-2.5 pl-0 text-left text-sm font-semibold text-gray-900"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white  rounded-2xl">
            {spotsArray.map((spot, index) => (
              <tr key={index}>
                <td
                  className="whitespace-nowrap py-3 pl-2 pr-0 flex items-start text-sm font-medium
                 text-gray-900 sm:pl-0 lg:pl-3"
                >
                  <input
                    type="text"
                    name={spot.name}
                    id={spot.name}
                    value={spot.name}
                    placeholder={
                      spot.placeholder ? spot.placeholder : "Spot Name"
                    }
                    maxLength={6}
                    onChange={(e) =>
                      handleSpotNameChange(index, e.target.value)
                    } // Add onChange handler here
                    className={`border p-1 text-sm rounded-sm w-24 px-1.5 ${index === isDuplicate ? "border-red-500" : ""}`}
                    required
                  />
                </td>
                <td className="whitespace-nowrap py-3  pl-2 text-left text-sm font-medium sm:pr-0">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                    {spot.office}
                  </span>
                </td>

                <td className="whitespace-nowrap px-0 py-3 text-sm text-gray-500 ">
                  {spot.available && (
                    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                      <svg
                        className="h-1.5 w-1.5 fill-green-500"
                        viewBox="0 0 6 6"
                        aria-hidden="true"
                      >
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      Available
                    </span>
                  )}
                </td>
                <td>
                  <svg
                    onClick={() => removeParkingSpot(index)}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3 h-3 cursor-pointer"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pt-2.5 w-full  flex  justify-end pr-2 border-t ">
          <button
            type="button"
            onClick={addParkingSpot}
            disabled={loading}
            className="flex items-center flex-row mr-1 rounded-md bg-blue-500 px-2 py-1.5 text-center text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add parking spot
            <PlusCircleIcon
              className="ml-2 h-5 w-5 text-white-400"
              aria-hidden="true"
            />
          </button>
          <button
            type="submit"
            disabled={loading || isDuplicate !== null} // Disable if loading or a duplicate exists
            // onClick={() => updateStepStatus("QR Code Stickers")}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {loading ? <Spinner /> : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ParkingSpots;
