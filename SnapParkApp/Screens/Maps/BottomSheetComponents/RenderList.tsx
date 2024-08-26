import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
// import { useFocusEffect } from "@react-navigation/native";

import { useRecoilValue, useRecoilState } from "recoil";
import { themeState } from "Hooks/RecoilState";
import {
  XCircleIcon,
  MapPinIcon,
  PencilSquareIcon,
  MinusCircleIcon,
} from "react-native-heroicons/outline";
import { lightTheme } from "Theme/theme";
import { mapSheetState } from "Hooks/RecoilState";
import { LinearGradient } from "expo-linear-gradient";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const RenderList = ({ handleClosePress, alternateList, setIndex }) => {
  const theme = useRecoilValue(themeState);
  const [edit, setEdit] = useState(false);
  const [mapBottomSheetState, setMapSheetState] = useRecoilState(mapSheetState);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const handleRemoveParkingSpots = async () => {
    const userId = auth().currentUser.uid; // Assuming the user is logged in
    const db = firestore();

    // Fetch the current alternativeParkingList
    const docRef = db.collection("employees").doc(userId);
    const doc = await docRef.get();
    setLoading(true);

    if (selectedItems.length > 0) {
      try {
        let currentList = [];
        if (doc.exists && doc.data().alternativeParkingList) {
          currentList = doc.data().alternativeParkingList;
        }

        // Filter out the selected items
        const updatedList = currentList.filter(
          (item) => !selectedItems.includes(item.placeId)
        );

        // Update the database
        await docRef.update({
          alternativeParkingList: updatedList,
        });

        // Optionally, you might want to reset your state or provide feedback to the user
        setSelectedItems([]);

        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Selected parking spots removed successfully!",
        });
        setLoading(false);
        setEdit(false);
        setMapSheetState((prevState) => ({
          ...prevState,
          isOpen: false,
        }));
      } catch (error) {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Unable to remove spots",
          text2: "Please try again",
        });
        setLoading(false);
        setEdit(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No items selected to remove",
      });
      setLoading(false);
      setEdit(false);
    }
  };

  const handleDirectionsPress = (spotData) => {
    const scheme = Platform.OS === "ios" ? "maps:" : "geo:";
    const latLng = `${spotData.latitude},${spotData.longitude}`;
    const label = encodeURI(spotData.name);
    const url =
      Platform.OS === "ios"
        ? `${scheme}?q=${label}@${latLng}`
        : `${scheme}${latLng}?q=${label}`;

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  // const handleAdd = () => {
  //   setIndex(1);
  //   setMapSheetState((prevState) => ({
  //     ...prevState,
  //     component: "AddParkingSpot",
  //   }));
  // };

  const selectItem = (item) => {
    setEdit(true); // Ensure edit mode is true when selecting items.
    const index = selectedItems.indexOf(item.placeId);
    if (index > -1) {
      setSelectedItems(selectedItems.filter((id) => id !== item.placeId));
    } else {
      setSelectedItems([...selectedItems, item.placeId]);
    }
  };

  const handlePress = (item) => {
    if (edit) {
      selectItem(item);
    } else {
      handleDirectionsPress(item);
    }
  };

  const handleCancel = () => {
    if (edit) {
      setSelectedItems([]);
      setEdit(false);
    } else {
      handleClosePress();
    }
  };

  const handleEditPress = () => {
    if (edit) {
      handleRemoveParkingSpots();
    }
    setEdit(!edit);
  };

  const renderItem = useCallback(
    ({ item }) => (
      <LinearGradient
        colors={theme.receiptContainer}
        className="border rounded-lg mx-3 my-1 p-1.5 py-2 flex-row items-center"
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderColor: selectedItems.includes(item.placeId)
            ? "#ff0062"
            : theme.listBorder,
        }}
      >
        <TouchableOpacity
          className=" flex-row items-center w-full"
          onPress={() => handlePress(item)}
        >
          <View className="mr-2 ml-1">
            {edit ? (
              <XCircleIcon size={26} color={"#ff0000"} />
            ) : (
              <MapPinIcon size={26} color={"#0084ff"} />
            )}
          </View>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.address, { color: theme.infoText }]}>
              {item.address}
            </Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    ),
    [edit, selectedItems, theme]
  );

  return (
    <View className="pb-[90px] flex-col  items-center">
      <View className="w-full mt-1 px-4">
        <View className="w-full flex flex-row items-center justify-between">
          <Text
            className="text-xl font-extrabold"
            style={{ color: theme.text }}
          >
            {edit ? "Select Items to delete:" : "Alternative spots list"}
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
      <BottomSheetFlatList
        ref={flatListRef}
        data={alternateList}
        keyExtractor={(item) => item.placeId}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={true}
      />
      <View className="flex flex-row gap-x-2 px-2 mb-2">
        <TouchableOpacity
          style={{ flex: 1, borderColor: edit ? theme.text : lightTheme.blue2 }}
          className="w-full border min-h-[50] rounded-xl items-center justify-center"
          onPress={handleCancel}
        >
          <Text
            className="text-[17px] font-bold"
            style={{ color: edit ? theme.text : lightTheme.blue2 }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: edit ? "#ff0000" : lightTheme.blue2,
          }}
          className="w-full min-h-[50]  rounded-xl flex-row items-center justify-center"
          // onPress={handleDirectionsPress}
          disabled={loading}
          onPress={handleEditPress}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={"#fff"} />
          ) : (
            <>
              <Text
                className="text-[17px] mr-2 font-bold"
                style={{ color: "#fff" }}
              >
                {edit ? "Delete" : "Edit"}
              </Text>
              {edit ? (
                <MinusCircleIcon size={23} color={"#fff"} />
              ) : (
                <PencilSquareIcon size={23} color={"#fff"} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RenderList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    // display: "flex",
    marginTop: 8,
    minWidth: "100%",
    paddingBottom: 60,
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#d43c3c",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  address: {
    fontSize: 14,
    marginTop: 2,
    color: "#fff",
  },
});
