import React, { useState } from "react";
import { View, Text, Platform, TouchableOpacity, Linking } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";
import { XCircleIcon, BookmarkSlashIcon } from "react-native-heroicons/outline";
import { BookmarkIcon } from "react-native-heroicons/solid";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { AntDesign } from "@expo/vector-icons";
import { lightTheme } from "Theme/theme";

const RenderParkingSpot = ({
  handleClosePress,
  mapBottomSheetState,
  setMapSheetState,
}) => {
  const theme = useRecoilValue(themeState);

  const spotData = mapBottomSheetState.parkingSpotData;
  if (!spotData) {
    return null;
  }
  const [bookMarked, setBookmarked] = useState(spotData.bookmarked);

  const handleToggleBookmark = async () => {
    const userId = auth().currentUser.uid; // Assuming the user is logged in
    const db = firestore();

    // Fetch the current alternativeParkingList
    const docRef = db.collection("employees").doc(userId);
    const doc = await docRef.get();
    if (doc.exists && doc.data().alternativeParkingList) {
      let currentList = doc.data().alternativeParkingList;

      // Find the spot in the list and toggle the bookmarked field
      const updatedList = currentList.map((spot) => {
        if (spot.placeId === spotData.placeId) {
          return { ...spot, bookmarked: !spot.bookmarked };
        }
        return spot;
      });

      // Update the database
      await docRef.update({
        alternativeParkingList: updatedList,
      });

      setBookmarked(!bookMarked);
    } else {
      console.log("Doc doesnt exist");
    }
  };

  const handleDirectionsPress = () => {
    const latLng = `${spotData.latitude},${spotData.longitude}`;
    const label = encodeURI(spotData.name);

    const url =
      Platform.OS === "ios"
        ? `maps:?q=${label}@${latLng}`
        : `google.navigation:q=${latLng}`;

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  return (
    <BottomSheetView>
      <View className="w-full mt-1 px-4">
        <View className="w-full flex flex-row items-center justify-between">
          <Text
            className="text-xl font-extrabold"
            style={{ color: theme.text }}
          >
            Car Park
          </Text>
          <TouchableOpacity onPress={handleClosePress}>
            {Platform.OS == "ios" ? (
              <XCircleIcon className="w-8 h-8" size={28} />
            ) : (
              <AntDesign name="closecircleo" size={20} color={theme.blue2} />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-lg font-normal" style={{ color: theme.infoText }}>
          {spotData.name}
        </Text>
      </View>
      <View className="w-full mt-2 px-4 flex-row items-center  justify-between">
        <TouchableOpacity
          className=" rounded-xl items-center justify-center h-[50] mr-1 px-4 border"
          style={{ borderColor: theme.blue2 }}
          onPress={handleToggleBookmark}
        >
          {bookMarked ? (
            <BookmarkIcon className="w-5 h-5 text-white" color={theme.blue2} />
          ) : (
            <BookmarkSlashIcon className="w-5 h-5" color={theme.blue2} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className=" rounded-xl items-center justify-center h-[50] ml-1"
          style={{ flex: 1, backgroundColor: lightTheme.blue2 }}
          onPress={handleDirectionsPress}
        >
          <Text className="text-[17px] font-bold" style={{ color: "#fff" }}>
            Directions
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
};

export default RenderParkingSpot;
