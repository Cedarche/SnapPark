import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import Wrapper from "Screens/Reusable/Wrapper";
import { LinearGradient } from "expo-linear-gradient";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  themeState,
  userState,
  officeState,
  bottomSheetState,
} from "Hooks/RecoilState";
import { OfficeData } from "Hooks/Types";
import { ExclamationTriangleIcon } from "react-native-heroicons/outline";
import NoOffice from "./NoOffice";
import AllSpots from "./AllSpots/NUAllSpotsScreen";

const NoUserHome = ({ navigation, route }) => {
  const theme = useRecoilValue(themeState);
  const [userDetails, setUserDetails] = useRecoilState(userState);
  const [officeData, setOfficeData] = useRecoilState<OfficeData>(officeState);
  const [spotSheetState, setSpotSheetState] = useRecoilState(bottomSheetState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (officeData && officeData.notificationSettings) {
      console.log("Success!");
      setReady(true);
    }
  }, [officeData]);

  return (
    <Wrapper heading={"Home"}>
      {ready ? (
        <AllSpots navigation={navigation} route={route} />
      ) : (
        <NoOffice navigation={navigation} />
      )}
    </Wrapper>
  );
};

export default NoUserHome;

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    padding: 15,

    width: "100%",
  },
  stepContainer: {
    display: "flex",
    position: "relative",
    //   alignItems: "center",
    flexDirection: "row",
    // justifyContent: "center",
    // width: "100%",
    margin: 18,
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 8,
  },
  stepIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 18,
  },
  stepInfoContainer: { display: "flex", flex: 1 },
  displayName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsCard: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    paddingVertical: 18,
    marginBottom: 10,
    position: "relative",
  },
  settingsHeaderText: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingInfoText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "400",
    maxWidth: "80%",
  },
  verified: {
    position: "absolute",
    top: -8,
    right: -5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  divider: {
    width: "100%",
    borderBottomWidth: 1,
    marginTop: 0,
    marginBottom: 10,
  },
  gradient: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",

    borderRadius: 12,
    padding: 15,
    paddingVertical: 18,

    position: "relative",
  },
});
