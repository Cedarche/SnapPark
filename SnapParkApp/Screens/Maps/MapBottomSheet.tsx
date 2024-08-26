import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Platform, Keyboard, Dimensions } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRecoilValue, useRecoilState } from "recoil";
import { themeState, mapSheetState } from "Hooks/RecoilState";

import RenderParkingSpot from "./BottomSheetComponents/RenderParkingSpot";

import RenderList from "./BottomSheetComponents/RenderList";

const { height, width } = Dimensions.get("window");
const aspectRatio = height / width;

const MapBottomSheet = ({
  selectedSpotIndex,
  setSelectedSpotIndex,
  setNewMarker,
  region,
  alternateList,
}: any) => {
  const [mapBottomSheetState, setMapSheetState] = useRecoilState(mapSheetState);
  const [index, setIndex] = useState(mapBottomSheetState.index);

  useEffect(() => {
    setIndex(mapBottomSheetState.index);
  }, [mapBottomSheetState]);
  const spotData = mapBottomSheetState.parkingSpotData;
  const component = mapBottomSheetState.component;
  const theme = useRecoilValue(themeState);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // console.log(spotData.name.length);
  useEffect(() => {
    if (spotData && spotData.name.length >= 40) {
      setIndex(1);
    }
  }, [mapBottomSheetState]);

  const snapPoints = useMemo(() => {
    const standardSnapPoints = [
      Platform.OS === "ios" ? "31%" : "28%",
      "38%",
      "98%",
    ];
    const tabletSnapPoints = [
      Platform.OS === "ios" ? "21%" : "18%",
      "21%",
      "99%",
    ];

    return aspectRatio > 1.6 ? standardSnapPoints : tabletSnapPoints;
  }, [aspectRatio]);

  const handleCloseEnd = () => {
    Keyboard.dismiss();

    setMapSheetState({
      isOpen: false,
      parkingSpotData: null,
      index: 0,
      component: "RenderParkingSpots",
    });
    bottomSheetRef.current?.close(); // Smoothly close the BottomSheet
    setNewMarker(null);

    setSelectedSpotIndex(null);
  };

  const handleAnimateChange = useCallback(
    (fromIndex, toIndex) => {
      // console.log("To: ", toIndex);
      if (toIndex === 2) {
        setMapSheetState((prevState) => ({
          ...prevState,
          component: "RenderList",
        }));
        setNewMarker(null);
      } else if (
        toIndex === 1 &&
        mapBottomSheetState.parkingSpotData !== null
      ) {
        setMapSheetState((prevState) => ({
          ...prevState,
          component: "RenderParkingSpots",
        }));
        setNewMarker(null);
      } else if (
        toIndex === 0 &&
        mapBottomSheetState.parkingSpotData !== null
      ) {
        setMapSheetState((prevState) => ({
          ...prevState,
          component: "RenderParkingSpots",
        }));
        setNewMarker(null);
      } else if (
        toIndex === 0 &&
        mapBottomSheetState.parkingSpotData === null
      ) {
        console.log("Closing");
        bottomSheetRef.current?.close();
        setNewMarker(null);
      }
    },
    [region, setMapSheetState, setNewMarker, index]
  );

  const handleClosePress = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close(); 
    setTimeout(() => {
      setMapSheetState({
        isOpen: false,
        parkingSpotData: null,
        index: 0,
        component: "RenderParkingSpots",
      });
    }, 500);

    setNewMarker(null);
    setSelectedSpotIndex(null);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleStyle={{
        backgroundColor: theme.background,
        // display: "none",
        paddingTop: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        maxHeight: 10,
      }}
      index={index}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={handleCloseEnd}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onAnimate={handleAnimateChange}
      handleHeight={0}
      style={[
        styles.bottomSheetStyle,
        { backgroundColor: theme.background, borderRadius: 15 },
      ]}
    >
      <View
        style={[styles.contentContainer, { backgroundColor: theme.background }]}
      >
        {component === "RenderParkingSpots" ? (
          <RenderParkingSpot
            handleClosePress={handleClosePress}
            mapBottomSheetState={mapBottomSheetState}
            setMapSheetState={setMapSheetState}
          />
        ) : component === "RenderList" ? (
          <RenderList
            handleClosePress={handleClosePress}
            alternateList={alternateList}
            setIndex={setIndex}
          />
        ) : (
          <RenderList
            handleClosePress={handleClosePress}
            alternateList={alternateList}
            setIndex={setIndex}
          />
        )}
      </View>
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
    display: "flex",

    flex: 1,
    alignItems: "center",

    // paddingBottom: 40,
  },
  overlay: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "#ffcc00",
    zIndex: 4,
    backgroundColor: "transparent",
  },
  item: {
    maxWidth: "100%",
    padding: 16,
    marginBottom: 6,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MapBottomSheet;
