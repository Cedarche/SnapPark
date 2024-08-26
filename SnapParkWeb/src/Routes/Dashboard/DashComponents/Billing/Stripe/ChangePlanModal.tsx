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
import PlanOptions from "./PlanOptions";
import PreviewChange from "./ConfirmPlanChange";

type Office = {
  id: string; // Assuming id is a string
  data: {
    office: string; // Assuming office is a string within data
  };
};

export default function ChangePlanModal({ open, setOpen }: any) {
  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue<any>(userState);
  const sOffice = useRecoilValue<any>(selectedOffice);

  const [newPlanData, setNewPlanData] = useState();
  const [confirm, setConfirm] = useState(false);

  const cancelButtonRef = useRef(null);

  const handleCloseModal = () => {
    setOpen(false);
    setTimeout(() => {
      setConfirm(false);
      setNewPlanData(null);
    }, 500);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={handleCloseModal}
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
              text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg md:sm:max-w-2xl"
              >
                {confirm ? (
                  <PreviewChange newPlanData={newPlanData} setConfirm={setConfirm} handleCloseModal={handleCloseModal}/>
                ) : (
                  <PlanOptions
                    closeModal={handleCloseModal}
                    setNewPlanData={setNewPlanData}
                    setConfirm={setConfirm}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
