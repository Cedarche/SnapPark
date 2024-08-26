import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";
import { XCircleIcon } from "react-native-heroicons/outline";
import Toast from "react-native-toast-message";
import { CameraView, Camera } from "expo-camera/next";
import { GradientBorderButton } from "Screens/Reusable/GradientComponents";
import { lightTheme } from "Theme/theme";

const JoinNewOffice = ({
  setShowScanCode,
  linkingCode,
  setLinkingCode,
  loading,
  handleChangeOffice,
}: any) => {
  const snapPoints = useMemo(() => ["100%"], []);

  const theme = useRecoilValue(themeState);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const handleCloseEnd = () => {
    setShowScanCode(false);
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    try {
      const formattedData = data.replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
      const jsonData = JSON.parse(formattedData);
      console.log(jsonData?.linkingCode);
      setLinkingCode(jsonData.linkingCode);
      //   setCompanyID(jsonData.userID);
      //   setOfficeID(jsonData.officeID);
    } catch (error) {
      console.error("Failed to parse barcode data:", error);
      Toast.show({
        type: "error",
        text1: "Somethign went wrong...",
        text2: "Please scan the QR code again.",
      });
    }
    // handleClosePress();
  };

  const handleClosePress = () => {
    bottomSheetRef.current?.close(); // Smoothly close the BottomSheet
  };

  if (hasPermission === null) {
    return null;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleStyle={{
        backgroundColor: theme.card,
        // display: "none",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        maxHeight: 10,
      }}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={handleCloseEnd}
      handleHeight={0}
      style={[
        styles.bottomSheetStyle,
        { backgroundColor: theme.card, borderRadius: 40 },
      ]}
    >
      <BottomSheetView
        style={[styles.contentContainer, { backgroundColor: theme.card }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, width: "100%" }}
        >
          <View className="mb-1 mt-2 ml-1 w-full">
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
              onPress={handleClosePress}
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
            onPress={handleChangeOffice}
            title="Continue"
            gradientColors={lightTheme.primaryGradient}
            fill={false}
            width={"100%"}
            textStyle={{ color: "#fff" }}
            loading={loading}
            loadingColor="#fff"
          />
          <GradientBorderButton
            onPress={handleClosePress}
            title="Cancel"
            gradientColors={lightTheme.primaryGradient}
            fill={true}
            width={"100%"}
            textStyle={{ color: lightTheme.primary }}
            loading={false}
            loadingColor="#fff"
          />
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
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

export default JoinNewOffice;
