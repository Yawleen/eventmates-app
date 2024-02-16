import { useEffect, useState } from "react";
import { Alert } from "react-native";
import IconButton from "./IconButton";
import { AUTH_TOKEN } from "../globals";
import { getValueFor } from "../helpers/secureStore";
import jwtDecode from "jwt-decode";
import { requestOptions } from "../helpers/requestOptions";


export default function ParticipateEventButton({ eventId }) {
  const [isUserEvent, setIsUserEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addEvent = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);

      try {
        const decodedToken = await jwtDecode(token);

        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/user-events`,
          requestOptions("POST", token, {
            userId: decodedToken.userId,
            eventId: eventId,
          })
        ).then((response) => {
          response.json().then((data) => {
            setIsLoading(false);
            setIsUserEvent(true);
            Alert.alert(data.message);
          });
        });
      } catch (error) {
        setIsLoading(false);
        Alert.alert("Erreur", error.message);
      }
    }
  };

  useEffect(() => {
    // faire requête pour vérifier s'il s'agit d'un événement auquel l'utilisateur va participer
    // mettre à jour le state en fonction de la réponse
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
