import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Easing,
  Animated,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useRecoilValue } from "recoil";
import { userState, officeState, themeState } from "Hooks/RecoilState";
import { COLORS, lightTheme } from "Theme/theme";

import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { joinNotificationList } from "../Functions/JoinNotificationList";
import {
  XCircleIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  BellAlertIcon,
} from "react-native-heroicons/outline";

import {
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
} from "@expo/vector-icons";

const JoinListModal = ({ navigation, showModal, setShowModal }) => {
  const theme = useRecoilValue(themeState);
  const officeData = useRecoilValue(officeState);
  const userData = useRecoilValue(userState);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const animateHeight = useRef(new Animated.Value(0)).current;

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(animateHeight, {
          toValue: -e.endCoordinates.height + 30,
          duration: 250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(animateHeight, {
          toValue: 0,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillHideListener.remove();
      keyboardWillShowListener.remove();
    };
  }, []);

  const handlePress = async () => {
    await joinNotificationList(
      navigation,
      setLoading,
      name,
      userData,
      officeData
    );
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      hardwareAccelerated={true}
    >
      <View
        style={[
          styles.centeredView,
          {
            backgroundColor:
              theme === lightTheme
                ? "rgba(113, 113, 113, 0.534)"
                : "rgba(0, 0, 0, 0.641)",
          },
        ]}
      >

        <Animated.View
          style={[
            styles.modalView,
            {
              backgroundColor: theme.background,
              shadowColor: theme.shadowColor,
              transform: [{ translateY: animateHeight }],
            },
          ]}
        >
          <View className="w-full mt-0">
            <View className="w-full flex flex-row items-center justify-between">
              <View className="flex items-center flex-row">
                <BellAlertIcon size={22} color={theme.text} />
                <Text
                  className="text-xl ml-2 font-extrabold"
                  style={{ color: theme.text }}
                >
                  Join the notification list?
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseModal}>
                {Platform.OS === "ios" ? (
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
            className="w-full mt-2 text-lg font-normal"
            style={{ color: theme.infoText }}
          >
            Opt-in to be notified when the office parking lot is full.
          </Text>
          <View className="w-full flex-row mt-4">
            <View
              className="flex-row items-center rounded-md px-2 py-2 mr-1 border border-gray-400"
              style={{ backgroundColor: theme.badge }}
            >
              {Platform.OS === "ios" ? (
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
                {officeData && officeData.company}
              </Text>
            </View>
            <View
              className="flex-row items-center rounded-md px-2 py-2 mr-1 border border-gray-400"
              style={{ backgroundColor: theme.badge }}
            >
              {Platform.OS === "ios" ? (
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
                {officeData && officeData.office}
              </Text>
            </View>
          </View>
          <TextInput
            className="mt-4"
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                shadowColor: theme.shadowColor,
                color: theme.text,
              },
            ]}
            keyboardAppearance={theme === lightTheme ? "light" : "dark"}
            placeholder="Name"
            placeholderTextColor="#b3b3b3"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: theme.blue2 }}
            className="w-full min-h-[50] max-h-[50] mt-1 rounded-xl items-center justify-center"
            onPress={handlePress}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-[17px] font-bold" style={{ color: "#fff" }}>
                Confirm
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
        </Animated.View>
      </View>
      <Toast config={toastConfig} />
    </Modal>
  );
};

export default JoinListModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    paddingBottom: 40,
    justifyContent: "flex-end",
    alignItems: "center",

    // backgroundColor: "rgba(0, 0, 0, 0.676)", // Optional: for darkened background effect
  },
  input: {
    display: "flex",
    width: "100%",

    height: 48,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grey,
    shadowOffset: { width: 1, height: 1 },

    padding: 12,
    shadowOpacity: 0.1,
    elevation: 1,
    marginVertical: 5,
  },
  modalView: {
    width: "95%", // Control width to whatever you prefer
    height: 360, // Set height to 40% of screen
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

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#1eff00",
        borderRadius: 8,
        marginTop: 5,
        // overflow: "hidden",
        // borderBottomRightRadius: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#f2f2f2",
        // overflow: "hidden",
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#474747",
      }}
      text2Style={{
        fontSize: 12,
        color: "#6e6e6e",
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ff0000",
        borderRadius: 8,
        marginTop: 5,
        // overflow: "hidden",
        // borderBottomRightRadius: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#ffe8e8",
        // overflow: "hidden",
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#474747",
      }}
      text2Style={{
        fontSize: 12,
        color: "#6e6e6e",
      }}
    />
  ),
  notification: (props) => (
    <BaseToast
      {...props}
      position="bottom"
      style={{
        borderLeftColor: "#007BFF", // Custom color for notification type
        borderRadius: 8,
        marginBottom: 5, // Adjust margin to ensure visibility at the bottom
        width: "90%", // Set width to fit content within a reasonable space
        alignSelf: "center", // Center toast at the bottom
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#f8fcfd", // Light blue background for a notification look
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#003a60", // Dark blue for text
      }}
      text2Style={{
        fontSize: 12,
        color: "#007BFF", // Lighter blue for secondary text
      }}
      leadingIcon={<BellAlertIcon color={"#FFF"} size={30} />} // Optional icon
      trailingIcon={<BellAlertIcon color={"#FFF"} size={30} />} // Optional icon
    />
  ),
};
