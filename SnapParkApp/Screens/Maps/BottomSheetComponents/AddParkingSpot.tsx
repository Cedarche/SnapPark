import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";
import { XCircleIcon } from "react-native-heroicons/outline";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { AntDesign } from "@expo/vector-icons";

import { lightTheme } from "Theme/theme";
import ColorPicker, { Swatches, Preview } from "reanimated-color-picker";
import Toast from "react-native-toast-message";

const AddParkingSpot = ({
  handleClosePress,
  mapBottomSheetState,
  selectedColor,
  setSelectedColor,
  index,
  setIndex,
  alternateList,
  region,
}) => {
  const theme = useRecoilValue(themeState);
  const [newSpotName, setNewSpotName] = useState("");
  const [showModal, setShowModal] = useState(false);
  // const [selectedColor, setSelectedColor] = useState("#ff0000");

  const onSelectColor = ({ hex }) => {
    setSelectedColor(hex);
    setShowModal(false);
  };
  const [loading, setLoading] = useState(false);

  const handleSaveParkingSpot = async () => {
    const userId = auth().currentUser.uid; // Assuming the user is logged in
    const db = firestore();

    // Fetch the current alternativeParkingList
    const docRef = db.collection("employees").doc(userId);
    const doc = await docRef.get();
    setLoading(true);
    if (region && newSpotName) {
      try {
        let currentList = [];
        if (doc.exists && doc.data().alternativeParkingList) {
          currentList = doc.data().alternativeParkingList;
        }

        // Create new parking spot data
        const newParkingSpot = {
          address: "Custom alternative spot", // Update this field as per your requirement
          latitude: region.latitude,
          longitude: region.longitude,
          name: newSpotName,
          placeId: generateRandomId(),
          pinColor: selectedColor,
          bookmarked: false,
        };

        // Append new spot to the list
        const updatedList = [...currentList, newParkingSpot];

        // Update the database
        await docRef.update({
          alternativeParkingList: updatedList,
        });

        // Optionally, you might want to reset your state or provide feedback to the user
        setNewSpotName("");

        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "New parking spot added successfully!",
        });
        setLoading(false);

        handleClosePress();
      } catch (error) {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Unable to add spot",
          text2: "Please try again",
        });
        setLoading(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a name",
      });
      setLoading(false);
    }
  };

  const handleIndexChange = (newIndex) => {
    // Prevent rapid multiple updates

    if (index !== newIndex) {
      setTimeout(() => {
        setIndex(newIndex);
      }, 100); // Delay can help with preventing rapid state changes
    }
  };

  return (
    <>
      <View className="w-full mt-1 px-4">
        <View className="w-full flex flex-row items-center justify-between">
          <Text
            className="text-xl font-extrabold"
            style={{ color: theme.text }}
          >
            Add Alternative spot
          </Text>
          <TouchableOpacity onPress={handleClosePress}>
            {Platform.OS == "ios" ? (
              <XCircleIcon className="w-8 h-8" size={28} />
            ) : (
              <AntDesign name="closecircleo" size={20} color={theme.blue2} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full mt-3 px-4 flex-col   ">
        <View className="w-full flex flex-row items-center">
          <View className="flex-col" style={{ display: "flex", flex: 1 }}>
            <View className="-mb-1">
              <Text className="font-semibold" style={{ color: theme.text }}>
                Please enter a name:
              </Text>
            </View>

            <TextInput
              keyboardType="default"
              keyboardAppearance={theme === lightTheme ? "light" : "dark"}
              placeholder="E.g. Secret Parking Spot"
              value={newSpotName}
              onChangeText={setNewSpotName}
              style={[
                styles.inputContainer,
                { color: theme.text, borderColor: theme.inputBorder },
              ]}
              placeholderTextColor={"#cccccc"}
              onPressIn={() => handleIndexChange(1)}
              onSubmitEditing={() => handleIndexChange(0)}
            />
          </View>
          <View className="flex-col ml-2">
            <View className="-mb-1">
              <Text className="font-semibold" style={{ color: theme.text }}>
                Color:
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="w-full h-12 px-6 border border-gray-300 rounded-lg text-start my-2"
              style={{ backgroundColor: selectedColor }}
            ></TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: lightTheme.blue2 }}
          className="w-full min-h-[50]  rounded-xl items-center justify-center"
          onPress={handleSaveParkingSpot}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={"#fff"} />
          ) : (
            <Text className="text-[17px] font-bold" style={{ color: "#fff" }}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        hardwareAccelerated={true}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              {
                backgroundColor: theme.background,
                shadowColor: theme.shadowColor,
              },
            ]}
          >
            <ColorPicker
              style={{ width: "100%" }} // Ensure ColorPicker fills the modal view
              value="red"
              onComplete={onSelectColor}
            >
              {/* Components like <Swatches /> go here */}
              <Preview style={{ marginBottom: 20 }} />

              <Swatches colors={customColors} />
            </ColorPicker>

            {/* <TouchableOpacity
              style={{ flex: 1, backgroundColor: lightTheme.blue2 }}
              className="w-full min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
              onPress={() => setShowModal(false)}
            >
              <Text className="text-[17px] font-bold" style={{ color: "#fff" }}>
                Save Colour
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={{ flex: 1, borderColor: lightTheme.blue2 }}
              className="w-full border min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
              onPress={() => setShowModal(false)}
            >
              <Text
                className="text-[17px] font-bold"
                style={{ color: lightTheme.blue2 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AddParkingSpot;

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%", // w-full
    height: 48, // h-12 (height in React Native is in pixels)
    paddingHorizontal: 16, // px-4 (padding in React Native is in pixels)
    borderWidth: 1, // border

    borderRadius: 8, // rounded-lg
    justifyContent: "flex-start", // text-start
    marginVertical: 8, // my-2 (margin in React Native is in pixels)
  },
  centeredView: {
    flex: 1,
    paddingBottom: 100,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Optional: for darkened background effect
  },
  modalView: {
    width: "80%", // Control width to whatever you prefer
    height: 280, // Set height to 40% of screen
    backgroundColor: "white",
    display: "flex",
    borderRadius: 20, // Adjust this value as needed
    padding: 20, // Add padding inside the modal
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

const customColors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#607d8b",
];

const generateRandomId = () => {
  return Math.random().toString().substr(2, 10);
};
