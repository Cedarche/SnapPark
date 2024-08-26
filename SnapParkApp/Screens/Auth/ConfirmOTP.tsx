import React, { useState, useRef, RefObject, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import SnapParkLogo from "../../assets/SnapParkLogo.png";
import DismissKeyboard from "../Reusable/DismissKeyboard";
import { GradientBorderButton } from "../Reusable/GradientComponents";
import { COLORS, lightTheme } from "Theme/theme";
import auth from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";
import firestore from "@react-native-firebase/firestore";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, pushNotificationToken } from "Hooks/RecoilState";
import { firebase } from "@react-native-firebase/functions";
import { CommonActions } from "@react-navigation/native";
import { themeState } from "Hooks/RecoilState";

const { height, width } = Dimensions.get("window");
const aspectRatio = height / width;

interface ConfirmOTPProps {
  route: any;
  navigation: any;
}

const ConfirmOTP: React.FC<ConfirmOTPProps> = ({ route, navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useRecoilState<any>(userState);
  const expoPushToken = useRecoilValue(pushNotificationToken);
  const [disableResend, setDisableResend] = useState(true);
  const [otp, setOtp] = useState("");

  const [timerValue, setTimerValue] = useState("Resend in 30");
  const theme = useRecoilValue(themeState);

  const numInputs = 6; // Number of OTP inputs

  const { mobile, confirmation, updatePhoneNumber } = route.params;

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    let timer = 30; // Start the timer at 30 seconds
    const countdown = setInterval(() => {
      timer -= 1;
      setTimerValue(`Resend in ${timer}`);

      if (timer === 0) {
        clearInterval(countdown);
        setTimerValue("Resend");
        setDisableResend(false);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const inputRef = useRef(null);

  // Helper to make the OTP look like it's in separate inputs
  const getBoxes = () => {
    let boxes = [];
    for (let i = 0; i < numInputs; i++) {
      boxes.push(otp[i] || "");
    }
    return boxes;
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleConfirmOTP();
    }
  }, [otp]);

  const handleConfirmOTP = async () => {
    setLoading(true);

    if (otp.length === 6) {
      try {
        if (auth().currentUser && auth().currentUser.phoneNumber === mobile) {
          navigation.navigate("EnterName", { mobile });
          setLoading(false);
          return;
        }
        if (!confirmation) {
          console.log("Somethings wrong...");
          return;
        }

        if (updatePhoneNumber) {
          const credential = auth.PhoneAuthProvider.credential(
            confirmation.verificationId,
            otp
          );

          await auth().currentUser.linkWithCredential(credential);
          navigation.navigate("EnterName", { mobile });
          setLoading(false);
          return;
        }

        const credential = await confirmation.confirm(otp);
        const uid = credential.user.uid;
        if (credential.additionalUserInfo.isNewUser) {
          navigation.navigate("EnterName", { mobile });
        } else {
          const docRef = firestore().collection("employees").doc(uid);
          const documentSnapshot = await docRef.get();
          if (documentSnapshot.exists) {
            const employeeData = documentSnapshot.data();

            if (
              employeeData.company &&
              employeeData.expoPushToken !== expoPushToken
            ) {
              await docRef.update({ expoPushToken: expoPushToken });
              employeeData.expoPushToken = expoPushToken;

              const addToNotificationList = firebase
                .app()
                .functions("europe-west1")
                .httpsCallable("addToNotificationList");

              const result = await addToNotificationList({
                userId: employeeData?.company,
                officeId: employeeData?.office,
                newEmployee: employeeData,
              });

              console.log("Updated expoPushToken in Firestore.", result.data);
            } else if (
              credential.user.phoneNumber &&
              (!employeeData.mobile ||
                !employeeData.company ||
                !employeeData.office)
            ) {
              navigation.navigate("EnterName", {
                mobile: credential.user.phoneNumber,
              });
              return;
            }

            setUserDetails(employeeData);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "HomeDrawer" }],
              })
            );
          } else {
            navigation.navigate("EnterName", { mobile });
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Invalid code or verification failed:", error);

        let errorMessage = "Verification Error";
        switch (error.code) {
          case "auth/invalid-verification-code":
            errorMessage = "The verification code you entered is invalid. ";
            break;
          case "auth/missing-verification-code":
            errorMessage = "The verification code is missing.";
            break;
          case "auth/code-expired":
            errorMessage =
              "The verification code has expired. Please request a new code.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Please try again later.";
            break;
          case "auth/quota-exceeded":
            errorMessage =
              "SMS message quota exceeded. Please try again later.";
            break;
          case "auth/user-disabled":
            errorMessage =
              "This user account has been disabled. Please contact support.";
            break;
          default:
            errorMessage = `Something went wrong: ${error.message}`;
            break;
        }

        Toast.show({
          type: "error",
          text1: "Verification Error",
          text2: errorMessage,
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Incomplete OTP",
        text2: "Please enter the full 6-digit code.",
      });
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true);
    try {
      const newConfirmation = await auth().signInWithPhoneNumber(mobile, true); // true for forceResendingToken
      route.params.confirmation = newConfirmation; // Replace the old confirmation object
      console.log("OTP resent!");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      Toast.show({
        type: "error",
        text1: "Resend Error",
        text2: `Failed to resend OTP: ${error.message}`,
      });
    } finally {
      setResendLoading(false);
      setDisableResend(true);
      setTimerValue("Resend in 30");
      // Restart the timer
      let timer = 30;
      const countdown = setInterval(() => {
        timer -= 1;
        setTimerValue(`Resend in ${timer}`);
        if (timer === 0) {
          clearInterval(countdown);
          setTimerValue("Resend");
          setDisableResend(false);
        }
      }, 1000);
    }
  };

  return (
    <DismissKeyboard>
      <KeyboardAvoidingView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: aspectRatio > 1.6 ? 30 : 90,
            width: "100%",
          }}
        >
          <View style={{ marginBottom: 4, width: width * 0.8, maxWidth: 400 }}>
            <Text
              style={{ fontWeight: "bold", color: theme.text, fontSize: 18 }}
            >
              Verification Code
            </Text>
            <Text style={{ color: theme.infoText, marginTop: 12 }}>
              We have sent a verification code to:
            </Text>
            <Text style={{ color: theme.mobileText }}>
              {mobile}{" "}
              <Text style={{ color: theme.infoText, marginTop: 0 }}>
                please input it below to continue.
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={{ width: "80%", marginVertical: 36, maxWidth: 400 }}
            onPress={() => inputRef.current.focus()}
          >
            <View style={styles.boxesContainer}>
              {getBoxes().map((char, index) => (
                <View key={index} style={styles.box}>
                  <Text style={[styles.boxText, { color: theme.text }]}>
                    {char}
                  </Text>
                </View>
              ))}
              <TextInput
                ref={inputRef}
                keyboardAppearance={theme === lightTheme ? "light" : "dark"}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={numInputs}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
              />
            </View>
          </TouchableOpacity>

          <View
            style={{ flexDirection: "row", width: width * 0.8, maxWidth: 400 }}
          >
            <GradientBorderButton
              onPress={resendOTP}
              title={timerValue}
              gradientColors={lightTheme.primaryGradient}
              fill={true}
              textStyle={{ color: COLORS.primary }}
              style={{ flex: 1, marginRight: 3 }}
              loading={resendLoading}
              loadingColor={COLORS.primary}
              disabled={disableResend}
            />
            <GradientBorderButton
              onPress={handleConfirmOTP}
              title="Confirm"
              gradientColors={lightTheme.primaryGradient}
              fill={false}
              textStyle={{ color: "#fff" }}
              style={{ flex: 1, marginLeft: 3 }}
              loading={loading}
              loadingColor="#fff"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </DismissKeyboard>
  );
};

const styles = StyleSheet.create({
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  box: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  boxText: {
    fontSize: 24,
    textAlign: "center",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default ConfirmOTP;
