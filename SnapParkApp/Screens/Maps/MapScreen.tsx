import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps"; // Make sure to import Marker
import { useRecoilState, useRecoilValue } from "recoil";
import {
  userState,
  officeState,
  mapSheetState,
  themeState,
} from "Hooks/RecoilState";
import { OfficeData } from "Hooks/Types";
import Wrapper from "Screens/Reusable/Wrapper";
import { MapPinIcon, BuildingOfficeIcon } from "react-native-heroicons/solid";
import { PlusCircleIcon, ListBulletIcon } from "react-native-heroicons/outline";

import { styles } from "./MapStyles";
import MapBottomSheet from "./MapBottomSheet";

import { lightTheme } from "Theme/theme";
import AlternateBottomSheet from "./AddAlternateSpotBottomSheet";

const MapScreen = () => {
  const theme = useRecoilValue(themeState);
  const [userDetails, setUserDetails] = useRecoilState<any>(userState);
  const [officeData, setOfficeData] = useRecoilState<OfficeData>(officeState);
  const [officeAddress, setOfficeAddress] = useState<any>();
  const [mapSheetData, setMapSheetState] = useRecoilState<any>(mapSheetState);
  const [selectedSpotIndex, setSelectedSpotIndex] = useState<number | null>(
    null
  );
  const [newMarker, setNewMarker] = useState(null);
  const [region, setRegion] = useState({
    latitude: officeAddress?.latitude,
    longitude: officeAddress?.longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const mapRef = useRef(null);
  const [addNewSpot, setAddNewSpot] = useState(false);

  useEffect(() => {
    if (officeData.address) {
      setOfficeAddress(officeData.address);
      setRegion({
        latitude: officeData.address.latitude,
        longitude: officeData.address.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
  }, [officeData]);

  useEffect(() => {
    if (userDetails.alternativeParkingList) {
      setMapSheetState({
        isOpen: true,
        parkingSpotData: userDetails.alternativeParkingList[0],
        index: 0,
        component: "RenderParkingSpots",
      });
      setSelectedSpotIndex(0);
    }
  }, []);

  const handleSpotOpen = (parkingSpot, index) => {
    setAddNewSpot(false);
    setMapSheetState({
      isOpen: true,
      parkingSpotData: parkingSpot,
      index: 0,
      component: "RenderParkingSpots",
    });
    setSelectedSpotIndex(index);

    // Animate map to the selected pin
    const region = {
      latitude: parkingSpot.latitude,
      longitude: parkingSpot.longitude,
      latitudeDelta: 0.015, 
      longitudeDelta: 0.015,
    };
    mapRef.current?.animateToRegion(region, 350); 
  };
  const handleRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);

  };

  const handleAddPress = () => {
    setMapSheetState({
      isOpen: false,
      parkingSpotData: null,
      index: 0,
      component: "RenderParkingSpots",
    });
    setAddNewSpot(true);
    setTimeout(() => {
      setNewMarker({
        latitude: region.latitude,
        longitude: region.longitude,

      });
    }, 220);
  };

  const handleEditPress = () => {
    console.log("Edit!");
  };

  const handleListPress = () => {
    setMapSheetState({
      isOpen: true,
      parkingSpotData: null,
      index: 2,
      component: "RenderList",
    });
  };

  if (!officeAddress) {
    return (
      <Wrapper heading="Nearby Parking Spots">
        <View className="w-full h-full flex items-center justify-center">
          <ActivityIndicator size={"small"} color={"#0099ff"} />
        </View>
      </Wrapper>
    );
  }

  return (
    <>
      <Wrapper heading="Alternative Parking">
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={region}
            onRegionChangeComplete={handleRegionChangeComplete}
            // customMapStyle={theme === lightTheme ? [] : darkMapStyle}
            userInterfaceStyle={theme === lightTheme ? "light" : "dark"}
          >
            <Marker
              coordinate={{
                latitude: officeAddress.latitude,
                longitude: officeAddress.longitude,
              }}
              title={officeData.office}
              tracksViewChanges={false}
            >
              <View className="items-center">
                <BuildingOfficeIcon size={26} color={theme.officePinColor} />
                <View className="bg-white rounded-full px-0.5">
                  <Text className="text-[10px] text-blue-600 font-bold">
                    Office
                  </Text>
                </View>
              </View>

              <Callout tooltip style={{ display: "none" }}></Callout>
            </Marker>

            {userDetails.alternativeParkingList.map((parkingSpot, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: parkingSpot.latitude,
                  longitude: parkingSpot.longitude,
                }}
                tracksViewChanges={false}
                onPress={() => handleSpotOpen(parkingSpot, index)}
              >
                <MapPinIcon
                  size={26}
                  color={
                    selectedSpotIndex === index
                      ? theme.selectedPinColor
                      : parkingSpot.pinColor
                      ? parkingSpot.pinColor
                      : theme.pinColor
                  }
                />

                <Callout tooltip style={{ display: "none" }}></Callout>
              </Marker>
            ))}
          </MapView>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  theme === lightTheme ? "#ffffffdc" : "#282b2fe4",
              },
            ]}
          >
            <TouchableOpacity onPress={handleAddPress}>
              <PlusCircleIcon size={30} color="#0062ff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleListPress} className="mt-2.5">
              <ListBulletIcon size={30} color="#0062ff" />
            </TouchableOpacity>
          </View>
          {newMarker && (
            <MapPinIcon
              size={26}
              color={selectedColor}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginLeft: -13,
                marginTop: -13,
              }}
            />
          )}
        </View>
      </Wrapper>
      {mapSheetData.isOpen && (
        <MapBottomSheet
          setSelectedSpotIndex={setSelectedSpotIndex}
          selectedSpotIndex={selectedSpotIndex}
          setNewMarker={setNewMarker}
          region={region}
          alternateList={userDetails?.alternativeParkingList}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      )}
      {addNewSpot && (
        <AlternateBottomSheet
          setNewMarker={setNewMarker}
          region={region}
          alternateList={userDetails?.alternativeParkingList}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          setAddNewSpot={setAddNewSpot}
        />
      )}
    </>
  );
};

export default MapScreen;
