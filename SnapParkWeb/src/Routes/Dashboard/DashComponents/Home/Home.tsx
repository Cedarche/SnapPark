import { useState, useEffect } from "react";
import { DocumentData } from "firebase/firestore";
import { useRecoilState } from "recoil";
import {
  userState,
  selectedOffice,
  setOfficesState,
} from "@/Reusable/RecoilState";
import CompleteAuth from "@/Routes/Auth/CompleteAccount/CompleteAuth";
import Stats from "./Stats";
import ParkingSpotsTable from "./ParkingSpotsTable";
import NotifcationList from "./NotificationList";
import ActivityFeed from "./ActivityFeed";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { db } from "@/firebase"; // Assuming you have a db export from your Firebase initialization
import "./TableScrollbar.css";
import Spinner from "@/Reusable/Spinner";
import useWindowDimensions from "@/Reusable/WindowDImensions";
import { OfficeData } from "@/Reusable/Types/types";

function Home() {
  const [loading, setLoading] = useState(true);
  const [sOffice, setSelectedOffice] = useRecoilState<any>(selectedOffice);
  const [officesData, setOfficesData] =
    useRecoilState<OfficeData[]>(setOfficesState);
  const [officeData, setOfficeData] = useState<any>(null); // State to hold the office document data
  const [userData, setUserData] = useRecoilState<DocumentData | undefined>(
    userState,
  );

  const { height, width } = useWindowDimensions();

  const [localProfileComplete, setLocalProfileComplete] = useState<boolean>(
    () => {
      // Initially check local storage for profile completion status
      const profileComplete = localStorage.getItem("profileComplete");
      return profileComplete === "true"; // Convert string to boolean
    },
  );

  useEffect(() => {
    // Filter the officeData for the selected office based on sOffice.id
    const selectedOfficeData = officesData.find(
      (office) => office?.id === sOffice?.id,
    );
    setOfficeData(selectedOfficeData); // Update state with data for the selected office
    // console.log('Selected Office Data', selectedOfficeData)
  }, [officesData, sOffice?.id]);

  useEffect(() => {
    if (userData) {
      // console.log(userData.data.profileComplete);
      setLoading(false);
      const profileComplete = userData.data?.profileComplete ?? false;
      setLocalProfileComplete(profileComplete);
      localStorage.setItem("profileComplete", String(profileComplete)); // Store in local storage
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center pb-60">
        <Spinner />
      </div>
    );
  }
  if (!localProfileComplete) {
    return (
      <div>
        <CompleteAuth />
      </div>
    );
  }
  // console.log(userData?.offices[0].data.parkingSpots);
  if (!userData || !userData?.offices[0].data.parkingSpots) {
    return (
      <div className="w-full h-screen flex items-center justify-center pb-60">
        <Spinner />
      </div>
    );
  }

  const computedMaxHeight = width >= 1280 ? `${(height - 64) / 2}px` : undefined;

  return (
    <div className="h-full max-h-full w-full flex flex-col ">
      <div
        className=" flex flex-col  xl:flex-row -mt-0.5 space-y-5 xl:space-y-0 
      xl:space-x-5 "
        style={{ maxHeight: computedMaxHeight, minHeight: computedMaxHeight }}
      >
        <div
          id="TopRow"
          className=" pt-0 rounded-lg shadow overflow-auto hide-scrollbars w-full 
        lg:flex-1 max-h-[500px] lg:max-h-[420px] 2xl:max-h-[700px] bg-white ring-1 ring-gray-900/20 "
        >
          <ParkingSpotsTable
            userData={userData}
            officeData={officeData?.data}
          />
        </div>
        <div className="ring-1 ring-gray-900/20 pt-2  rounded-lg shadow w-full xl:max-h-[420px] 2xl:max-h-[700px] xl:w-2/5 bg-white overflow-hidden">
          <Stats officeData={officeData?.data} usage={userData?.usage} />
        </div>
      </div>
      <div
        id="BottomRow"
        className="flex flex-1 flex-col xl:flex-row mt-5 space-y-5 xl:space-y-0 xl:space-x-5 pb-5 xl:pb-0 xl:min-h-[415px] 2xl:min-h-[515px]"
        style={{ maxHeight: computedMaxHeight }}
      >
        <div
          className="ring-1 ring-gray-900/20 pt-0 rounded-lg shadow overflow-auto hide-scrollbars w-full 
        xl:flex-1  bg-white "
        >
          <NotifcationList userData={userData} officeData={officeData?.data} />
        </div>
        <div className="ring-1 ring-gray-900/20 pt-5 rounded-lg shadow min-w-[320px]  bg-white overflow-auto hide-scrollbars">
          <ActivityFeed officeData={officeData?.data} />
        </div>
      </div>
    </div>
  );
}

export default Home;
