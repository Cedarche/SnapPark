import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Keyboard,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import SnapParkLogo from "../../../assets/SnapParkLogo.png";
import DismissKeyboard from "../../Reusable/DismissKeyboard";
import { GradientBorderButton } from "../../Reusable/GradientComponents";
import { PhoneIcon } from "react-native-heroicons/outline";
import { darkTheme, lightTheme } from "Theme/theme";
import Toast from "react-native-toast-message";
import { useRecoilValue, useRecoilState } from "recoil";
import { officeState, themeState, userState } from "Hooks/RecoilState";
import { styles } from "../AuthElements";
import {
  onAppleButtonPress,
  onGoogleButtonPress,
  createAccountWithEmail,
} from "Functions/AuthFunctions";
import { pushNotificationToken } from "Hooks/RecoilState";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "react-native-heroicons/outline";
import AppleLogoLight from "../../../assets/icons/Logo-SIWA-Logo-only-Black.png";
import AppleLogoDark from "../../../assets/icons/Logo-SIWA-Logo-only-White.png";
import auth from "@react-native-firebase/auth";

import { CommonActions } from "@react-navigation/native";

export default function RegisterScreen({ navigation }) {
  const [mobile, setMobile] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const expoPushToken = useRecoilValue(pushNotificationToken);
  const [userDetails, setUserDetails] = useRecoilState<any>(userState);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const theme = useRecoilValue(themeState);
  const animateHeight = useState(new Animated.Value(1))[0];
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [officeData, setOfficeData] = useRecoilState(officeState);
  const [officeDataLoaded, setOfficeDataLoaded] = useState(false);
  const [incorrectDetails, setIncorrect] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nextStep, setNextStep] = useState(null);

  const topVal = Platform.OS == "ios" ? 50 : 5;
  const user = auth().currentUser;

  useEffect(() => {
    if (officeData) {
      console.log("Office Data loaded", officeData);
      console.log(officeData.notificationSettings?.spotsRemainingValue);
      if (officeData?.notificationSettings?.spotsRemainingValue) {
        setOfficeDataLoaded(true);
      }
    }
  }, [officeData]);

  useEffect(() => {
    if (nextStep && officeDataLoaded && user && user.displayName) {
      setIsLoading(false);
      setNextStep(null);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeDrawer" }],
        })
      );
    }
  }, [officeDataLoaded, isLoading, navigation]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS == "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
        animateHeightOut();
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS == "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        // console.log(e.endCoordinates.height);
        setKeyboardHeight(0);
        setKeyboardVisible(false);
        animateHeightIn();
      }
    );

    return () => {
      keyboardWillHideListener.remove();
      keyboardWillShowListener.remove();
    };
  }, []);

  function animateHeightOut() {
    Animated.timing(animateHeight, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease), // Note the lowercase "e" in "easing"
      useNativeDriver: true,
    }).start();
  }

  function animateHeightIn() {
    Animated.timing(animateHeight, {
      toValue: 1,
      duration: 200,
      easing: Easing.inOut(Easing.ease), // Note the lowercase "e" in "easing"
      useNativeDriver: true,
    }).start();
  }

  const handleAppleRegister = async () => {
    try {
      const { nextStep } = await onAppleButtonPress(
        { navigation },
        expoPushToken,
        setIsLoading,
        setUserDetails
      );
      setNextStep(nextStep);
      if (nextStep === "EnterName") {
        navigation.navigate("EnterName");
      } else if (nextStep === "HomeDrawer") {
        console.log("Navigating to HomeDrawer!");
        if (officeDataLoaded) {
          console.log(officeDataLoaded);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "HomeDrawer" }],
            })
          );
        }
      }
    } catch (error) {
      console.log("Apple Sign In - Something went wrong...", error);
    }
  };
  // handleGoogleRegister onGoogleButtonPress
  const handleGoogleRegister = async () => {
    try {
      const { nextStep } = await onGoogleButtonPress(
        { navigation },
        expoPushToken,
        setIsLoading,
        setUserDetails
      );
      setNextStep(nextStep);
      if (nextStep === "EnterName") {
        navigation.navigate("EnterName");
      } else if (nextStep === "HomeDrawer") {
        console.log("Navigating to HomeDrawer!");
        if (officeDataLoaded) {
          console.log(officeDataLoaded);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "HomeDrawer" }],
            })
          );
        }
      }
    } catch (error) {
      console.log("Apple Sign In - Something went wrong...", error);
    }
  };

  const handleEmailRegister = () => {
    if (!name || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Incomplete Details",
        text2: "Please enter all fields",
      });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Incomplete Details",
        text2: "Passwords should be at least 6 characters",
      });
      return;
    }
    createAccountWithEmail(
      { navigation },
      name,
      email,
      password,
      expoPushToken,
      setIsLoading
    );
  };

  return (
    <DismissKeyboard>
      <KeyboardAvoidingView
        className="flex-1 items-center justify-center "
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <View className="flex-grow-1 h-10 items-center justify-center ">
          <Image
            source={SnapParkLogo}
            className="h-12 w-auto mt-[0]"
            style={{ resizeMode: "contain" }}
            accessibilityLabel="Snap Park Logo"
          />
        </View>
        <View className=" absolute  left-[20px] " style={{ top: topVal }}>
          <TouchableOpacity
            className="flex flex-row items-center"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon size={22} color={theme.primary} />
            <Text
              style={{
                color: theme.primary,
                fontSize: 16,
                marginLeft: 4,
                fontWeight: "500",
              }}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.container, { marginBottom: 30 }]}>
          <Animated.View
            style={[styles.SocialsContainer, { opacity: animateHeight }]}
          >
            <View style={styles.HeadingSubContainer}>
              <View style={[styles.Divider, { borderColor: theme.divider }]} />

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Metropolis-300",
                  color: "grey",
                  fontWeight: "bold",
                }}
              >
                Continue with:
              </Text>
              <View style={[styles.Divider, { borderColor: theme.divider }]} />
            </View>
            <View style={styles.SocialSubContainer}>
              <TouchableOpacity
                disabled={isKeyboardVisible ? true : false}
                style={[
                  styles.Social,
                  {
                    backgroundColor:
                      theme === lightTheme
                        ? lightTheme.background
                        : darkTheme.card,
                    borderColor: theme.socialBorder,
                  },
                ]}
                onPress={handleGoogleRegister}
              >
                <View
                  style={[
                    styles.gradient,
                    {
                      backgroundColor:
                        theme === lightTheme ? "#fff" : "#000000",
                      padding: 0,
                    },
                  ]}
                >
                  <Image
                    source={require("../../../assets/icons/google.png")}
                    style={styles.SocialImg}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isKeyboardVisible ? true : false}
                style={[
                  styles.Social,
                  {
                    backgroundColor: theme === lightTheme ? "#fff" : "#fff",
                    borderColor: theme.socialBorder,
                  },
                ]}
                onPress={handleAppleRegister}
              >
                <View
                  style={[
                    styles.gradient,
                    {
                      backgroundColor:
                        theme === lightTheme ? "#fff" : "#000000",
                      padding: 0,
                    },
                  ]}
                >
                  <Image
                    source={
                      theme === lightTheme ? AppleLogoLight : AppleLogoDark
                    }
                    style={[styles.SocialImg, { height: "100%" }]}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isKeyboardVisible ? true : false}
                style={[
                  styles.Social,
                  {
                    backgroundColor:
                      theme === lightTheme
                        ? lightTheme.background
                        : darkTheme.card,
                    borderColor: theme.socialBorder,
                  },
                ]}
                onPress={() => {
                  navigation.navigate("Mobile");
                }}
              >
                <View
                  style={[
                    styles.gradient,
                    {
                      backgroundColor:
                        theme === lightTheme ? "#fff" : "#000000",
                      padding: 0,
                    },
                  ]}
                >
                  {/* <MaterialCommunityIcons
                    name="cellphone-message"
                    size={24}
                    color={theme.icon}
                  /> */}
                  <PhoneIcon size={24} color={theme.icon} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.HeadingSubContainer}>
              <View style={[styles.Divider, { borderColor: theme.divider }]} />
              <Text
                style={{
                  fontSize: 14,
                  color: theme.divider,
                }}
              >
                Or
              </Text>
              <View style={[styles.Divider, { borderColor: theme.divider }]} />
            </View>
          </Animated.View>

          <View
            style={[
              styles.inputContainer,
              { bottom: isKeyboardVisible ? 45 : 0 },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme === lightTheme
                      ? lightTheme.background
                      : darkTheme.card,
                  shadowColor:
                    theme === lightTheme
                      ? lightTheme.background
                      : darkTheme.card,
                  color:
                    theme === lightTheme ? lightTheme.text : darkTheme.text,
                },
              ]}
              keyboardAppearance={theme === lightTheme ? "light" : "dark"}
              placeholder="Display Name"
              placeholderTextColor="#b3b3b3"
              value={name}
              onChangeText={setName}
              onPressIn={() => {
                setIncorrect(false);
              }}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme === lightTheme
                      ? lightTheme.background
                      : darkTheme.card,
                  shadowColor:
                    theme === lightTheme
                      ? lightTheme.background
                      : darkTheme.card,
                  color:
                    theme === lightTheme ? lightTheme.text : darkTheme.text,
                },
              ]}
              keyboardAppearance={theme === lightTheme ? "light" : "dark"}
              placeholder="Email"
              placeholderTextColor="#b3b3b3"
              value={email}
              onChangeText={setEmail}
              onPressIn={() => {
                setIncorrect(false);
              }}
            />
            <View
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme === lightTheme
                      ? lightTheme.background
                      : darkTheme.card,
                  shadowColor:
                    theme === lightTheme
                      ? lightTheme.background
                      : darkTheme.card,
                  padding: 0,
                  overflow: "hidden",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingRight: 10,
                },
              ]}
            >
              <TextInput
                style={{
                  display: "flex",
                  flex: 1,
                  borderWidth: 0,
                  padding: 12,
                  alignItems: "center",
                  color:
                    theme === lightTheme ? lightTheme.text : darkTheme.text,
                }}
                keyboardAppearance={theme === lightTheme ? "light" : "dark"}
                secureTextEntry={!isPasswordVisible}
                focusable={!isLoading}
                placeholder="Password"
                placeholderTextColor="#b3b3b3"
                value={password}
                onChangeText={setPassword}
                onPressIn={() => {
                  setIncorrect(false);
                }}
              />
              {password.length >= 1 && (
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {!isPasswordVisible ? (
                    <EyeIcon color={theme.divider} size={20} />
                  ) : (
                    <EyeSlashIcon color={theme.divider} size={20} />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {incorrectDetails ? (
              <Text style={styles.incorrectDetails}>
                Email or password is incorrect, reset password?
              </Text>
            ) : null}
            <GradientBorderButton
              onPress={handleEmailRegister}
              title="Register"
              disabled={isLoading}
              loading={isLoading}
              gradientColors={theme.primaryGradient}
              fill={false}
              textStyle={{ color: "#fff" }}
              style={{ marginTop: 4 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}
