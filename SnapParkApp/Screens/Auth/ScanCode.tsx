import React, { useMemo, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";
import { XCircleIcon } from "react-native-heroicons/outline";
import Toast from "react-native-toast-message";
import { CameraView, Camera } from "expo-camera/next";

const ScanCodeSheet = ({
  setShowScanCode,
  setLinkingCode,
  setCompanyID,
  setOfficeID,
}: any) => {
  const snapPoints = useMemo(() => ["50%"], []);

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

    // console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    try {
      const formattedData = data.replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
      const jsonData = JSON.parse(formattedData);
      setLinkingCode(jsonData.linkingCode); // Assuming you want to use the linking code
    } catch (error) {
      // console.error("Failed to parse barcode data:", error);
      Toast.show({
        type: "error",
        text1: "Somethign went wrong...",
        text2: "Please scan the QR code again.",
      });
    }
    handleClosePress();
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
        backgroundColor: theme.modalBackground,
        // display: "none",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
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
        style={[
          styles.contentContainer,
          { backgroundColor: theme.modalBackground },
        ]}
      >
        <View
          className="flex-1 relative border w-full rounded-2xl mt-2 bg-gray-50 overflow-hidden items-center justify-center"
          style={{ overflow: "hidden" }}
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
      </BottomSheetView>
    </BottomSheet>
  );
};

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

export default ScanCodeSheet;
