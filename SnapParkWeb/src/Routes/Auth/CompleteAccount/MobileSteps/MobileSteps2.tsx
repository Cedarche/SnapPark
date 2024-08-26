import { useState, useEffect } from "react";
import { CheckIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Step {
  name: string;
  description: string;
  status: "current" | "complete" | "upcoming";
}

interface StepComponentProps {
  updateStepStatus: (name: string) => void;
}

interface StepComponentMap {
  [key: string]: React.ComponentType;
}

const stepComponents: StepComponentMap = {
  "Profile Information": EditProfile,
  "Add Parking Spots": ParkingSpots,
  "QR Code Stickers": QRStickers,
  "Choose Plan": Notifications,
  Complete: Preview,
  // Add more mappings as needed
};

const MobileSteps2: React.FC = () => {
  const [steps, setSteps] = useRecoilState(stepsArrayState);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showError, setShowError] = useRecoilState(showErrorToast);
  const [errorMessage, setErrorMessage] = useRecoilState(toastError);

  const goBack = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  // Effect to update activeStepIndex based on the current 'status' in steps
  useEffect(() => {
    const currentIndex = steps.findIndex((step) => step.status === "current");
    if (currentIndex !== -1) {
      setActiveStepIndex(currentIndex);
    }
  }, [steps]); // Re-run this effect when 'steps' Recoil state changes

  const currentStep = steps[activeStepIndex];
  const CurrentStepComponent = stepComponents[currentStep.name];

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden p-1">
        <li className={classNames("relative")}>
          <div className="group relative flex items-start w-full">
            <span className="ml-0 flex min-w-0 items-start flex-col w-full">
              <span className="text-md font-medium text-indigo-600">
                {currentStep.name}
              </span>
              <span className="text-xs text-gray-500 py-1">
                {currentStep.description}
              </span>
              <div className="min-w-full min-h-fit pb-0 border shadow-md bg-white rounded-lg overflow-hidden flex items-start mt-1 p-0">
                <CurrentStepComponent />
              </div>
            </span>
          </div>
        </li>
      </ol>
      <div className="px-2 mt-2 flex justify-between">
        {activeStepIndex > 0 ? (
          <button
            onClick={goBack}
            className="text-sm font-medium text-indigo-600 inline-flex"
          >
            <ArrowLeftIcon className="h-5 w-4 mr-0.5" />
            Go Back
          </button>
        ) : (
          <span></span>
        )}
        <StepsCounter steps={steps} />
      </div>
      <ErrorToast
        show={showError}
        setShow={setShowError}
        errorMessage={errorMessage}
      />
    </nav>
  );
};

export default MobileSteps2;

function StepsCounter({ steps }: any) {
  const currentStepIndex =
    steps.findIndex((step: any) => step.status === "current") + 1;

  return (
    <nav className="flex items-center justify-center" aria-label="Progress">
      <p className="text-xs font-medium">
        Step {currentStepIndex} of {steps.length}
      </p>
      <ol role="list" className="ml-8 flex items-center space-x-5">
        {steps.map((step: any) => (
          <li key={step.name}>
            {step.status === "complete" ? (
              <a className="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900">
                <span className="sr-only">{step.name}</span>
              </a>
            ) : step.status === "current" ? (
              <a
                className="relative flex items-center justify-center"
                aria-current="step"
              >
                <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                  <span className="h-full w-full rounded-full bg-indigo-200" />
                </span>
                <span
                  className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600"
                  aria-hidden="true"
                />
                <span className="sr-only">{step.name}</span>
              </a>
            ) : (
              <a className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
                <span className="sr-only">{step.name}</span>
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
