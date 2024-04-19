import moment from "moment";
import "moment/locale/fr";
import Colors from "../globals/colors";
import { AUTH_TOKEN, SCREEN_EVENT } from "../globals";
import { useState, useLayoutEffect, useEffect } from "react";
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

export default function GroupScreen({ route, navigation }) {
  const groupInfo = route.params.data;
  const minParticipants = groupInfo.users.length;
  const [isUserGroup, setIsUserGroup] = useState(false);
  const [showModal, setShowModal] = useState({ edit: false, delete: false });
  const [inputsValues, setInputsValues] = useState({
    name: groupInfo.name,
    description: groupInfo.description,
    capacity: groupInfo.maxCapacity,
  });
  const [groupUpdateInfo, setGroupUpdateInfo] = useState({
    name: groupInfo.name,
    description: groupInfo.description,
    capacity: groupInfo.maxCapacity,
  });

  const redirectToEvent = () =>
    navigation.navigate(SCREEN_EVENT, { data: groupInfo.event });

  const checkUserGroup = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      const decodedToken = await jwt_decode(token);
      if (decodedToken.userId === groupInfo.creator._id) {
        setIsUserGroup(true);
        return;
      }

      setIsUserGroup(false);
    }
  };

  const toggleModal = (option) => {
    if (option) {
      setShowModal({ ...showModal, [option]: !showModal[option] });
      return;
    }

    setShowModal({ edit: false, delete: false });
  };

  const updateGroup = async (updateInfo) => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-groups`,
          requestOptions("PUT", token, {
            ...updateInfo,
            eventId: groupInfo.event._id,
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

  const deleteGroup = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/event-groups`,
          requestOptions("DELETE", token, {
            eventId: groupInfo.event._id,
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

  const handleInputChange = (field, value) => {
    if (field == "capacity") {
      if (value === "add" && inputsValues.capacity < MAX_PARTICIPANTS) {
        setInputsValues({
          ...inputsValues,
          [field]: inputsValues.capacity + 1,
        });
      }

      if (value == "subtract" && inputsValues.capacity > minParticipants) {
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
    if (!Object.values(inputsValues).every((inputValue) => inputValue.trim() !== "")) {
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

  useEffect(() => {
    checkUserGroup();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Groupe ${groupUpdateInfo.name}`,
    });
  }, [navigation, groupUpdateInfo.name]);

  return (
    <View style={styles.groupPage}>
      <ScrollView>
        <Text style={styles.infoTextBold}>Événement sélectionné</Text>
        <Pressable onPress={redirectToEvent} style={styles.groupEvent}>
          <View style={styles.eventImage}>
            <Image
              style={styles.image}
              source={{ uri: groupInfo.event.media.url }}
            />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{groupInfo.event.name}</Text>
            <Text style={styles.eventDate}>
              Le{" "}
              {moment(groupInfo.event.dates.start.localDate).format(
                "DD/MM/YYYY"
              )}{" "}
              à {groupInfo.event.dates.start.localTime.substring(0, 5)}
            </Text>
            <View style={styles.address}>
              <IconButton icon="map-marker-outline" size={20} color="#111" />
              <Text style={styles.addressText}>
                {groupInfo.event.address.split(",")[0]}
              </Text>
            </View>
          </View>
        </Pressable>
        <Text style={styles.infoTextBold}>
          Membres du groupe ({groupInfo.users.length}/{groupUpdateInfo.capacity}
          )
        </Text>
        <View style={styles.membersContainer}>
          <View style={styles.members}>
            <MaterialCommunityIcons name="account" size={18} color="#fff" />
            <Text style={styles.memberName}>
              {isUserGroup ? "Toi" : groupInfo.creator.username} (Créateur)
            </Text>
          </View>
          {groupInfo.users.slice(1).map((user) => (
            <View key={user._id} style={styles.members}>
              <MaterialCommunityIcons name="account" size={18} color="#fff" />
              <Text style={styles.memberName}>{user.username}</Text>
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
                  {showModal.edit
                    ? "Modification du groupe"
                    : "Suppression du groupe"}
                </Text>
                <IconButton
                  icon="close"
                  size={26}
                  color="#111"
                  onPress={() => toggleModal()}
                />
              </View>
              {showModal.edit ? (
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
                  <Text style={styles.label}>Nombre total de participants</Text>
                  <View style={styles.selectorsContainer}>
                    <QuantitySelector
                      sign="minus"
                      onPress={() => handleInputChange("capacity", "subtract")}
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
              ) : (
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
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
