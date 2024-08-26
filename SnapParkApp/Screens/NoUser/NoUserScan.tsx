import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Platform,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useRecoilValue, useRecoilState } from "recoil";
import {
  userState,
  officeState,
  themeState,
  bottomSheetState,
} from "Hooks/RecoilState";
import { CameraView, Camera } from "expo-camera/next";
import Toast from "react-native-toast-message";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { OfficeData } from "Hooks/Types";
import Wrapper from "Screens/Reusable/NoUserWrapper";
import {
  XCircleIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
} from "react-native-heroicons/outline";
import firestore from "@react-native-firebase/firestore";
import {
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
} from "@expo/vector-icons";
import { firebase } from "@react-native-firebase/functions";
import auth from "@react-native-firebase/auth";
import { CommonActions } from "@react-navigation/native";

export default function NoUserScanScreen({ navigation }) {
  const theme = useRecoilValue(themeState);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused(); // Check if the screen is focused
  const [spotSheetState, setSpotSheetState] = useRecoilState(bottomSheetState);
  const [officeData, setOfficeData] = useRecoilState<OfficeData>(officeState);
  const [userDetails, setUserDetails] = useRecoilState<any>(userState);
  const [showModal, setShowModal] = useState(false);
  const isFetchingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!isFocused) {
        setScanned(false); // Reset scanned state when leaving the tab
      }
    }, [isFocused])
  );

  const getNewOfficeDetails = async (companyID, officeID, spotID) => {
    try {
      const newOfficeRef = await firestore()
        .doc(`users/${companyID}/offices/${officeID}/public/${officeID}`)
        .get();

      const newOfficeData = newOfficeRef.data();
      console.log("User details: ", userDetails);

      // console.log("New Office Data: ", newOfficeData);
      const foundSpot = newOfficeData?.parkingSpots.find(
        (spot) => spot.name === spotID
      );
      // console.log("Found Spot: ", foundSpot);
      setSpotSheetState({ isOpen: true, spotData: foundSpot });

      setUserDetails((currentDetails) => ({
        ...currentDetails,
        company: companyID,
        office: officeID,
        notifications: true,
        alternativeParkingList: newOfficeData?.alternativeParkingList,
      }));

      setOfficeData((currentDetails) => ({
        ...currentDetails,
        newOfficeData,
      }));

      navigation.navigate("NoUserSpot", {
        officeData: newOfficeData,
        spotDetails: foundSpot,
      });

      await firestore().collection("employees").doc(user.uid).update({
        company: companyID,
        office: officeID,
        notifications: true,
        alternativeParkingList: newOfficeData?.alternativeParkingList,
      });

      setScanned(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setScanned(false);

      throw error;
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (!spotSheetState.isOpen && !isFetchingRef.current) {
      try {
        if (data.includes("spot")) {
          const scannedCompany = data.split("/").slice(-3)[0];
          const scannedOffice = data.split("/").slice(-2)[0];
          const spotID = data.split("/").slice(-1)[0];

          console.log(scannedCompany, scannedOffice, spotID);

          const foundSpot = officeData?.parkingSpots.find(
            (spot) => spot.name === spotID
          );
          if (
            foundSpot &&
            scannedOffice === userDetails.office &&
            scannedCompany === userDetails.company
          ) {
            console.log("Already officeData");
            setScanned(true);
            navigation.navigate("NoUserSpot", {
              officeData: officeData,
              spotDetails: foundSpot,
            });
            setScanned(false);
          } else {
            console.log("Getting new officeData");

            // setShowModal(true);
            setScanned(true);

            // Set the fetching flag to true before calling the async function
            isFetchingRef.current = true;

            // Call the async function
            getNewOfficeDetails(scannedCompany, scannedOffice, spotID).finally(
              () => {
                // Reset the fetching flag after the async function completes
                isFetchingRef.current = false;
              }
            );
          }
        }
      } catch (error) {
        console.error("Failed to parse barcode data:", error);
        Toast.show({
          type: "error",
          text1: "Something went wrong...",
          text2: "Please scan the QR code again.",
        });
      }
    }
  };

  const fetchNotifications = async (
    companyID,
    officeID,
    mobile,
    employeeUID
  ) => {
    const fetchNotifications = firebase
      .app()
      .functions("europe-west1")
      .httpsCallable("fetchUserNotificationStatus");
    return fetchNotifications({ companyID, officeID, mobile, employeeUID });
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Wrapper heading="Scan QR Code">
      <View
        className="flex-1 relative  w-full  overflow-hidden items-center justify-center"
        style={{ overflow: "hidden", backgroundColor: theme.card }}
      >
        {isFocused ? (
          <>
            <CameraView
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              style={[StyleSheet.absoluteFillObject]}
            />

            <View style={overlayStyles.overlay}>
              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.horizontal,
                  overlayStyles.topLeft,
                ]}
              />
              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.vertical,
                  overlayStyles.topLeft,
                ]}
              />

              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.horizontal,
                  overlayStyles.topRight,
                ]}
              />
              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.vertical,
                  { top: 0, right: 0 },
                ]}
              />

              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.horizontal,
                  { bottom: 0, left: 0 },
                ]}
              />
              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.vertical,
                  overlayStyles.bottomLeft,
                ]}
              />

              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.horizontal,
                  { bottom: 0, right: 0 },
                ]}
              />
              <View
                style={[
                  overlayStyles.corner,
                  overlayStyles.vertical,
                  { bottom: 0, right: 0 },
                ]}
              />
            </View>
          </>
        ) : (
          <ActivityIndicator size={"small"} color={theme.primary} />
        )}
      </View> 
      {/* <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          hardwareAccelerated={true}
        >
          <View style={styles.centeredView}>
            <View
              style={[
                styles.modalView,
                {
                  backgroundColor: theme.background,
                  shadowColor: theme.shadowColor,
                },
              ]}
            >
              <View className="w-full mt-0 ">
                <View className="w-full flex flex-row items-center justify-between">
                  <Text
                    className="text-xl font-extrabold"
                    style={{ color: theme.text }}
                  >
                    Incorrect Office
                  </Text>
                  <TouchableOpacity onPress={handleCloseModal}>
                    {Platform.OS == "ios" ? (
                      <XCircleIcon className="w-8 h-8" size={28} />
                    ) : (
                      <AntDesign
                        name="closecircleo"
                        size={20}
                        color={theme.blue2}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <Text
                className=" w-full mt-2 text-lg font-normal"
                style={{ color: theme.infoText }}
              >
                It looks like this parking spot belongs to a different office:
              </Text>
              <View className="w-full flex-row mt-4">
                <View
                  className="flex-row  items-center rounded-md px-2 py-2 mr-1 border border-gray-400
                   "
                  style={{ backgroundColor: theme.badge }}
                >
                  {Platform.OS == "ios" ? (
                    <BuildingOffice2Icon size={20} style={{ marginRight: 4 }} />
                  ) : (
                    <FontAwesome
                      name="building-o"
                      size={20}
                      color="#0077ff"
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    className="text-[15px] font-medium text-gray-600"
                    style={{ color: theme.infoText }}
                  >
                    {newCompany && newCompany}
                  </Text>
                </View>
                <View
                  className="flex-row  items-center rounded-md px-2 py-2 mr-1 border border-gray-400
                  "
                  style={{ backgroundColor: theme.badge }}
                >
                  {Platform.OS == "ios" ? (
                    <BuildingOfficeIcon size={20} style={{ marginRight: 4 }} />
                  ) : (
                    <MaterialCommunityIcons
                      name="office-building-marker-outline"
                      size={20}
                      color="#0077ff"
                      style={{ marginRight: 4 }}
                    />
                  )}
  
                  <Text
                    className="text-[15px] font-medium text-gray-600"
                    style={{ color: theme.infoText }}
                  >
                    {newOffice && newOffice}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: theme.blue2 }}
                className="w-full min-h-[50] max-h-[50] mt-4  rounded-xl items-center justify-center"
                onPress={handleChangeOffice}
              >
                {loading ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Text
                    className="text-[17px] font-bold"
                    style={{ color: "#fff" }}
                  >
                    Change office?
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, borderColor: theme.blue2 }}
                className="w-full border min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
                onPress={() => setShowModal(false)}
              >
                <Text
                  className="text-[17px] font-bold"
                  style={{ color: theme.blue2 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}
    </Wrapper>
  );
}

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
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  overlay: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "#ffcc00",
    zIndex: 4,
    backgroundColor: "transparent",
  },
  inputContainer: {
    width: "100%", // w-full
    height: 48, // h-12 (height in React Native is in pixels)
    paddingHorizontal: 16, // px-4 (padding in React Native is in pixels)
    borderWidth: 1, // border

    borderRadius: 8, // rounded-lg
    justifyContent: "flex-start", // text-start
    marginVertical: 8, // my-2 (margin in React Native is in pixels)
  },
  centeredView: {
    flex: 1,
    paddingBottom: 90,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Optional: for darkened background effect
  },
  modalView: {
    width: "95%", // Control width to whatever you prefer
    height: 300, // Set height to 40% of screen
    backgroundColor: "white",
    position: "relative",
    display: "flex",
    borderRadius: 20, // Adjust this value as needed
    padding: 16, // Add padding inside the modal
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Only affects Android
  },
});

const overlayStyles = StyleSheet.create({
  overlay: {
    width: 150,
    height: 150,
    zIndex: 4,
    backgroundColor: "transparent",
    position: "relative", // Important for absolute positioning of children
  },
  corner: {
    position: "absolute",
    backgroundColor: "#ffae00",
    width: 20, // Adjust for desired corner length
    height: 1, // Adjust for desired corner thickness
  },
  horizontal: {
    width: 20, // Adjust for desired corner length
    height: 1, // Adjust for desired corner thickness
  },
  vertical: {
    width: 1, // Adjust for desired corner thickness
    height: 20, // Adjust for desired corner length
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
});
