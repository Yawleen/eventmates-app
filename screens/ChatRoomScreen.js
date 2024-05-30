import Message from "../components/Message";
import { AUTH_TOKEN } from "../globals";
import Colors from "../globals/colors";
import { getValueFor } from "../helpers/secureStore";
import jwt_decode from "jwt-decode";
import { requestOptions } from "../helpers/requestOptions";
import { io } from "socket.io-client";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { IOS } from "../globals";

export default function ChatRoomScreen({ route, navigation }) {
  const socketRef = useRef(null);
  const { groupInfo } = route.params.data;
  const flatList = useRef();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchGroupMessages = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      const decodedToken = await jwt_decode(token);
      setUserId(decodedToken.userId);
      setIsLoading(true);
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/group-messages?eventGroupId=${groupInfo._id}`,
          requestOptions("GET", token)
        ).then((response) =>
          response.json().then((data) => {
            setIsLoading(false);
            setMessages(data.messages);
            flatList.current.scrollToEnd({ animated: true });
          })
        );
      } catch (error) {
        Alert.alert("Erreur", error.message);
        setIsLoading(false);
      }
    }
  };

  const renderMessage = ({ item }) => <Message messageInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  const handleMessage = (text) => {
    setMessage(text);
  };

  const handleSend = () => {
    if (message && userId) {
      socketRef.current.emit("sendMessage", {
        eventGroupId: groupInfo._id,
        senderId: userId,
        content: message,
      });
      setMessage("");
    }
  };

  useLayoutEffect(() => {
    if (groupInfo.name) {
      navigation.setOptions({
        headerTitle: groupInfo.name,
      });
    }
  }, [navigation, groupInfo.name]);

  useEffect(() => {
    fetchGroupMessages();

    socketRef.current = io(process.env.EXPO_PUBLIC_API_URL, {
      path: "/socket",
      transports: ["websocket"],
    });

    socketRef.current.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      flatList.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.chatRoomPage}
      behavior={Platform.OS === IOS ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === IOS ? 90 : 70}
    >
      <FlatList
        ref={flatList}
        contentContainerStyle={
          Platform.OS === IOS
            ? [styles.messagesList, { paddingBottom: 50 }]
            : styles.messagesList
        }
        data={messages}
        renderItem={renderMessage}
        keyExtractor={setKeyExtractor}
        onEndReachedThreshold={0.1}
        {...(isLoading && {
          ListFooterComponent: () => (
            <ActivityIndicator
              style={{ paddingTop: 50 }}
              size="large"
              color={Colors.primary600}
            />
          ),
        })}
        ItemSeparatorComponent={<View style={styles.separator}></View>}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={handleMessage}
          returnKeyType="Ok"
          style={styles.input}
          placeholder="Tape ton message..."
          placeholderTextColor={Colors.primary900}
        />
        <Pressable onPress={handleSend} style={styles.sendTextContainer}>
          <Text style={styles.sendText}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatRoomPage: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 30,
  },
  separator: {
    height: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 5,
    height: 80,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginBottom: 1,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.primary900,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: Colors.primary900,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sendText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "openSansBold",
    textAlign: "center",
  },
});
