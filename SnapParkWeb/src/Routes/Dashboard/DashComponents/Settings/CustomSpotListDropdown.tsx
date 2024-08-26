/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import "../Home/TableScrollbar.css"

const people = [
  { id: 1, name: "Leslie Alexander" },
  // More users...
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function CustomSpotListDropdown({
  spots,
  customSpotsArray,
  setCustomSpotsArray,
}: any) {
  const [query, setQuery] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  const filteredPeople =
    query === ""
      ? spots
      : spots.filter((spot: any) => {
          return spot.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleAddSpot = () => {
    if(customSpotsArray.includes(selectedSpot)){
      console.log('Aleady there!')
      return
    }
    if(selectedSpot){
      setCustomSpotsArray([...customSpotsArray, selectedSpot.name]);
    }
  };

  if(!filteredPeople){
    return null
  }

  return (
    <Combobox as="div" value={selectedSpot} onChange={setSelectedSpot} >
      {/* <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Combobox.Label> */}
      <div className="inline-flex items-center hide-scrollbars">
        <div className="relative  z-10">
          <Combobox.Input
            className="w-full rounded-md border-0 max-w-[140px] bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm 
          ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 
          sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(spot: any) => spot?.name}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>

          {filteredPeople.length > 0 && (
            <Combobox.Options className="absolute max-h-[160px] hide-scrollbars z-10 mt-1 w-full overflow-auto 
            rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 
            focus:outline-none sm:text-sm">
              {filteredPeople.map((spot: any) => (
                <Combobox.Option
                  key={spot.name}
                  value={spot}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-8 pr-4",
                      active ? "bg-indigo-600 text-white" : "text-gray-900",
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span
                        className={classNames(
                          "block truncate",
                          selected && "font-semibold",
                        )}
                      >
                        {spot.name}
                      </span>

                      {selected && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 left-0 flex items-center pl-1.5",
                            active ? "text-white" : "text-indigo-600",
                          )}
                        >
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
        <div onClick={handleAddSpot}>
          <PlusCircleIcon
            className="ml-1 h-6 w-6 text-indigo-500  rounded-full cursor-pointer"
            aria-hidden="true"
          />
        </div>
      </div>
    </Combobox>
  );
}
