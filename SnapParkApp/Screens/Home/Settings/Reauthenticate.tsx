import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { themeState } from "Hooks/RecoilState";
import { useRecoilValue } from "recoil";
import auth from "@react-native-firebase/auth";

import { XCircleIcon } from "react-native-heroicons/outline";

const { width } = Dimensions.get("window");
import { GradientBorderButton } from "Screens/Reusable/GradientComponents";

const Reauthenticate = ({ handleCancel, handleConfirmDelete, isLoading }) => {
  const theme = useRecoilValue(themeState);
  const user = auth().currentUser;
  const mobile = user.phoneNumber;
  const numInputs = 6; // Number of OTP inputs
  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [disableResend, setDisableResend] = useState(true);
  const [timerValue, setTimerValue] = useState("Resend in 30");


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

    return () => clearInterval(countdown); // Cleanup the interval on component unmount
  }, []);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const getBoxes = () => {
    let boxes = [];
    for (let i = 0; i < numInputs; i++) {
      boxes.push(otp[i] || "");
    }
    return boxes;
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      setResendLoading(false);
      setDisableResend(true);
      setTimerValue("Resend in 30");
    } catch (error) {
      console.error("Error sending verification code: ", error);
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <View
        style={{ marginBottom: 0, width: width * 0.8, position: "relative" }}
      >
        <TouchableOpacity
          style={{ position: "absolute", top: 0, right: 0, zIndex: 50 }}
          onPress={() => handleCancel()}
        >
          <XCircleIcon size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", color: theme.text, fontSize: 22 }}>
          Verification Code
        </Text>
        <Text style={{ color: theme.infoText, marginTop: 16 }}>
          Please re-verify your account. We have sent a code to:{" "}
          <Text style={{ color: theme.mobileText }}>{mobile} </Text>
          please input it below to continue.
        </Text>
      </View>
      <TouchableOpacity
        style={{ width: "100%", marginVertical: 30 }}
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
            style={styles.hiddenInput}
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={numInputs}
          />
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", maxWidth: width * 0.8 }}>
        <GradientBorderButton
          onPress={handleResendCode}
          title={timerValue}
          gradientColors={["#ff0000", "#ff5858"]}
          fill={true}
          textStyle={{ color: "#ff0000" }}
          style={{ flex: 1, marginRight: 3 }}
          loading={resendLoading}
          loadingColor={"#ff0000"}
          disabled={disableResend}
        />
        <GradientBorderButton
          onPress={() => handleConfirmDelete(otp)}
          title="Delete Account"
          gradientColors={["#ff0000", "#ff0000"]}
          fill={false}
          textStyle={{ color: "#fff" }}
          style={{ flex: 1, marginLeft: 3 }}
          loading={isLoading}
          loadingColor="#fff"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Reauthenticate;

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
