import { useLayoutEffect, useState } from "react";
import { AUTH_TOKEN, SCREEN_EVENTS } from "../globals";
import { getValueFor } from "../helpers/secureStore";
import { requestOptions } from "../helpers/requestOptions";
import { useNavigation } from "@react-navigation/native";
import { Alert, StyleSheet, View, Text } from "react-native";
import Button from "./Button";
import IconButton from "./IconButton";
import Colors from "../globals/colors";
import Modal from "react-native-modal";

export default function ParticipateEventButton({
  eventId,
  isUserEvent,
  setIsUserEvent,
}) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const addEvent = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);

      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/user-events`,
          requestOptions("POST", token, {
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

  const removeEvent = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      setIsLoading(true);

      try {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/user-events`,
          requestOptions("DELETE", token, {
            eventId: eventId,
          })
        ).then((response) => {
          response.json().then((data) => {
            setIsUserEvent(false);
            toggleModal();
            navigation.navigate(SCREEN_EVENTS);
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

  const toggleModal = () => setShowModal(!showModal);

  useLayoutEffect(() => {
    isAnUserEvent(eventId);
  }, [navigation]);

  return (
    <>
      {!isLoading && (
        <>
          <View style={styles.headerIcon}>
            <IconButton
              icon={isUserEvent ? "calendar-remove" : "calendar-plus"}
              size={27}
              color="#fff"
              onPress={isUserEvent ? toggleModal : addEvent}
            />
          </View>
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
                  <Text style={styles.modalText}>Annuler la participation</Text>
                  <IconButton
                    icon="close"
                    size={26}
                    color="#111"
                    onPress={toggleModal}
                  />
                </View>
                <View>
                  <Text style={styles.deleteText}>
                    Es-tu sûr(e) de vouloir annuler ta participation à
                    l'événement ?
                  </Text>
                  <Text style={styles.warningText}>
                    Si tu as rejoint un groupe, tu seras exclu(e) de ce groupe.
                  </Text>
                  <Text style={styles.warningText}>
                    Si tu as créé un groupe, ton groupe sera supprimé.
                  </Text>
                  <View style={styles.optionsContainer}>
                    <View style={styles.optionButton}>
                      <Button
                        text="Oui"
                        height={40}
                        isBold={true}
                        backgroundColor={Colors.primary900}
                        onPress={removeEvent}
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
                </View>
              </View>
            </Modal>
          )}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
    borderRadius: 50,
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
  deleteText: {
    fontFamily: "openSansBold",
    color: Colors.textColor,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  warningText: {
    fontFamily: "openSansBold",
    color: "#cc0000",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    columnGap: 8,
    justifyContent: "center",
    marginTop: 30,
  },
  optionButton: {
    flex: 1,
  },
});
