import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { getValueFor } from "../helpers/secureStore";
import { AUTH_TOKEN } from "../globals";
import { requestOptions } from "../helpers/requestOptions";
import Colors from "../globals/colors";
import { MIN_PARTICIPANTS, MAX_PARTICIPANTS } from "../globals";
import { ActivityIndicator } from "react-native-paper";
import Modal from "react-native-modal";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import EventGroup from "../components/EventGroup";
import QuantitySelector from "../components/QuantitySelector";
import Button from "../components/Button";
import IconButton from "../components/IconButton";

export default function GroupsScreen({ route, navigation }) {
  const flatList = useRef();
  const eventInfo = route.params.data;
  const [isLoading, setIsLoading] = useState(false);
  const [userInGroup, setUserInGroup] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [groupsInfo, setGroupsInfo] = useState({
    groups: [],
    nbOfGroups: 0,
    page: 1,
    isLastPage: false,
  });
  const [groupCreationInfo, setGroupCreationInfo] = useState({
    name: "",
    description: "",
    capacity: 2,
  });

  const renderEventGroup = ({ item }) => <EventGroup groupInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  const isUserInAGroup = async (eventId) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);
      try {
        fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/is-user-in-group?eventId=${eventId}`,
          requestOptions("GET", token)
        ).then((response) =>
          response.json().then((data) => setUserInGroup(data.isMember))
        );
      } catch {
        setUserInGroup(false);
      }
      setIsLoading(false);
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  const createGroup = async (groupInfo) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);

      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-groups`,
          requestOptions("POST", token, {
            ...groupInfo,
            eventId: eventInfo._id,
          })
        ).then((response) => {
          response.json().then((data) => {
            setUserInGroup(data.success);
            setShowModal(false);
            Alert.alert(data.message);
            setGroupsInfo({
              groups: [],
              nbOfGroups: 0,
              page: 1,
              isLastPage: false,
            });
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (
      !Object.values(groupCreationInfo).every((inputValue) => inputValue !== "")
    ) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis.");
      return;
    }

    const groupData = {
      name: groupCreationInfo.name.trim(),
      description: groupCreationInfo.description.trim(),
      maxCapacity: groupCreationInfo.capacity,
    };

    createGroup(groupData);
  };

  const handleInputChange = (field, value) => {
    if (field == "capacity") {
      if (value === "add" && groupCreationInfo.capacity < MAX_PARTICIPANTS) {
        setGroupCreationInfo({
          ...groupCreationInfo,
          [field]: groupCreationInfo.capacity + 1,
        });
      }

      if (
        value == "subtract" &&
        groupCreationInfo.capacity > MIN_PARTICIPANTS
      ) {
        setGroupCreationInfo({
          ...groupCreationInfo,
          [field]: groupCreationInfo.capacity - 1,
        });
      }
      return;
    }

    setGroupCreationInfo({ ...groupCreationInfo, [field]: value });
  };

  const fetchGroups = async () => {
    setIsLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);

      if (token) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-groups?eventId=${eventInfo._id}&page=${groupsInfo.page}`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setIsLoading(false);
            if (data.totalPage === groupsInfo.page || data.totalPage === 0) {
              setGroupsInfo({
                ...groupsInfo,
                groups: [...groupsInfo.groups, ...data.groups],
                nbOfGroups: data.nbOfGroups,
                isLastPage: true,
              });
              return;
            }
            setGroupsInfo({
              groups: [...groupsInfo.groups, ...data.groups],
              nbOfGroups: data.nbOfGroups,
              page: groupsInfo.page + 1,
              isLastPage: false,
            });
          });
        });
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!groupsInfo.isLastPage && !isLoading) {
      fetchGroups();
    }
  };

  const onPressFunction = () =>
    flatList.current.scrollToOffset({ animated: true, offset: 0 });

  useLayoutEffect(() => {
    isUserInAGroup(eventInfo._id);
  }, [navigation]);

  useEffect(() => {
    const fetch = navigation.addListener("focus", () => {
      if (!groupsInfo.isLastPage) {
        fetchGroups();
      }
    });

    return fetch;
  }, [navigation]);

  return (
    <View style={styles.groupsPage}>
      <FlatList
        data={groupsInfo.groups}
        renderItem={renderEventGroup}
        keyExtractor={setKeyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        {...(isLoading &&
          !groupsInfo.isLastPage && {
            ListFooterComponent: () => (
              <ActivityIndicator
                size="large"
                style={styles.loader}
                color={Colors.primary600}
              />
            ),
          })}
        ListHeaderComponent={() => (
          <>
            {!isLoading && (
              <Text style={styles.nbOfGroups}>
                <Text style={styles.nbOfGroupsBold}>
                  {groupsInfo.nbOfGroups}
                </Text>{" "}
                groupe(s) EventMates créé(s)
              </Text>
            )}
            {!userInGroup && (
              <View style={styles.buttonContainer}>
                <Button text="Créer un groupe" onPress={toggleModal} />
              </View>
            )}
          </>
        )}
        ItemSeparatorComponent={<View style={styles.separator}></View>}
      />
      {groupsInfo.groups.length > 0 && (
        <>
          <Pressable style={styles.topButton} onPress={onPressFunction}>
            <IconButton icon="chevron-up" size={26} color="#fff" />
          </Pressable>
          <View style={styles.pageTextContainer}>
            <Text style={styles.pageText}>
              {groupsInfo.groups.length} / {groupsInfo.nbOfGroups}
            </Text>
          </View>
        </>
      )}
      {showModal && (
        <Modal
          isVisible={showModal}
          backdropColor="#111"
          backdropOpacity={0.6}
          onBackdropPress={toggleModal}
          hideModalContentWhileAnimating={true}
        >
          <View style={styles.modal}>
            <View style={styles.closeIconContainer}>
              <Text style={styles.modalText}>Création d'un groupe</Text>
              <IconButton
                icon="close"
                size={26}
                color="#111"
                onPress={toggleModal}
              />
            </View>
            <ScrollView>
              <Text style={styles.label}>Nom du groupe</Text>
              <TextInput
                style={styles.input}
                onChangeText={(value) => handleInputChange("name", value)}
                value={groupCreationInfo.name}
                returnKeyType="go"
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                multiline={true}
                numberOfLines={8}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                value={groupCreationInfo.description}
                returnKeyType="go"
              />
              <Text style={styles.label}>Nombre total de participants</Text>
              <View style={styles.selectorsContainer}>
                <QuantitySelector
                  sign="minus"
                  onPress={() => handleInputChange("capacity", "subtract")}
                />
                <Text style={styles.capacityText}>
                  {groupCreationInfo.capacity}
                </Text>
                <QuantitySelector
                  sign="plus"
                  onPress={() => handleInputChange("capacity", "add")}
                />
              </View>
              <View>
                <Button text="Valider" onPress={handleSubmit} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groupsPage: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: 15,
    paddingBottom: 70,
  },
  nbOfGroups: {
    textAlign: "center",
    fontSize: 15,
    color: "#fff",
    fontFamily: "montserratRegular",
    marginBottom: 25,
  },
  nbOfGroupsBold: {
    fontSize: 18,
    fontFamily: "montserratBold",
  },
  loader: {
    marginVertical: 20,
  },
  separator: {
    height: 20,
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
  modal: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
  },
  closeIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 15,
    fontFamily: "openSansBold",
    marginBottom: 10,
  },
  input: {
    fontFamily: "openSansRegular",
    borderRadius: 10,
    height: 50,
    borderColor: "#111",
    color: Colors.textColor,
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 25,
    overflow: "hidden",
  },
  selectorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 15,
    alignSelf: "center",
    marginBottom: 40,
  },
  capacityText: {
    fontFamily: "openSansBold",
    fontSize: 16,
  },
  label: {
    fontFamily: "openSansBold",
    color: Colors.textColor,
    fontSize: 14,
    marginBottom: 8,
  },
  buttonContainer: {
    marginBottom: 25,
  },
});
