import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRecoilValue } from "recoil";
import { existsInOfficeState, themeState, userState } from "Hooks/RecoilState";
import {
  XCircleIcon,
  ExclamationTriangleIcon,
} from "react-native-heroicons/outline";
import Toast from "react-native-toast-message";
import { CameraView, Camera } from "expo-camera/next";
import { GradientBorderButton } from "Screens/Reusable/GradientComponents";
import { lightTheme } from "Theme/theme";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/functions";
import { useRecoilState } from "recoil";
import { CommonActions } from "@react-navigation/native";

const MissingFromOffice = ({ navigation }: any) => {
  const theme = useRecoilValue(themeState);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [linkingCode, setLinkingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useRecoilState<any>(userState);
  const isFetchingRef = useRef(false);
  const [existsInOfficeList, setExistsInOfficeList] =
    useRecoilState(existsInOfficeState);
  const user = auth().currentUser;

  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          })
        );
        // Try a direct navigation to 'AuthHome' after sign out

        // navigation.navigate("Auth", { screen: "AuthHome" });
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const getNewOfficeDetails = async (userId, officeId) => {
    try {
      const newOfficeRef = await firestore()
        .doc(`users/${userId}/offices/${officeId}/public/${officeId}`)
        .get();
      const newOfficeData = newOfficeRef.data();
      console.log("new office data: ", newOfficeData);
      return newOfficeData?.alternativeParkingList;
    } catch (error) {
      console.error("Error fetching new office details:", error);
      throw error;
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

  const handleChangeOffice = async (linkingCode) => {
    setLoading(true);
    if (!user.displayName || !linkingCode) {
      Toast.show({
        type: "error",
        text1: "Incomplete Details",
        text2: "Please enter a linking code.",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Linking Code: ", linkingCode);
      const docRef = firestore().collection("shortenedURLs").doc(linkingCode);
      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const officeData = docSnapshot.data();
        const userId = officeData.userId;
        const officeId = officeData.officeId;

        const newOfficeAlternateList = await getNewOfficeDetails(
          userId,
          officeId
        );

        // Update only company and office fields in the employee document
        await firestore().collection("employees").doc(user.uid).update({
          company: userId,
          office: officeId,
          notifications: true,
          alternativeParkingList: newOfficeAlternateList,
        });
        console.log("Employee document updated successfully!");

        const cleanMobile = user.phoneNumber
          ? user.phoneNumber.replace(/\s+/g, "")
          : "";

        const addToNotificationList = firebase
          .app()
          .functions("europe-west1")
          .httpsCallable("addToNotificationList");

        const result = await addToNotificationList({
          userId: userId,
          officeId: officeId,
          newEmployee: {
            uid: user.uid,
            name: user.displayName,
            mobile: cleanMobile,
            company: userId,
            office: officeId,
            notifications: true,
            expoPushToken: userDetails.expoPushToken,
          },
        });

        try {
          const notificationResult = await fetchNotifications(
            userId,
            officeId,
            cleanMobile,
            user.uid
          );

          if (notificationResult.data.exists) {
            setUserDetails((currentDetails) => ({
              ...currentDetails,
              notifications: notificationResult.data.notifications,
            }));
            setExistsInOfficeList(true);
          } else {
            console.log(
              "Employee not found in notification list or no matching office found"
            );
          }
        } catch (error) {
          console.error("Error fetching user's notification status:", error);
          Toast.show({
            type: "error",
            text1: "Something went wrong...",
            text2: "Please try again",
          });
        }

        console.log("Function result:", result.data);
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Joined the new notification list",
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeDrawer" }],
          })
        );

        // navigation.navigate("HomeDrawer");
      } else {
        Toast.show({
          type: "error",
          text1: "Incomplete Details",
          text2: "Please enter an existing linking code.",
        });
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error updating user:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update details. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (!isFetchingRef.current) {
      try {
        console.log(data);
        const formattedData = data
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"');
        const jsonData = JSON.parse(formattedData);
        console.log(jsonData?.linkingCode);
        setLinkingCode(jsonData.linkingCode);
        if (jsonData.linkingCode.length === 6) {
          console.log("Changing office");
          setScanned(true);
          isFetchingRef.current = true;
          handleChangeOffice(jsonData.linkingCode).finally(() => {
            isFetchingRef.current = false;
          });
        }
      } catch (error) {
        console.error("Failed to parse barcode data:", error);
        Toast.show({
          type: "error",
          text1: "Somethign went wrong...",
          text2: "Please scan the QR code again.",
        });
      }
    }
  };

  if (hasPermission === null) {
    return null;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  // renders
  return (
    <SafeAreaView
      style={[
        styles.bottomSheetStyle,
        { backgroundColor: theme.card, borderRadius: 40 },
      ]}
    >
      <View style={[styles.contentContainer, { backgroundColor: theme.card }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, width: "100%" }}
        >
          <View>
            <View className="flex flex-row items-center   mt-2">
              <ExclamationTriangleIcon size={30} color={"#ff7700"} />
              <Text
                className="text-2xl ml-2 font-extrabold"
                style={{ color: theme.text }}
              >
                Not found in office list
              </Text>
            </View>
            <Text className="my-6" style={{ color: theme.infoText }}>
              If you think you've been removed by accident, please let your
              office administator know.
            </Text>
          </View>
          <View className="mb-1 mt-2 w-full">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              Enter or Scan the new Office Linking Code:{" "}
            </Text>
          </View>
          <View
            style={{
              overflow: "hidden",
              display: "flex",
              flex: 1,
              width: "100%",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
            <TouchableOpacity
              className="absolute top-1.5 right-1.5"
              //   onPress={handleClosePress}
            >
              <XCircleIcon size={25} color={"#ffffff"} />
            </TouchableOpacity>
          </View>

          <View className="mb-0 mt-4 w-full">
            <Text
              className="font-semibold text-gray-600"
              style={{ color: theme.text }}
            >
              Linking Code:{" "}
            </Text>
          </View>

          <View className="flex-row items-center mb-2" style={{}}>
            <TextInput
              keyboardAppearance={theme === lightTheme ? "light" : "dark"}
              keyboardType="number-pad"
              placeholder="E.g. 123456"
              value={linkingCode}
              onChangeText={setLinkingCode}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg text-start my-2 "
              style={{
                flex: 1,
                shadowColor: "grey",
                shadowOpacity: 0.2,
                shadowOffset: { width: 1, height: 1 },
                color: theme.text,
                backgroundColor: theme.card,
              }}
              // autoComplete="otp"
              placeholderTextColor={theme.inputText}
              returnKeyType="done"
            />
          </View>

          <GradientBorderButton
            onPress={() => handleChangeOffice(linkingCode)}
            title="Continue"
            gradientColors={lightTheme.primaryGradient}
            fill={false}
            width={"100%"}
            textStyle={{ color: "#fff" }}
            loading={loading}
            loadingColor="#fff"
          />
          <GradientBorderButton
            onPress={handleSignOut}
            title="Sign Out"
            gradientColors={lightTheme.primaryGradient}
            fill={true}
            width={"100%"}
            textStyle={{ color: theme.primary }}
            loading={loading}
            loadingColor="#fff"
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomSheetStyle: {
    borderRadius: 40,
    // overflow: "hidden",
    display: "flex",
    flex: 1,
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
    paddingBottom: 8,
  },
  overlay: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "#ffcc00",
    zIndex: 4,
    backgroundColor: "transparent",
  },
});

const overlayStyles = StyleSheet.create({
  overlay: {
    width: 150,
    height: 150,
    zIndex: 4,
    backgroundColor: "transparent",
    position: "relative", 
  },
  corner: {
    position: "absolute",
    backgroundColor: "#ffae00",
    width: 20,
    height: 1,
  },
  horizontal: {
    width: 20,
    height: 1,
  },
  vertical: {
    width: 1,
    height: 20,
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

export default MissingFromOffice;
