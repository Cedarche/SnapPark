import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { themeState, bottomSheetState, officeState } from "Hooks/RecoilState";
import { useRecoilValue, useRecoilState } from "recoil";

const SpotList = ({ sortedData,  navigation  }) => {
  const theme = useRecoilValue(themeState);
  const officeData = useRecoilValue(officeState)

  const renderItem = ({ item, index }) => {
    const statusClasses = item.available
      ? "bg-green-100 fill-green-500 border border-green-100"
      : "bg-red-100 fill-red-500 border border-red-100";

    const backgroundColor = item.available
      ? "rgba(46, 255, 46, 0.075)" // Available
      : "rgba(255, 86, 56, 0.075)"; // Taken

    const borderColor = item.available ? "#1dff43" : "#ff8787"; // green-400, red-400
    const fillColor = item.available ? "#00ff2630" : "#fd000020";

    const statusText = item.available ? "Available" : "Taken";

    const handleOpenSpot = () => {
        navigation.navigate('NoUserSpot', {
            officeData: officeData,
            spotDetails: item,
          });
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={handleOpenSpot}

        style={[styles.item, { backgroundColor, borderColor }]}
      >
        <Text
          className="text-xl font-bold min-w-20"
          style={{ color: theme.text }}
        >
          {item.name}
        </Text>
        <View className="pl-2">
          <Text className="text-sm font-light" style={{ color: theme.text }}>
            {item?.lastToggledDate && !item.available
              ? new Date(item.lastToggledDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : null}
          </Text>
        </View>
        <View
          className={`flex-row  items-center gap-x-1.5 rounded-md px-2 py-2  `}
          style={{ backgroundColor: fillColor }}
        >
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: borderColor }}
          />
          <Text className="font-semibold" style={{ color: theme.text }}>
            {statusText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sortedData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `spot-${index}-${item.lastToggledDate}`}
      contentContainerStyle={{display: 'flex', flex: 1, width: '100%', }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
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

export default SpotList;
