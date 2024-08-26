import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();
export const sharedStorage = new MMKV({
  id: `user-storage`,
  encryptionKey: "parksnap4067",
});
