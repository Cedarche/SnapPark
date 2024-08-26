import { Fragment, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import SpotTable from "./SpotTable";
import { useRecoilState } from "recoil";
import { DocumentData } from "firebase/firestore";
import { userState, selectedOffice } from "@/Reusable/RecoilState";


export default function QRCodeStickers() {
  const [sOffice, setSelectedOffice] = useRecoilState<any>(selectedOffice);
  const [userData, setUserData] = useRecoilState<DocumentData | undefined>(
    userState,
  );

  useEffect(() => {
    console.log("QR Data: ", sOffice.data);
  }, [sOffice]);

  if (!sOffice?.data?.parkingSpots) {
    return <div></div>;
  }

  return (
    <>
      <div className="min-h-full">
        <div className="py-6">
          <header>
            <div className="mx-auto max-w-6xl px-4 sm:px-0 lg:px-0">
              <h1 className="text-3xl font-bold leading-tight tracking-tight mb-5 text-gray-900">
                Generate New QR Codes
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-6xl sm:px-0 lg:px-8 py-8 bg-white rounded-xl">
              <SpotTable
                userData={userData}
    
                officeData={sOffice?.data}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
