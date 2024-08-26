import React, { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';

const ExternalLinkOpener = ({ url }) => {
  const navigation = useNavigation();

  useEffect(() => {
    const openLink = async () => {
      await WebBrowser.openBrowserAsync(url);
      navigation.goBack(); 
    };

    openLink();
  }, [url, navigation]);

  return null; // This component doesn't render anything
};

export default ExternalLinkOpener;
