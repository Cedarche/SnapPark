import { useEffect, useState } from "react";
import {
  Cog6ToothIcon,
  ChartBarSquareIcon,
  CreditCardIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useOfficeSettings } from "@/Reusable/Hooks/useNotificationSettings";
import { useSetOffices } from "@/Reusable/Hooks/useSetOffices";
import { DocumentData } from "firebase/firestore";
import { auth } from "@/firebase";
import { useRecoilState } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import { TrialAlerts, checkTrialStatus } from "./DashComponents/Alerts";
import { Signout } from "@/Reusable/Functions/authFunctions";
import { navigation, teamsArray } from '../../Reusable/constants';
import MobileSidebar from "./MobileSidebar";
import StaticSidebar from "./StaticSidebar";
import OutletContainer from "./OutletContainer";

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sOffice, setSelectedOffice] = useRecoilState<any>(selectedOffice);
  const [teams, setTeams] = useState(teamsArray);
  const [alert, setAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [userData, setUserData] = useRecoilState<DocumentData | undefined>(
    userState,
  );
  const navigate = useNavigate();

  useOfficeSettings(sOffice?.id);
  useSetOffices();

  const user = auth.currentUser;

  useEffect(() => {
    // console.log('UserData: ', userData)
    if (userData && userData.offices && userData.offices.length > 0) {
      const newTeamsArray = userData.offices.map((officeData: any) => ({
        id: officeData.id,
        name: officeData.data.office,
        href: "#",
        initial: officeData.data.office[0],
        current: false,
        data: officeData.data,
      }));

      // Set the teams state with the new array
      setTeams(newTeamsArray);

      updateSelectedOffice(newTeamsArray[0].id);

      const alertDetails = checkTrialStatus({
        subscriptionStatus: userData?.data?.status,
        createdAt: userData.data.createdAt,
        trialDaysTotal: 30,
        setupStatus: userData.data.setupIntentStatus, // Pass the setupIntentStatus from userData
        trialAlert: userData.data?.trialAlert,
      });
      setTimeout(() => {
        setAlert(alertDetails.showAlert);
        setAlertType(alertDetails.alertType);
      }, 2000);
    }
  }, [userData]);

  const updateSelectedOffice = (selectedTeamId: any) => {
    setTeams((currentTeams) => {
      const updatedTeams = currentTeams.map((team) => ({
        ...team,
        current: team.id === selectedTeamId,
      }));

      // Find the selected office from the updated teams array
      const selectedOffice = updatedTeams.find(
        (team) => team.id === selectedTeamId,
      );

      // Update the sOffice state
      if (selectedOffice) setSelectedOffice(selectedOffice);
      if (sidebarOpen) setSidebarOpen(false);

      return updatedTeams;
    });
  };

  const handleSignOut = async () => {
    try {
      await Signout(); // Sign out the user
      navigate("/"); // Redirect to the home page
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally handle errors here (e.g., display an error message)
    }
  };

  return (
    <>
      <MobileSidebar
        userData={userData}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        teams={teams}
        navigation={navigation}
        updateSelectedOffice={updateSelectedOffice}
      />
      <StaticSidebar
        userData={userData}
        teams={teams}
        navigation={navigation}
        updateSelectedOffice={updateSelectedOffice}
      />
      <OutletContainer
        user={user}
        teams={teams}
        sOffice={sOffice}
        updateSelectedOffice={updateSelectedOffice}
        setSidebarOpen={setSidebarOpen}
        handleSignOut={handleSignOut}
      />
      <TrialAlerts show={alert} setShow={setAlert} alertType={alertType} />
    </>
  );
}
