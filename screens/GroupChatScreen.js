import Colors from "../globals/colors";
import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import IconButton from "../components/IconButton";
import { getValueFor } from "../helpers/secureStore";
import { AUTH_TOKEN } from "../globals";
import { FlatList } from "react-native-gesture-handler";
import GroupChat from "../components/GroupChat";
import { requestOptions } from "../helpers/requestOptions";

export default function GroupChatScreen({ navigation, route }) {
  const flatListOne = useRef();
  const flatListTwo = useRef();
  const [createdGroups, setCreatedGroups] = useState();
  const [isCreatedLoading, setIsCreatedLoading] = useState(false);
  const [isJoinedLoading, setIsJoinedLoading] = useState(false);
  const [createdGroupChat, setCreatedGroupChat] = useState({
    groups: [],
    nbOfGroups: 0,
    page: 1,
    isLastPage: false,
  });
  const [joinedGroupChat, setJoinedGroupChat] = useState({
    groups: [],
    nbOfGroups: 0,
    page: 1,
    isLastPage: false,
  });

  const renderGroupChat = ({ item }) => <GroupChat groupInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  const onPressFunction = () => {
    if (createdGroups) {
      flatListOne.current.scrollToOffset({ animated: true, offset: 0 });
      return;
    }

    flatListTwo.current.scrollToOffset({ animated: true, offset: 0 });
  };

  const fetchCreatedGroups = async (groups = [], page = 1) => {
    setIsCreatedLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);

      if (token) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/created-group-chat?page=${page}`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setIsCreatedLoading(false);
            if (data.totalPage === page || data.totalPage === 0) {
              setCreatedGroupChat({
                ...createdGroupChat,
                groups: [...groups, ...data.createdGroups],
                nbOfGroups: data.nbOfGroups,
                isLastPage: true,
              });
              return;
            }
            setCreatedGroupChat({
              groups: [...groups, ...data.createdGroups],
              nbOfGroups: data.nbOfGroups,
              page: page + 1,
              isLastPage: false,
            });
          });
        });
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsCreatedLoading(false);
    }
  };

  const fetchJoinedGroups = async (groups = [], page = 1) => {
    setIsJoinedLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);

      if (token) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/joined-group-chat?page=${page}`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setIsJoinedLoading(false);
            if (data.totalPage === page || data.totalPage === 0) {
              setJoinedGroupChat({
                ...joinedGroupChat,
                groups: [...groups, ...data.joinedGroups],
                nbOfGroups: data.nbOfGroups,
                isLastPage: true,
              });
              return;
            }
            setJoinedGroupChat({
              groups: [...groups, ...data.joinedGroups],
              nbOfGroups: data.nbOfGroups,
              page: page + 1,
              isLastPage: false,
            });
          });
        });
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsJoinedLoading(false);
    }
  };

  const showCreatedGroups = () => {
    setCreatedGroups(true);
    fetchCreatedGroups();
  };

  const showJoinedGroups = () => {
    setCreatedGroups(false);
    fetchJoinedGroups();
  };

  const handleLoadMoreCreatedGroups = () => {
    if (!createdGroupChat.isLastPage && !isCreatedLoading) {
      fetchCreatedGroups(createdGroupChat.groups, createdGroupChat.page);
    }
  };

  const handleLoadMoreJoinedGroups = () => {
    if (!joinedGroupChat.isLastPage && !isJoinedLoading) {
      fetchJoinedGroups(joinedGroupChat.groups, joinedGroupChat.page);
    }
  };

  useEffect(() => {
    const fetch = navigation.addListener("focus", () => {
      if (route?.params?.joinedGroupsTab) {
        setCreatedGroups(false);
      } else {
        setCreatedGroups(true);
      }

      if (!createdGroupChat.isLastPage) {
        fetchCreatedGroups();
      }
    });

    return fetch;
  }, [navigation]);

  return (
    <View style={styles.groupChatPage}>
      <View style={styles.groupsTabs}>
        <Pressable
          onPress={showCreatedGroups}
          style={
            createdGroups
              ? [styles.groupTab, styles.groupTabSelected]
              : styles.groupTab
          }
        >
          <Text
            style={
              createdGroups
                ? [styles.groupTabText, styles.groupTabTextSelected]
                : styles.groupTabText
            }
          >
            Groupes créés
          </Text>
        </Pressable>
        <Pressable
          onPress={showJoinedGroups}
          style={
            !createdGroups
              ? [styles.groupTab, styles.groupTabSelected]
              : styles.groupTab
          }
        >
          <Text
            style={
              !createdGroups
                ? [styles.groupTabText, styles.groupTabTextSelected]
                : styles.groupTabText
            }
          >
            Groupes rejoints
          </Text>
        </Pressable>
      </View>
      {isCreatedLoading || isJoinedLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary900} />
        </View>
      ) : createdGroups ? (
        <>
          <FlatList
            ref={flatListOne}
            contentContainerStyle={styles.list}
            data={createdGroupChat.groups}
            renderItem={renderGroupChat}
            keyExtractor={setKeyExtractor}
            onEndReached={handleLoadMoreCreatedGroups}
            onEndReachedThreshold={0.1}
            {...(isCreatedLoading &&
              !createdGroupChat.isLastPage && {
                ListFooterComponent: () => (
                  <ActivityIndicator size="large" color={Colors.primary600} />
                ),
              })}
            ItemSeparatorComponent={<View style={styles.separator}></View>}
          />
          <>
            <Pressable style={styles.topButton} onPress={onPressFunction}>
              <IconButton icon="chevron-up" size={26} color="#fff" />
            </Pressable>
            <View style={styles.pageTextContainer}>
              <Text style={styles.pageText}>
                {createdGroupChat.groups.length} / {createdGroupChat.nbOfGroups}
              </Text>
            </View>
          </>
        </>
      ) : (
        <>
          <FlatList
            ref={flatListTwo}
            contentContainerStyle={styles.list}
            data={joinedGroupChat.groups}
            renderItem={renderGroupChat}
            keyExtractor={setKeyExtractor}
            onEndReached={handleLoadMoreJoinedGroups}
            onEndReachedThreshold={0.1}
            {...(isJoinedLoading &&
              !joinedGroupChat.isLastPage && {
                ListFooterComponent: () => (
                  <ActivityIndicator size="large" color={Colors.primary600} />
                ),
              })}
            ItemSeparatorComponent={<View style={styles.separator}></View>}
          />
          <>
            <Pressable style={styles.topButton} onPress={onPressFunction}>
              <IconButton icon="chevron-up" size={26} color="#fff" />
            </Pressable>
            <View style={styles.pageTextContainer}>
              <Text style={styles.pageText}>
                {joinedGroupChat.groups.length} / {joinedGroupChat.nbOfGroups}
              </Text>
            </View>
          </>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groupChatPage: {
    flex: 1,
    paddingTop: 40,
  },
  loaderContainer: {
    marginTop: 30,
  },
  groupsTabs: {
    height: 45,
    flexDirection: "row",
    columnGap: 4,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  groupTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary900,
    borderRadius: 4,
  },
  groupTabSelected: {
    backgroundColor: "#fff",
    color: Colors.primary900,
  },
  groupTabText: {
    fontSize: 14,
    fontFamily: "openSansBold",
    textTransform: "uppercase",
    color: "#fff",
  },
  groupTabTextSelected: {
    color: Colors.primary900,
  },
  separator: {
    height: 20,
  },
  topButton: {
    position: "absolute",
    right: 15,
    bottom: 30,
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: Colors.primary700,
  },
  pageTextContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    borderRadius: 5,
    backgroundColor: Colors.primary900,
    overflow: "hidden",
  },
  pageText: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "openSansBold",
    padding: 10,
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 50,
  },
});
