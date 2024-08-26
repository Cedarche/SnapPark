import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import SnapParkLogo from "../../assets/SnapParkLogo.png";
import DismissKeyboard from "../Reusable/DismissKeyboard";
import { GradientBorderButton } from "../Reusable/GradientComponents";
import { lightTheme, darkTheme } from "Theme/theme";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/functions";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  userState,
  pushNotificationToken,
  themeState,
  initialParams,
} from "Hooks/RecoilState";

import { AntDesign } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { QrCodeIcon } from "react-native-heroicons/outline";
import ScanCodeSheet from "./ScanCode";
import {
  PencilSquareIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
} from "react-native-heroicons/outline";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");
const aspectRatio = height / width;

export default function EnterName({ route, navigation }) {
  const [name, setName] = useState<string>("");
  const [companyID, setCompanyID] = useState<any>();
  const [officeID, setOfficeID] = useState<any>();
  const [linkingCode, setLinkingCode] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showScanCode, setShowScanCode] = useState(false);
  const [userDetails, setUserDetails] = useRecoilState(userState);
  const expoPushToken = useRecoilValue(pushNotificationToken);
  const theme = useRecoilValue(themeState);
  const initialParameters = useRecoilValue(initialParams);
  const [initialCompany, setInitialCompany] = useState("");
  const [initialOffice, setInitialOffice] = useState("");

  const { mobile = "" } = route.params || {};
  useEffect(() => {
    if (initialParameters) {
      console.log("Initial Params: ", initialParameters);
      setLinkingCode(initialParameters.linkingCode);
      setInitialOffice(initialParameters.officeID);
      setInitialCompany(initialParameters.companyID);
    }
  }, [initialParameters]);

  const user = auth().currentUser;

  const handleAddUser = async () => {
    setLoading(true);
    if (user && user.displayName) {
      if (!linkingCode) {
        Toast.show({
          type: "error",
          text1: "Incomplete Details",
          text2: "Please enter a linking code.",
        });
        setLoading(false);
        return;
      }
    } else {
      if (!name || !linkingCode) {
        Toast.show({
          type: "error",
          text1: "Incomplete Details",
          text2: "Please enter your name & linking code.",
        });
        setLoading(false);
        return;
      }
    }
    const cleanMobile = mobile
      ? mobile.replace(/\s+/g, "")
      : Math.floor(Math.random() * 1000000000);

    try {
      //   Update the user's profile
      if (!user.displayName) {
        await user.updateProfile({
          displayName: name,
        });
      }
      if (!companyID || !officeID) {
        const docRef = firestore().collection("shortenedURLs").doc(linkingCode);
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
          console.log("Entername - doc exists");
          const officeData = docSnapshot.data();
          const userId = officeData.userId;
          const officeId = officeData.officeId;
          let alternativeParkingList = [];

          const alternativeParkingRef = firestore()
            .collection("users")
            .doc(userId)
            .collection("offices")
            .doc(officeId)
            .collection("public")
            .doc(officeId);

          const alternateSnapshot = await alternativeParkingRef.get();
          if (alternateSnapshot.exists) {
            alternativeParkingList =
              alternateSnapshot.data().alternativeParkingList;
          }

          const newEmployee = {
            name: user.displayName || name,
            mobile: cleanMobile,
            company: userId,
            office: officeId,
            expoPushToken: expoPushToken,
            alternativeParkingList: alternativeParkingList,
            anonymous: false,
          };

          // Update the employee document
          await firestore()
            .collection("employees")
            .doc(user.uid)
            .update(newEmployee);

          const addToNotificationList = firebase
            .app()
            .functions("europe-west1")
            .httpsCallable("addToNotificationList");

          const result = await addToNotificationList({
            userId: userId,
            officeId: officeId,
            newEmployee,
          });

          console.log("Function result:", result.data);
          setUserDetails((prev) => ({
            ...prev,
            newEmployee,
          }));

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "HomeDrawer" }],
            })
          );
        } else {
          Toast.show({
            type: "error",
            text1: "Incomplete Details",
            text2: "Incorrect linking code.",
          });
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to add user to notification list.",
      });
    }
  };

  const handleShowScanner = () => {
    Keyboard.dismiss();
    setShowScanCode(true);
  };

  return (
    <DismissKeyboard>
      <>
        <KeyboardAvoidingView
          className="flex-1 items-center justify-center "
          behavior={Platform.OS === "ios" ? "padding" : null}
        >
          <View className="flex-grow-1 h-10 items-center justify-center ">
            <Image
              source={SnapParkLogo}
              className="h-12 w-auto mt-[110]"
              style={{ resizeMode: "contain" }}
              accessibilityLabel="Snap Park Logo"
            />
          </View>
          <View
            className="flex-grow-1 items-center justify-end pb-[30]  w-full "
            style={{ paddingBottom: aspectRatio > 1.6 ? 30 : 90 }}
          >
            {!user ||
              (!user.displayName && (
                <>
                  <View
                    className="mb-1"
                    style={{ width: width * 0.8, maxWidth: 400 }}
                  >
                    <Text
                      className="font-semibold "
                      style={{ color: theme.text }}
                    >
                      Please enter your name:
                    </Text>
                  </View>

                  <TextInput
                    keyboardType="default"
                    keyboardAppearance={theme === lightTheme ? "light" : "dark"}
                    placeholder="E.g. John Smith"
                    value={name}
                    onChangeText={setName}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg text-start my-2"
                    style={{
                      width: width * 0.8,
                      shadowColor: "grey",
                      shadowOpacity: 0.2,
                      shadowOffset: { width: 1, height: 1 },
                      color: theme.text,
                      maxWidth: 400,
                    }}
                    placeholderTextColor={theme.inputText}
                    // textContentType="telephoneNumber"
                    //   returnKeyType="next"

                    autoComplete="name"
                  />
                </>
              ))}

            <View
              className="mb-1 mt-2"
              style={{ width: width * 0.8, maxWidth: 400 }}
            >
              <Text className="font-semibold " style={{ color: theme.text }}>
                {initialCompany
                  ? "Confirm Company & Office:"
                  : "Enter or Scan your Office Linking Code:"}
              </Text>
            </View>
            {initialCompany && initialOffice && linkingCode ? (
              <View
                className="flex-row items-center justify-between mb-5 mt-2"
                style={{ width: width * 0.8, maxWidth: 400 }}
              >
                <View className="flex flex-row items-center ">
                  <View
                    className="flex-row  items-center rounded-md px-2 py-2 mr-1 border border-gray-400
                 "
                    style={{ backgroundColor: theme.badge }}
                  >
                    {Platform.OS == "ios" ? (
                      <BuildingOffice2Icon
                        size={20}
                        style={{ marginRight: 4 }}
                      />
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
                      {initialCompany}
                    </Text>
                  </View>
                  <View
                    className="flex-row  items-center rounded-md px-2 py-2 mr-1 border border-gray-400
                "
                    style={{ backgroundColor: theme.badge }}
                  >
                    {Platform.OS == "ios" ? (
                      <BuildingOfficeIcon
                        size={20}
                        style={{ marginRight: 4 }}
                      />
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
                      {initialOffice}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setLinkingCode("");
                  }}
                >
                  <PencilSquareIcon size={24} color={theme.blue2} />
                </TouchableOpacity>
              </View>
            ) : (
              <View
                className="flex-row items-center mb-2"
                style={{ width: width * 0.8, maxWidth: 400 }}
              >
                <TextInput
                  keyboardType="number-pad"
                  keyboardAppearance={theme === lightTheme ? "light" : "dark"}
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
                  }}
                  placeholderTextColor={theme.inputText}
                  returnKeyType="done"
                />

                <TouchableOpacity className="pl-2" onPress={handleShowScanner}>
                  {Platform.OS == "ios" ? (
                    <QrCodeIcon size={28} />
                  ) : (
                    <AntDesign name="scan1" size={28} color="black" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <GradientBorderButton
              onPress={handleAddUser}
              title="Continue"
              gradientColors={lightTheme.primaryGradient}
              fill={false}
              textStyle={{ color: "#fff" }}
              loading={loading}
              loadingColor="#fff"
              style={{ maxWidth: 400 }}
            />
          </View>
        </KeyboardAvoidingView>
        {showScanCode && (
          <ScanCodeSheet
            setShowScanCode={setShowScanCode}
            setLinkingCode={setLinkingCode}
            setCompanyID={setCompanyID}
            setOfficeID={setOfficeID}
          />
        )}
      </>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 50,

    shadowColor: "grey",
    shadowOpacity: 0.4,
    shadowOffset: { width: 1, height: 1 },
  },
});
