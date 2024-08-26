import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Platform, Keyboard, Dimensions } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRecoilValue, useRecoilState } from "recoil";
import { themeState, mapSheetState } from "Hooks/RecoilState";

import AddParkingSpot from "./BottomSheetComponents/AddParkingSpot";

const { height, width } = Dimensions.get("window");
const aspectRatio = height / width;

const AlternateBottomSheet = ({
  setNewMarker,
  region,
  alternateList,
  selectedColor,
  setSelectedColor,
  setAddNewSpot,
}: any) => {
  const [mapBottomSheetState, setMapSheetState] = useRecoilState(mapSheetState);
  const [index, setIndex] = useState(mapBottomSheetState.index);
  const theme = useRecoilValue(themeState);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => {
    const standardSnapPoints = [
      Platform.OS == "ios" ? "37%" : "34%",
      Platform.OS == "ios" ? "70%" : "66%",
    ];
    const tabletSnapPoints = [
      Platform.OS == "ios" ? "25%" : "25%",
      Platform.OS == "ios" ? "48%" : "48%",
    ];

    return aspectRatio > 1.6 ? standardSnapPoints : tabletSnapPoints;
  }, [aspectRatio]);

  const handleCloseEnd = () => {
    Keyboard.dismiss();
    setTimeout(() => setAddNewSpot(false), 500);

    bottomSheetRef.current?.close();
    setNewMarker(null);
  };

  const handleClosePress = () => {
    Keyboard.dismiss();
    setTimeout(() => setAddNewSpot(false), 500);

    bottomSheetRef.current?.close();

    setNewMarker(null);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleStyle={{
        backgroundColor: theme.background,

        paddingTop: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        maxHeight: 10,
      }}
      index={index}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={handleCloseEnd}
      handleHeight={0}
      style={[
        styles.bottomSheetStyle,
        { backgroundColor: theme.background, borderRadius: 15 },
      ]}
    >
      <BottomSheetView
        style={[styles.contentContainer, { backgroundColor: theme.background }]}
      >
        <AddParkingSpot
          handleClosePress={handleClosePress}
          mapBottomSheetState={mapBottomSheetState}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          index={index}
          setIndex={setIndex}
          alternateList={alternateList}
          region={region}
        />
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

export default AlternateBottomSheet;
