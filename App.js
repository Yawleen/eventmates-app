import { AppContext } from "./context/appContext";
import { useState, useMemo, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  SCREEN_AUTHENTICATION,
  SCREEN_REGISTRATION,
  SCREEN_LOG_IN,
  AUTH_TOKEN,
  SCREEN_RESET_PASSWORD,
  SCREEN_EVENTS,
  SCREEN_EVENT,
  SCREEN_GROUPS,
  SCREEN_GROUP,
  SCREEN_GROUP_CHAT,
  SCREEN_CHAT_ROOM,
} from "./globals";
import { getValueFor, deleteKey } from "./helpers/secureStore";
import { requestOptions } from "./helpers/requestOptions";
import { useFonts } from "expo-font";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Colors from "./globals/colors";
import AuthenticationScreen from "./screens/AuthenticationScreen";
import RegistrationScreen from "./screens/RegistrationScreen";
import LoginScreen from "./screens/LoginScreen";
import LogOutButton from "./components/IconButton";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import EventsScreen from "./screens/EventsScreen";
import EventScreen from "./screens/EventScreen";
import IconButton from "./components/IconButton";
import ParticipateEventButton from "./components/ParticipateEventButton";
import GroupsScreen from "./screens/GroupsScreen";
import GroupScreen from "./screens/GroupScreen";
import GroupChatScreen from "./screens/GroupChatScreen";
import ChatRoomScreen from "./screens/ChatRoomScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    openSansRegular: require("./assets/fonts/OpenSans-Regular.ttf"),
    openSansBold: require("./assets/fonts/OpenSans-Bold.ttf"),
    montserratRegular: require("./assets/fonts/Montserrat-Regular.ttf"),
    montserratBold: require("./assets/fonts/Montserrat-Bold.ttf"),
  });
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isUserEvent, setIsUserEvent] = useState(false);

  DefaultTheme.colors.background = "#12121E";

  const appContextValue = useMemo(
    () => ({
      isSignedIn,
      setIsSignedIn,
    }),
    [isSignedIn]
  );

  const signOut = () => setIsSignedIn(false);

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

    signOut();
  };

  const EventDetailScreen = () => (
    <EventScreen isUserEvent={isUserEvent} setIsUserEvent={setIsUserEvent} />
  );

  const EventsTabNavigator = () => (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name={SCREEN_EVENTS}
        component={EventsScreen}
        options={{
          headerRight: () => (
            <LogOutButton
              icon="logout"
              size={24}
              style={styles.logOutButton}
              color="#111"
              onPress={signOut}
            />
          ),
          tabBarActiveTintColor: Colors.primary900,
          tabBarInactiveTintColor: "#111",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="music"
              size={26}
              color={focused ? Colors.primary900 : "#111"}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
      <Tab.Screen
        name={SCREEN_GROUP_CHAT}
        component={GroupChatScreen}
        options={{
          headerRight: () => (
            <LogOutButton
              icon="logout"
              size={24}
              style={styles.logOutButton}
              color="#111"
              onPress={signOut}
            />
          ),
          tabBarActiveTintColor: Colors.primary900,
          tabBarInactiveTintColor: "#111",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="wechat"
              size={30}
              color={focused ? Colors.primary900 : "#111"}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
    </Tab.Navigator>
  );

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
            <Stack.Navigator
              initialRouteName={({ routes }) => routes.sellerHome}
            >
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
                  <Stack.Screen
                    name={SCREEN_RESET_PASSWORD}
                    component={ResetPasswordScreen}
                  ></Stack.Screen>
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="Accueil"
                    component={EventsTabNavigator}
                    options={{ headerShown: false }}
                  ></Stack.Screen>
                  <Stack.Screen
                    name={SCREEN_EVENT}
                    component={EventDetailScreen}
                    options={({ route }) => ({
                      title: "",
                      headerBackTitleVisible: false,
                      headerTransparent: true,
                      headerTintColor: "#fff",
                      headerRight: () => (
                        <View style={styles.headerIconContainer}>
                          {/* <View style={styles.headerIcon}>
                            <IconButton
                              icon="heart-outline"
                              size={27}
                              color="#fff"
                            />
                          </View> */}
                          <ParticipateEventButton
                            eventId={route.params.data._id}
                            isUserEvent={isUserEvent}
                            setIsUserEvent={setIsUserEvent}
                          />
                        </View>
                      ),
                    })}
                  ></Stack.Screen>
                  <Stack.Screen
                    name={SCREEN_GROUPS}
                    component={GroupsScreen}
                    options={() => ({
                      headerBackTitleVisible: false,
                    })}
                  ></Stack.Screen>
                  <Stack.Screen
                    name={SCREEN_GROUP}
                    component={GroupScreen}
                    options={() => ({
                      headerBackTitleVisible: false,
                    })}
                  ></Stack.Screen>
                  <Stack.Screen
                    name={SCREEN_CHAT_ROOM}
                    component={ChatRoomScreen}
                    options={() => ({
                      headerBackTitleVisible: false,
                    })}
                  ></Stack.Screen>
                </>
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
  headerIconContainer: {
    flexDirection: "row",
    columnGap: 8,
    marginRight: 12,
  },
});
