import { useLayoutEffect, useState } from "react";
import { AUTH_TOKEN } from "../globals";
import { getValueFor } from "../helpers/secureStore";
import { requestOptions } from "../helpers/requestOptions";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import IconButton from "./IconButton";

export default function ParticipateEventButton({
  eventId,
  isUserEvent,
  setIsUserEvent,
}) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = async (action) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);

      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/user-events`,
          requestOptions(action === "add" ? "POST" : "DELETE", token, {
            eventId: eventId,
          })
        ).then((response) => {
          response.json().then((data) => {
            if (action === "add") {
              setIsUserEvent(data.success);
            } else {
              setIsUserEvent(false);
            }
            Alert.alert(data.message);
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
      setIsLoading(false);
    }
  };

  const isAnUserEvent = async (eventId) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);
      try {
        fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/is-an-user-event?eventId=${eventId}`,
          requestOptions("GET", token)
        ).then((response) =>
          response.json().then((data) => setIsUserEvent(data.isParticipant))
        );
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    isAnUserEvent(eventId);
  }, [navigation]);

  return (
    <IconButton
      icon={isUserEvent ? "calendar-remove" : "calendar-plus"}
      size={27}
      color="#fff"
      {...(!isLoading && {
        onPress: isUserEvent
          ? () => handleOnClick("delete")
          : () => handleOnClick("add"),
      })}
    />
  );
}
