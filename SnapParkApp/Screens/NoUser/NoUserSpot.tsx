import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";

import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";

import SnapParkLogo from "../../assets/SnapParkLogo.png";
import { handleToggleSpot } from "Functions/SpotFunctions";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "Theme/theme";
import { CommonActions } from "@react-navigation/native";
import JoinListModal from "./JoinNotificationListModal/JoinListModal";

const NoUserSpotScreen = ({ route, navigation }: any) => {
  const { officeData, spotDetails } = route.params;
  const [spotData, setSpotData] = useState(spotDetails);
  const [showModal, setShowModal] = useState(false);

  const theme = useRecoilValue(themeState);
  const [loading, setLoading] = useState(false);
  const [previousScreen, setPreviousScreen] = useState("");

  useEffect(() => {
    const state = navigation.getState();
    const routes = state.routes;
    const previousRoute = routes[routes.length - 2]; // Get the previous route
    if (previousRoute) {
      setPreviousScreen(previousRoute.name);
    }
  }, []);

  const handleClose = () => {
    if (previousScreen === "NoUserScan") {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "NoUserDrawer" }],
        })
      );
    } else {
      navigation.goBack();
    }
  };

  if (!spotData) {
    return null;
  }

  const backgroundColor = spotData.available
    ? "rgba(46, 255, 46, 0.075)" // Available
    : "rgba(255, 86, 56, 0.075)"; // Taken

  const borderColor = spotData.available ? "#1dff43" : "#ff8787"; // green-400, red-400
  const fillColor = spotData.available ? "#00ff2621" : "#fd000020";

  const statusText = spotData.available ? "Available" : "Taken";

  const toggle = useCallback(() => {
    const currentSpotData = spotData; // Access latest state

    if (officeData && currentSpotData) {
      setSpotData((prev) => ({
        ...prev,
        available: !currentSpotData.available,
      }));
      handleToggleSpot(officeData, currentSpotData);
      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    }
  }, [officeData, spotData]); // Depend on current data

  // renders
  return (
    // <Wrapper heading="Spot Information">
    <KeyboardAvoidingView
      style={[styles.contentContainer, { backgroundColor: theme.background }]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.Heading]}>Spot Information</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={handleClose}>
            <Feather
              name="x"
              size={25}
              color={COLORS.primary}
              style={{ paddingTop: 3 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <LinearGradient
        className="flex relative items-center justify-center border mx-3.5 mt-2 rounded-xl bg-white shadow-md"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        }}
        colors={theme.receiptContainer}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 0, y: 0 }}
      >
        <View className="flex  py-5 items-center justify-center max-w-full">
          <Image
            source={SnapParkLogo}
            className="h-9 w-auto "
            style={{ resizeMode: "contain" }}
            accessibilityLabel="Snap Park Logo"
          />
        </View>
        <View
          className="py-0 border-b border-t mb-2"
          style={{ borderColor: theme.border }}
        >
          <View className="w-full  p-4 pb-1 flex flex-row items-center justify-between ">
            <Text className="text-sm font-medium" style={{ color: theme.text }}>
              Company:{" "}
            </Text>
            <View
              className="inline-flex items-center rounded-md px-2 py-2 border border-gray-400
                   "
              style={{ backgroundColor: theme.badge }}
            >
              <Text
                className="text-[15px] font-medium text-gray-600"
                style={{ color: theme.infoText }}
              >
                {officeData?.company}
              </Text>
            </View>
          </View>
          <View className="w-full p-4 py-1 flex flex-row items-center justify-between ">
            <Text className="text-sm font-medium" style={{ color: theme.text }}>
              Office:{" "}
            </Text>
            <View
              className="inline-flex items-center rounded-md  px-2 py-2 border  border-gray-400
                     "
              style={{ backgroundColor: theme.badge }}
            >
              <Text
                className="text-[15px] font-medium text-gray-600"
                style={{ color: theme.infoText }}
              >
                {officeData?.office}
              </Text>
            </View>
          </View>
          <View className="w-full p-4 py-1 flex flex-row items-center justify-between ">
            <Text className="text-sm font-medium" style={{ color: theme.text }}>
              Last used:{" "}
            </Text>
            <View
              className="inline-flex items-center rounded-md  px-2 py-2 border  border-gray-400
                     "
              style={{ backgroundColor: theme.badge }}
            >
              <Text
                className="text-[15px] font-medium text-gray-600"
                style={{ color: theme.infoText }}
              >
                {formatDate(spotData?.lastToggledDate)}
              </Text>
            </View>
          </View>
          <View className="w-full p-4 pt-1 flex flex-row items-center justify-between ">
            <Text className="text-sm font-medium" style={{ color: theme.text }}>
              Utilisation:{" "}
            </Text>
            <View
              className="inline-flex items-center rounded-md  px-2 py-2 border  border-gray-400
                     "
              style={{ backgroundColor: theme.badge }}
            >
              <Text
                className="text-[15px] font-medium text-gray-600"
                style={{ color: theme.infoText }}
              >
                {spotData?.utilisation}%
              </Text>
            </View>
          </View>
        </View>
        <View className="min-w-full  overflow-hidden py-3">
          <TouchableOpacity
            style={[styles.item, { backgroundColor, borderColor }]}
          >
            <Text
              className="text-xl font-bold min-w-20"
              style={{ color: theme.text }}
            >
              {spotData.name}
            </Text>
            <View className="pl-2">
              <Text
                className="text-sm font-light"
                style={{ color: theme.text }}
              >
                {spotData?.lastToggledDate && !spotData.available
                  ? new Date(spotData.lastToggledDate).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )
                  : null}
              </Text>
            </View>
            <View
              className={`flex-row  items-center gap-x-1.5 rounded-md px-2 pr-3 py-2  `}
              style={{ backgroundColor: fillColor }}
            >
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: borderColor }}
              />
              <Text className="font-semibold" style={{ color: theme.text }}>
                {statusText}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          className="flex min-w-full items-center justify-center border-t rounded-b-xl p-4 
             w-full shadow-md"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.cardButtonContainer,
          }}
        >
          <TouchableOpacity
            className="rounded-xl min-w-full bg-blue-600 px-6 py-4 text-center text-md font-semibold
                     text-white shadow-lg"
            onPress={toggle}
          >
            {loading ? (
              <View></View>
            ) : spotData.available ? (
              <Text className="text-center text-[18px] font-semibold text-white">
                Mark as taken
              </Text>
            ) : (
              <Text className="text-center text-[18px] font-semibold text-white">
                Vacate parking spot
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <JoinListModal
        showModal={showModal}
        setShowModal={setShowModal}
        navigation={navigation}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bottomSheetStyle: {
    borderRadius: 40,
    // overflow: "hidden",
    shadowColor: "#7f7f7f",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  contentContainer: {
    display: "flex",

    flex: 1,
    alignItems: "center",

    // paddingBottom: 40,
  },
  overlay: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "#ffcc00",
    zIndex: 4,
    backgroundColor: "transparent",
  },
  item: {
    maxWidth: "100%",
    padding: 16,
    marginBottom: 6,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    alignItems: "center",
  },
  Heading: {
    fontSize: 25,
    color: COLORS.primary,
    fontWeight: "700",
    marginVertical: 10,
    marginTop: 15,
  },
  menuContainer: { flexDirection: "row", alignItems: "center" },
});

export default NoUserSpotScreen;


function formatDate(dateString) {
  if (dateString.length > 1) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    let hours: number = date.getHours(); // hours as number
    // Correctly separate the string representation

    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let formattedHours: string = hours.toString().padStart(2, "0");
    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  } else {
    return "Never";
  }
}
