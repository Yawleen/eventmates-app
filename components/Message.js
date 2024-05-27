import { useEffect, useState } from "react";
import { getValueFor } from "../helpers/secureStore";
import { AUTH_TOKEN } from "../globals";
import jwt_decode from "jwt-decode";
import moment from "moment";
import Colors from "../globals/colors";
import { StyleSheet, Text, View } from "react-native";
import { requestOptions } from "../helpers/requestOptions";

export default function Message({ messageInfo }) {
  const [isSender, setIsSender] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkUser = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      const decodedToken = await jwt_decode(token);

      if (decodedToken.userId === messageInfo.sender._id) {
        setIsSender(true);
      }
    }
  };

  const checkUserOnline = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/is-user-online`,
          requestOptions("POST", token, { userId: messageInfo.sender._id })
        ).then((response) =>
          response.json().then((data) => {
            setIsUserOnline(data.isOnline);
          })
        );
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
      setIsLoading(false);
    }
  };

  const showInfo = () => {
    if (messageInfo.eventGroup.bannedUsers.includes(messageInfo.sender._id)) {
      return (
        <Text style={styles.info}>
          {messageInfo.sender.username} a été banni(e) du groupe.
        </Text>
      );
    }

    if (!messageInfo.eventGroup.users.includes(messageInfo.sender._id)) {
      return (
        <Text style={styles.info}>
          {messageInfo.sender.username} n'est plus dans le groupe.
        </Text>
      );
    }
  };

  useEffect(() => {
    checkUser();
    checkUserOnline();
  }, []);

  return (
    <>
      <View
        style={
          isSender ? [styles.message, styles.senderMessage] : styles.message
        }
      >
        <View style={styles.senderContainer}>
          <Text style={styles.sender}>{messageInfo.sender.username}</Text>
          {!isLoading && (
            <View
              style={
                isUserOnline
                  ? [styles.status, styles.activeStatus]
                  : styles.status
              }
            ></View>
          )}
        </View>
        <Text style={styles.content}>{messageInfo.content}</Text>
        <Text style={styles.date}>
          {moment(messageInfo.timestamp).isSame(moment(), "day")
            ? `Aujourd'hui, ${moment(messageInfo.timestamp).format("HH:mm")}`
            : `Le ${moment(messageInfo.timestamp).format("DD/MM/YYYY, HH:mm")}`}
        </Text>
      </View>
      {showInfo()}
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary700,
    padding: 8,
    maxWidth: "80%",
    borderRadius: 7,
    marginLeft: 10,
    marginBottom: 4,
  },
  senderMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary600,
    marginRight: 10,
  },
  senderContainer: {
    flexDirection: "row",
    columnGap: 4,
    alignItems: "center",
    marginBottom: 4,
  },
  sender: {
    fontSize: 14.5,
    color: "#fff",
    fontFamily: "openSansBold",
    textTransform: "uppercase",
  },
  status: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#DC143C",
  },
  activeStatus: {
    backgroundColor: "#7FFF00",
  },
  content: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "openSansRegular",
    marginBottom: 10,
  },
  date: {
    fontSize: 12.5,
    color: "#fff",
    fontFamily: "openSansRegular",
    letterSpacing: 1,
  },
  info: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "openSansRegular",
    paddingLeft: 5,
  },
});
