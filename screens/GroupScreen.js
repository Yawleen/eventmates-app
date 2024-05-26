import moment from "moment";
import "moment/locale/fr";
import Colors from "../globals/colors";
import { AUTH_TOKEN, SCREEN_EVENT, SCREEN_GROUP_CHAT } from "../globals";
import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { getValueFor } from "../helpers/secureStore";
import { requestOptions } from "../helpers/requestOptions";
import { MAX_PARTICIPANTS } from "../globals";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import IconButton from "../components/IconButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import Modal from "react-native-modal";
import QuantitySelector from "../components/QuantitySelector";
import { ActivityIndicator } from "react-native-paper";

export default function GroupScreen({ route, navigation }) {
  const { eventId, groupId } = route.params.data;
  const [groupInfo, setGroupInfo] = useState({});
  const [isUserGroup, setIsUserGroup] = useState(false);
  const [showModal, setShowModal] = useState({
    edit: false,
    delete: false,
    kick: false,
    ban: false,
  });
  const [inputsValues, setInputsValues] = useState({});
  const [groupUpdateInfo, setGroupUpdateInfo] = useState({});
  const [userToKick, setUserToKick] = useState({ username: "", id: "" });
  const [userToBan, setUserToBan] = useState({ username: "", id: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [userInGroup, setUserInGroup] = useState(true);
  const [userId, setUserId] = useState("");

  const redirectToEvent = () =>
    navigation.navigate(SCREEN_EVENT, { data: groupInfo?.event });

  const toggleModal = (option) => {
    if (option) {
      setShowModal({ ...showModal, [option]: !showModal[option] });
      return;
    }

    setShowModal({ edit: false, delete: false, kick: false, ban: false });
  };

  const updateGroup = async (updateInfo) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-groups`,
          requestOptions("PUT", token, {
            ...updateInfo,
            eventId: eventId,
          })
        ).then((response) => {
          response.json().then((data) => {
            toggleModal();
            setGroupUpdateInfo({
              name: data.updatedGroup.name,
              description: data.updatedGroup.description,
              capacity: data.updatedGroup.maxCapacity,
            });
            Alert.alert(data.message);
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
    }
  };

  const fetchEventGroupInfo = async (eventGroupId) => {
    const token = await getValueFor(AUTH_TOKEN);
    const decodedToken = await jwt_decode(token);

    if (token) {
      setIsLoading(true);

      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-group?eventGroupId=${eventGroupId}`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setIsLoading(false);
            setGroupInfo(data.groupInfo);
            setInputsValues({
              name: data.groupInfo.name,
              description: data.groupInfo.description,
              capacity: data.groupInfo.maxCapacity,
            });
            setGroupUpdateInfo({
              name: data.groupInfo.name,
              description: data.groupInfo.description,
              capacity: data.groupInfo.maxCapacity,
            });
            setUserId(decodedToken.userId);
            if (decodedToken.userId === data.groupInfo.creator._id) {
              setIsUserGroup(true);
              return;
            }

            setIsUserGroup(false);
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
        setIsLoading(false);
      }
    }
  };

  const deleteGroup = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-groups`,
          requestOptions("DELETE", token, {
            eventId: eventId,
          })
        ).then((response) => {
          response.json().then((data) => {
            toggleModal();
            Alert.alert(data.message);
            navigation.goBack();
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
    }
  };

  const kickUser = async (userToKickId) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/kick-user`,
          requestOptions("POST", token, {
            eventId: eventId,
            userToKickId: userToKickId,
          })
        ).then((response) => {
          response.json().then((data) => {
            toggleModal();
            setUserToKick({ username: "", id: "" });
            Alert.alert(data.message);
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
    }
  };

  const banUser = async (userToBanId) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/ban-user`,
          requestOptions("POST", token, {
            eventId: eventId,
            userToBanId: userToBanId,
          })
        ).then((response) => {
          response.json().then((data) => {
            toggleModal();
            setUserToBan({ username: "", id: "" });
            Alert.alert(data.message);
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (field == "capacity") {
      if (value === "add" && inputsValues.capacity < MAX_PARTICIPANTS) {
        setInputsValues({
          ...inputsValues,
          [field]: inputsValues.capacity + 1,
        });
      }

      if (
        value == "subtract" &&
        inputsValues.capacity > groupInfo?.users?.length
      ) {
        setInputsValues({
          ...inputsValues,
          [field]: inputsValues.capacity - 1,
        });
      }
      return;
    }

    setInputsValues({ ...inputsValues, [field]: value });
  };

  const handleSubmit = () => {
    if (
      !Object.values(inputsValues).every(
        (inputValue) => inputValue.toString().trim() !== ""
      )
    ) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis.");
      return;
    }

    const groupData = {
      name: inputsValues.name.trim(),
      description: inputsValues.description.trim(),
      maxCapacity: inputsValues.capacity,
    };

    updateGroup(groupData);
  };

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

  const joinGroup = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/join-group`,
          requestOptions("POST", token, {
            eventId: eventId,
            eventGroupId: groupId,
          })
        ).then((response) => {
          response.json().then((data) => {
            Alert.alert(data.message);
            if (data.success) {
              setUserInGroup(true);
              navigation.navigate(SCREEN_GROUP_CHAT);
            }
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
    }
  };

  const leaveGroup = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/leave-group`,
          requestOptions("POST", token, {
            eventGroupId: groupId,
          })
        ).then((response) => {
          response.json().then((data) => {
            Alert.alert(data.message);
            if (data.success) {
              setUserInGroup(false);
            }
          });
        });
      } catch (error) {
        Alert.alert("Erreur", error.message);
      }
    }
  };

  useEffect(() => {
    isUserInAGroup(eventId);
  }, []);

  useEffect(() => {
    if (!userToKick.username || !userToBan.username || userInGroup) {
      fetchEventGroupInfo(groupId);
    }
  }, [userToKick, userToBan, userInGroup]);

  useEffect(() => {
    navigation.setOptions({
      title: groupUpdateInfo.name ? groupUpdateInfo.name : "",
    });
  }, [groupUpdateInfo.name]);

  return (
    <View style={styles.groupPage}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.primary900}
          />
        </View>
      ) : (
        <ScrollView>
          <Text style={styles.infoTextBold}>Événement sélectionné</Text>
          <Pressable onPress={redirectToEvent} style={styles.groupEvent}>
            <View style={styles.eventImage}>
              <Image
                style={styles.image}
                source={{ uri: groupInfo?.event?.media?.url }}
              />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>{groupInfo?.event?.name}</Text>
              <Text style={styles.eventDate}>
                Le{" "}
                {moment(groupInfo?.event?.dates?.start?.localDate).format(
                  "DD/MM/YYYY"
                )}{" "}
                à {groupInfo?.event?.dates?.start?.localTime.substring(0, 5)}
              </Text>
              <View style={styles.address}>
                <IconButton icon="map-marker-outline" size={20} color="#111" />
                <Text style={styles.addressText}>
                  {groupInfo?.event?.address.split(",")[0]}
                </Text>
              </View>
            </View>
          </Pressable>
          <Text style={styles.infoTextBold}>
            Membres du groupe ({groupInfo?.users?.length}/
            {groupUpdateInfo.capacity})
          </Text>
          <View style={styles.membersContainer}>
            <View style={styles.members}>
              <MaterialCommunityIcons name="account" size={18} color="#fff" />
              <Text style={styles.memberName}>
                {isUserGroup ? "Toi" : groupInfo?.creator?.username} (Créateur)
              </Text>
            </View>
            {groupInfo?.users?.slice(1).map((user) => (
              <View key={user._id} style={styles.members}>
                <MaterialCommunityIcons name="account" size={18} color="#fff" />
                <Text style={styles.memberName}>{user.username}</Text>
                {isUserGroup && (
                  <>
                    <View style={styles.kickIcon}>
                      <IconButton
                        icon="account-minus"
                        size={20}
                        color="#fff"
                        onPress={() => {
                          setUserToKick({
                            username: user.username,
                            id: user._id,
                          });
                          toggleModal("kick");
                        }}
                      />
                    </View>
                    <View style={styles.kickIcon}>
                      <IconButton
                        icon="account-cancel"
                        size={20}
                        color="#fff"
                        onPress={() => {
                          setUserToBan({
                            username: user.username,
                            id: user._id,
                          });
                          toggleModal("ban");
                        }}
                      />
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
          <Text style={styles.infoTextBold}>Description du groupe</Text>
          <Text style={styles.infoText}>{groupUpdateInfo.description}</Text>
          <View style={styles.buttonContainer}>
            {isUserGroup && (
              <>
                <Button
                  text="Éditer ton groupe"
                  isBold={true}
                  backgroundColor={Colors.primary700}
                  onPress={() => toggleModal("edit")}
                />
                <Button
                  text="Supprimer ton groupe"
                  isBold={true}
                  backgroundColor={Colors.primary900}
                  onPress={() => toggleModal("delete")}
                />
              </>
            )}
            {!userInGroup && (
              <Button
                text="Rejoindre le groupe"
                isBold={true}
                backgroundColor={Colors.primary700}
                onPress={joinGroup}
              />
            )}
            {!isUserGroup &&
              groupInfo?.users?.map((user) => user._id).includes(userId) && (
                <Button
                  text="Quitter le groupe"
                  isBold={true}
                  backgroundColor={Colors.primary700}
                  onPress={leaveGroup}
                />
              )}
          </View>
          {Object.values(showModal).includes(true) && (
            <Modal
              isVisible={true}
              backdropColor="#111"
              backdropOpacity={0.6}
              onBackdropPress={() => toggleModal()}
              hideModalContentWhileAnimating={true}
            >
              <View style={styles.modal}>
                <View style={styles.closeIconContainer}>
                  <Text style={styles.modalText}>
                    {showModal.edit && "Modification du groupe"}
                    {showModal.delete && "Suppression du groupe"}
                    {showModal.kick && "Exclusion du groupe"}
                    {showModal.ban && "Bannissement du groupe"}
                  </Text>
                  <IconButton
                    icon="close"
                    size={26}
                    color="#111"
                    onPress={() => toggleModal()}
                  />
                </View>
                {showModal.edit && (
                  <ScrollView>
                    <Text style={styles.label}>Nom du groupe</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={(value) => handleInputChange("name", value)}
                      value={inputsValues.name}
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
                      value={inputsValues.description}
                      returnKeyType="go"
                    />
                    <Text style={styles.label}>
                      Nombre total de participants
                    </Text>
                    <View style={styles.selectorsContainer}>
                      <QuantitySelector
                        sign="minus"
                        onPress={() =>
                          handleInputChange("capacity", "subtract")
                        }
                      />
                      <Text style={styles.capacityText}>
                        {inputsValues.capacity}
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
                )}
                {showModal.delete && (
                  <>
                    <Text style={styles.deleteText}>
                      Es-tu sûr(e) de vouloir supprimer ton groupe ?
                    </Text>
                    <View style={styles.optionsContainer}>
                      <View style={styles.optionButton}>
                        <Button
                          text="Oui"
                          height={40}
                          isBold={true}
                          backgroundColor={Colors.primary900}
                          onPress={deleteGroup}
                        />
                      </View>
                      <View style={styles.optionButton}>
                        <Button
                          text="Non"
                          height={40}
                          isBold={true}
                          backgroundColor={Colors.primary700}
                          onPress={() => toggleModal()}
                        />
                      </View>
                    </View>
                  </>
                )}
                {showModal.kick && (
                  <>
                    <Text style={styles.deleteText}>
                      Es-tu sûr(e) de vouloir exclure {userToKick.username} de
                      ton groupe ?
                    </Text>
                    <View style={styles.optionsContainer}>
                      <View style={styles.optionButton}>
                        <Button
                          text="Oui"
                          height={40}
                          isBold={true}
                          backgroundColor={Colors.primary900}
                          onPress={() => kickUser(userToKick.id)}
                        />
                      </View>
                      <View style={styles.optionButton}>
                        <Button
                          text="Non"
                          height={40}
                          isBold={true}
                          backgroundColor={Colors.primary700}
                          onPress={() => toggleModal()}
                        />
                      </View>
                    </View>
                  </>
                )}
                {showModal.ban && (
                  <>
                    <Text style={styles.deleteText}>
                      Es-tu sûr(e) de vouloir bannir {userToBan.username} de ton
                      groupe ?
                    </Text>
                    <View style={styles.optionsContainer}>
                      <View style={styles.optionButton}>
                        <Button
                          text="Oui"
                          height={40}
                          isBold={true}
                          backgroundColor={Colors.primary900}
                          onPress={() => banUser(userToBan.id)}
                        />
                      </View>
                      <View style={styles.optionButton}>
                        <Button
                          text="Non"
                          height={40}
                          isBold={true}
                          backgroundColor={Colors.primary700}
                          onPress={() => toggleModal()}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            </Modal>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupPage: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  eventNameTitle: {
    fontFamily: "montserratBold",
    color: "#fff",
    fontSize: 20,
    letterSpacing: 0.5,
    marginBottom: 30,
  },
  groupEvent: {
    height: 125,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 20,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: Colors.primary700,
    borderRadius: 20,
    marginBottom: 80,
    overflow: "hidden",
  },
  eventImage: {
    flexShrink: 0,
    width: "35%",
  },
  eventInfo: {
    flex: 1,
  },
  image: {
    height: "100%",
    resizeMode: "cover",
  },
  eventName: {
    fontSize: 15.5,
    fontFamily: "openSansBold",
    textTransform: "uppercase",
    color: Colors.primary900,
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 15,
    fontFamily: "openSansRegular",
    marginBottom: 15,
  },
  address: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 2,
  },
  addressText: {
    flex: 1,
  },
  infoText: {
    textAlign: "center",
    fontFamily: "openSansRegular",
    color: "#fff",
    fontSize: 15,
    marginBottom: 19,
  },
  infoTextBold: {
    textAlign: "center",
    fontFamily: "openSansBold",
    color: "#fff",
    fontSize: 15.5,
    marginBottom: 10,
  },
  membersContainer: {
    rowGap: 5,
    marginBottom: 30,
  },
  members: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 6,
  },
  memberName: {
    color: "#fff",
    fontFamily: "openSansRegular",
    fontSize: 15,
  },
  buttonContainer: {
    rowGap: 5,
    marginTop: 30,
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
  deleteText: {
    fontFamily: "openSansBold",
    color: Colors.textColor,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  optionsContainer: {
    flexDirection: "row",
    columnGap: 8,
    justifyContent: "center",
  },
  optionButton: {
    flex: 1,
  },
  kickIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: Colors.primary900,
  },
});
