import { useNetInfo } from '@react-native-community/netinfo';

export const useConnectivity = () => {
  const netInfo = useNetInfo();

  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
  const isChecking = netInfo.isConnected == null || netInfo.isInternetReachable == null;

  return {
    isOffline,
    isChecking,
    connectionType: netInfo.type,
  };
};
