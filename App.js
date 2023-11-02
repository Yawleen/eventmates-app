import { AppContext } from "./context/appContext";
import { useState, useMemo, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SCREEN_AUTHENTICATION,
  SCREEN_REGISTRATION,
  SCREEN_LOG_IN,
  SCREEN_HOME,
  AUTH_TOKEN,
} from "./globals";
import { getValueFor, deleteKey } from "./helpers/secureStore";
import { requestOptions } from "./helpers/requestOptions";
import { useFonts } from "expo-font";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Colors from "./globals/colors";
import AuthenticationScreen from "./screens/AuthenticationScreen";
import RegistrationScreen from "./screens/RegistrationScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import LogOutButton from "./components/IconButton";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    openSansRegular: require("./assets/fonts/OpenSans-Regular.ttf"),
    openSansBold: require("./assets/fonts/OpenSans-Bold.ttf"),
    montserratRegular: require("./assets/fonts/Montserrat-Regular.ttf"),
    montserratBold: require("./assets/fonts/Montserrat-Bold.ttf"),
  });
  const [isSignedIn, setIsSignedIn] = useState(false);

  const appContextValue = useMemo(
    () => ({
      isSignedIn,
      setIsSignedIn,
    }),
    [isSignedIn]
  );

  const deleteAuthToken = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/logout`,
        requestOptions("GET", token)
      )
        .then((response) => {
          response.json().then(() => deleteKey(AUTH_TOKEN));
        })
        .catch((error) => console.error(error));
    }
  };

  const checkAuthentication = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsSignedIn(true);
      return;
    }

    setIsSignedIn(false);
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      deleteAuthToken();
    }
  }, [isSignedIn]);

  return (
    <>
      <StatusBar style="dark" />
      {!fontsLoaded ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary900} />
        </View>
      ) : (
        <AppContext.Provider value={appContextValue}>
          <NavigationContainer>
            <Stack.Navigator>
              {!isSignedIn ? (
                <>
                  <Stack.Screen
                    name={SCREEN_AUTHENTICATION}
                    component={AuthenticationScreen}
                  ></Stack.Screen>
                  <Stack.Screen
                    name={SCREEN_LOG_IN}
                    component={LoginScreen}
                  ></Stack.Screen>

                  <Stack.Screen
                    name={SCREEN_REGISTRATION}
                    component={RegistrationScreen}
                  ></Stack.Screen>
                </>
              ) : (
                <Stack.Screen
                  name={SCREEN_HOME}
                  component={HomeScreen}
                  options={{
                    headerRight: () => (
                      <LogOutButton
                        icon="log-out"
                        size={22}
                        style={styles.logOutButton}
                        color="black"
                        onPress={() => setIsSignedIn(false)}
                      />
                    ),
                  }}
                ></Stack.Screen>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AppContext.Provider>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logOutButton: {
    marginRight: 15,
  },
});
