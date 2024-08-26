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
  LogBox,
} from "react-native";
import SnapParkLogo from "../../../assets/SnapParkLogo.png";

import DismissKeyboard from "Screens/Reusable/DismissKeyboard";
import { GradientBorderButton } from "../../Reusable/GradientComponents";
import { COLORS, lightTheme } from "Theme/theme";
import auth from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";

const { height, width } = Dimensions.get("window");
const aspectRatio = height / width;

export default function MobileScreen({ navigation }) {
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useRecoilValue(themeState);

  LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
  ]);

  async function handleConfirmMobile() {
    if (mobile && mobile.length > 5) {
      setLoading(true);

      const phoneNumber = parsePhoneNumberFromString(mobile);
      if (!phoneNumber || !phoneNumber.isValid()) {
        console.error("Invalid phone number");
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Invalid phone number",
          text2: "Please use an international format (e.g., +1234567890)",
        });
        return;
      }

      const formattedNumber = phoneNumber.formatInternational();
      const currentUser = auth().currentUser;

      if (currentUser) {
        if (currentUser.phoneNumber === formattedNumber) {
          navigation.navigate("EnterName", {
            mobile: formattedNumber,
            updatePhoneNumber: true,
          });
          setLoading(false);
        }
        try {
          const confirmation = await auth().verifyPhoneNumber(formattedNumber);

          navigation.navigate("Confirm", {
            mobile: formattedNumber,
            confirmation: confirmation,
            updatePhoneNumber: true,
          });
          setLoading(false);
        } catch (error) {
          console.error("Failed to send OTP:", error);
          Toast.show({
            type: "error",
            text1: "Something went wrong",
            text2: `${error.message}`,
          });
          setLoading(false);
        }
      } else {
        // console.log("No Current User");

        try {
          const confirmation = await auth().signInWithPhoneNumber(
            formattedNumber
          );

          // setConfirmation(confirmation);

          setLoading(false);
          navigation.navigate("Confirm", {
            mobile: formattedNumber,
            confirmation: confirmation,
          });
        } catch (error) {
          console.error("Failed to send OTP:", error);
          Toast.show({
            type: "error",
            text1: "Something went wrong",
            text2: `${error.message}`,
          });
          setLoading(false);
        }
      }
    }
  }

  return (
    <DismissKeyboard>
      <KeyboardAvoidingView
        className="flex-1 items-center justify-center "
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <View className="flex-grow-1 h-10 items-center justify-center ">
          <Image
            source={SnapParkLogo}
            className="h-12 w-auto mt-[60]"
            style={{ resizeMode: "contain" }}
            accessibilityLabel="Snap Park Logo"
          />
        </View>
        <View
          className="flex-grow-1 items-center justify-end pb-[60]  w-full "
          style={{ paddingBottom: aspectRatio > 1.6 ? 60 : 90 }}
        >
          <View className="mb-1" style={{ width: width * 0.8, maxWidth: 400 }}>
            <Text className="font-semibold " style={{ color: theme.text }}>
              Please enter your mobile number:
            </Text>
          </View>

          <TextInput
            keyboardAppearance={theme === lightTheme ? "light" : "dark"}
            keyboardType="phone-pad"
            placeholder="E.g. +61 400 111 222"
            value={mobile}
            onChangeText={setMobile}
            className="w-full h-12 px-4 border  rounded-lg text-start my-2"
            style={{
              width: width * 0.8,
              shadowColor: "grey",
              shadowOpacity: 0.2,
              shadowOffset: { width: 1, height: 1 },
              color: theme.text,
              borderColor: theme.primary,
              maxWidth: 400,
            }}
            textContentType="telephoneNumber"
            autoComplete="tel"
            placeholderTextColor={theme.inputText}
          />

          <GradientBorderButton
            onPress={handleConfirmMobile}
            title="Continue"
            gradientColors={theme.primaryGradient}
            fill={false}
            textStyle={{ color: "#fff" }}
            loading={loading}
            loadingColor="#fff"
            style={{ maxWidth: 400 }}
          />
        </View>
      </KeyboardAvoidingView>
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
