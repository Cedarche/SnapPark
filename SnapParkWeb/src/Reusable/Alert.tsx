import React from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";

export default function Alert({ messageArray }: { messageArray: string[] }) {
  return (
    <div
      className=" ease-in-out duration-300 rounded-md bg-red-50 p-4 mt-2 "
      style={{ minWidth: "320px", maxWidth: "320px" }}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex items-center">
          {/* <h3 className="text-sm font-medium text-red-800">There were {messageArray.length} errors with your submission</h3> */}
          <div className=" text-xs text-red-700">
            <ul role="list" className="list space-y-1 ">
              {messageArray.map((message: string, index: number) => (
                <li key={index}>{message}</li> // Using index as a key
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
