import { useLayoutEffect, useState } from "react";
import { AUTH_TOKEN } from "../globals";
import { getValueFor } from "../helpers/secureStore";
import { requestOptions } from "../helpers/requestOptions";
import jwt_decode from "jwt-decode";
import { Alert } from "react-native";
import IconButton from "./IconButton";

export default function ParticipateEventButton({ eventId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUserEvent, setIsUserEvent] = useState(false);

  const addEvent = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);

      try {
        const decodedToken = await jwt_decode(token);

        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/user-events`,
          requestOptions("POST", token, {
            userId: decodedToken.userId,
            eventId: eventId,
          })
        ).then((response) => {
          response.json().then((data) => {
            setIsUserEvent(data.success);
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
        const decodedToken = await jwt_decode(token);

        fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/is-an-user-event?userId=${decodedToken.userId}&eventId=${eventId}`,
          requestOptions("GET", token)
        ).then((response) =>
          response.json().then((data) => setIsUserEvent(data.isParticipant))
        );
      } catch {
        setIsUserEvent(false);
      }
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    isAnUserEvent(eventId);
  }, []);

  return (
    <IconButton
      icon={isUserEvent ? "calendar-remove" : "calendar-plus"}
      size={27}
      color="#fff"
      {...(!isLoading && {
        onPress: isUserEvent
          ? () => console.log("suppression de l'événement")
          : addEvent,
      })}
    />
  );
}
