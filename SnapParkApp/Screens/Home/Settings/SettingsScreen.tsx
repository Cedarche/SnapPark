import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { lightTheme, darkTheme } from "Theme/theme";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState, officeState, themeState } from "Hooks/RecoilState";
import { LinearGradient } from "expo-linear-gradient";
import {
  XCircleIcon,
  DevicePhoneMobileIcon,
  ArrowLeftEndOnRectangleIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
} from "react-native-heroicons/outline";
import { OfficeData } from "Hooks/Types";
import { handleNotificationToggle } from "Functions/AuthFunctions";
import JoinNewOffice from "./JoinNewOffice";
import Toast from "react-native-toast-message";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/functions";
import { CommonActions } from "@react-navigation/native";
import DeleteAccount from "./DeleteAccount";

import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import Wrapper from "Screens/Reusable/Wrapper";
import { storage } from "Hooks/useStorage";

export default function SettingsScreen({ route, navigation }) {
  const [theme, setTheme] = useRecoilState(themeState);
  const [userDetails, setUserDetails] = useRecoilState<any>(userState);
  const [officeData, setOfficeData] = useRecoilState<OfficeData>(officeState);
  const [loading, setLoading] = useState(false);
  const [linkingCode, setLinkingCode] = useState<any>();
  const [showScanCode, setShowScanCode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const user = auth().currentUser;

  const HandleChangeTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    if (newTheme === lightTheme) {
      storage.set("themePreference", "lightTheme");
    } else {
      storage.set("themePreference", "darkTheme");
    }
    // console.log("Theme updated in MMKV storage", JSON.stringify(newTheme));
  };

  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        // Try a direct navigation to 'AuthHome' after sign out
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          })
        );
        // navigation.navigate("Auth", { screen: "AuthHome" });
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const handleToggleNotifications = async () => {
    if (officeData) {
      setLoading(true);
      // Pass setUserDetails and userDetails to function
      setUserDetails((currentDetails) => ({
        ...currentDetails,
        notifications: !userDetails.notifications,
      }));
      await handleNotificationToggle(officeData, userDetails, setUserDetails);
      setLoading(false);
    }
  };

  // console.log(userDetails.expoPushToken);
  const fetchNotifications = async (
    companyID,
    officeID,
    mobile,
    employeeUID
  ) => {
    try {
      const fetchNotifications = firebase
        .app()
        .functions("europe-west1")
        .httpsCallable("fetchUserNotificationStatus");
      return await fetchNotifications({
        companyID,
        officeID,
        mobile,
        employeeUID,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
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

  const handleChangeOffice = async () => {
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
      const docRef = firestore()
        .collection("shortenedURLs")
        .doc(String(linkingCode));

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
          : userDetails.mobile
          ? userDetails.mobile
          : Math.floor(Math.random() * 1000000000);

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
          } else {
            console.log(
              "Employee not found in notification list or no matching office found"
            );
          }
        } catch (error) {
          console.error("Error fetching user's notification status:", error);
        }

        console.log("Function result:", result.data);
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Joined the new notification list",
        });
        setShowScanCode(false);
        // navigation.navigate("HomeDrawer");
      } else {
        console.log("No such document!");
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

  return (
    <Wrapper heading="Settings">
      <ScrollView
        className="flex  p-[15] rounded-xl bg-white shadow-md"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <LinearGradient
          style={[styles.profileContainer, { borderColor: theme.border }]}
          colors={theme.receiptContainer}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={[styles.displayName, { color: theme.text }]}>
            {user.displayName ? user.displayName : "Change display name"}
          </Text>
        </LinearGradient>
        <View
          style={[
            styles.settingsCard,
            { borderColor: theme.border, marginTop: 0 },
          ]}
        >
          {!user.phoneNumber || !user.email ? (
            <View
              style={{
                width: "100%",
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <InformationCircleIcon size={22} color={theme.text} />
              <Text
                style={[styles.settingsHeaderText, { color: theme.infoText }]}
              >
                {userDetails.mobile}
              </Text>
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={[styles.settingsHeaderText, { color: theme.text }]}>
                {user.phoneNumber ? "Mobile: " : "Email: "}
              </Text>
              <Text
                style={[styles.settingsHeaderText, { color: theme.infoText }]}
              >
                {user.phoneNumber ? user.phoneNumber : user.email} sd
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.settingsCard, { borderColor: theme.border }]}>
          <Text style={[styles.settingsHeaderText, { color: theme.text }]}>
            Notifications:
          </Text>

          <Switch
            trackColor={{ false: "#767577", true: "#0077ff" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggleNotifications}
            value={userDetails?.notifications ? true : false}
          />
        </View>

        <View style={[styles.settingsCard, { borderColor: theme.border }]}>
          <Text style={[styles.settingsHeaderText, { color: theme.text }]}>
            Change theme:
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#0077ff" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={HandleChangeTheme}
            value={theme === lightTheme ? true : false}
          />
        </View>
        <View style={[styles.settingsCard, { borderColor: theme.border }]}>
          <View>
            <Text style={[styles.settingsHeaderText, { color: theme.text }]}>
              Current Office:
            </Text>
            <View className="w-full flex-row mt-2">
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
                  {officeData?.company}
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
                  {officeData?.office}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* <View style={[styles.divider, { borderBottomColor: theme.border }]} /> */}

        <TouchableOpacity
          style={[styles.settingsCard, { borderColor: theme.border }]}
          onPress={() => {
            setShowScanCode(true);
          }}
        >
          {/* <Feather name="lock" size={20} color={theme.text} /> */}
          <BuildingOffice2Icon size={20} color={theme.text} />
          <Text style={[styles.settingsHeaderText, { color: theme.text }]}>
            Join new office
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsCard, { borderColor: theme.border }]}
          onPress={() => setShowModal(true)}
        >
          {/* <Feather name="delete" size={20} color={"red"} /> */}
          <XCircleIcon size={20} color={"red"} />
          <Text style={[styles.settingsHeaderText, { color: "red" }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut}>
          <LinearGradient
            colors={theme.secondaryGradient}
            style={styles.gradient}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0.5 }}
          >
            <ArrowLeftEndOnRectangleIcon size={20} color={"white"} />
            <Text style={[styles.settingsHeaderText, { color: "white" }]}>
              Sign Out
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      {showScanCode && (
        <JoinNewOffice
          setShowScanCode={setShowScanCode}
          setLinkingCode={setLinkingCode}
          linkingCode={linkingCode}
          loading={loading}
          handleChangeOffice={handleChangeOffice}
        />
      )}
      <DeleteAccount
        showModal={showModal}
        setShowModal={setShowModal}
        navigation={navigation}
      />
    </Wrapper>
  );
}

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    padding: 15,

    width: "100%",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
  },
  displayName: {
    fontSize: 20,
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
