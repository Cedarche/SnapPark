import { useState, useEffect, createElement } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useRecoilState } from "recoil";
import {
  stepsArrayState,
  toastError,
  showErrorToast,
} from "@/Reusable/RecoilState";

import EditProfile from "./ProfileInfo";
import ParkingSpots from "./ParkingSpots";
import QRStickers from "./QRStickers";
import Notifications from "./Notifcations";
import Preview from "./Preview";
import ErrorToast from "./ErrorToast";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface StepComponentMap {
  [key: string]: () => JSX.Element;
}

type StepName =
  | "Profile Information"
  | "Add Parking Spots"
  | "QR Code Stickers"
  | "Choose Plan"
  | "Complete";

export default function WebSteps() {
  const [isShowing, setIsShowing] = useState(false);
  const [steps, setSteps] = useRecoilState(stepsArrayState);
  const [errorMessage, setErrorMessage] = useRecoilState(toastError);
  const [showError, setShowError] = useRecoilState(showErrorToast);

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

  const stepComponents: Record<
    StepName,
    (props: { updateStepStatus: (name: string) => void }) => JSX.Element
  > = {
    "Profile Information": EditProfile,
    "Add Parking Spots": ParkingSpots,
    "QR Code Stickers": QRStickers,
    "Choose Plan": Notifications,
    Complete: Preview,
    // Add more mappings as needed
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-10" : "",
              "relative",
            )}
          >
            {step.status === "complete" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-2 top-2 lg:left-3 lg:top-3 -ml-px mt-0.5 h-full w-0.5 bg-indigo-600"
                    aria-hidden="true"
                  />
                ) : null}
                <div
                  onClick={() => updateStepStatus(step.name)}
                  className="group relative flex items-start "
                >
                  <span className="flex h-9 items-center cursor-pointer">
                    <span className="relative z-10 flex h-4 w-4 lg:h-6 lg:w-6 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                      <CheckIcon
                        className="h-3 w-3 lg:h-4 lg:w-4 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-2.5 lg:ml-4 flex min-w-0 items-start flex-col cursor-pointer">
                    <span className="text-sm font-medium  ">{step.name}</span>
                    <span className="text-xs text-gray-500 flex items-start">
                      {step.description}
                    </span>
                  </span>
                </div>
              </>
            ) : step.status === "current" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-2 top-2 lg:left-3 lg:top-3 -ml-px mt-0.5 h-full w-px bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="group relative flex items-start w-full">
                  <span className="flex h-9 items-center cursor-pointer " aria-hidden="true">
                    <span className="relative z-10 flex h-4 w-4 lg:h-6 lg:w-6 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                      <span className="h-2.5 w-2.5 lg:h-4 lg:w-4 rounded-full bg-indigo-600" />
                    </span>
                  </span>
                  <span className="ml-2.5 lg:ml-5 flex items-start flex-col w-full ">
                    <span className="text-sm font-medium text-indigo-600 cursor-pointer">
                      {step.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {step.description}
                    </span>
                    <div className="min-w-full min-h-fit pb-0 border shadow-md bg-gray-50 rounded-lg overflow-hidden flex items-start mt-1 p-0">
                      {createElement(
                        stepComponents[step.name as StepName] ||
                          (() => <div>No content</div>),
                      )}
                    </div>
                  </span>
                </div>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-2 top-2 lg:left-3 lg:top-3 -ml-px mt-0.5 h-full w-px bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <button
                  // onClick={() => updateStepStatus(step.name)}
                  className="group relative flex items-start w-full"
                >
                  <span className="flex h-9 items-center cursor-pointer" aria-hidden="true">
                    <span className="relative z-5 flex h-4 w-4 lg:h-6 lg:w-6 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                      <span className="h-2.5 w-2.5 lg:h-4 lg:w-4 rounded-full bg-transparent group-hover:bg-gray-300" />
                    </span>
                  </span>
                  <span className="ml-2.5 lg:ml-4 flex min-w-0 items-start flex-col cursor-pointer">
                    <span className="text-sm font-medium text-gray-500">
                      {step.name}
                    </span>
                    <span className="text-xs text-gray-500 flex items-start">
                      {step.description}
                    </span>
                  </span>
                </button>
              </>
            )}
          </li>
        ))}
      </ol>
      <ErrorToast
        show={showError}
        setShow={setShowError}
        errorMessage={errorMessage}
      />
    </nav>
  );
}
