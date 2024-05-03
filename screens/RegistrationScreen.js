import { requestOptions } from "../helpers/requestOptions";
import { AUTH_TOKEN, ANDROID, IOS } from "../globals";
import { save } from "../helpers/secureStore";
import { autoLogOut } from "../helpers/autoLogOut";
import moment from "moment";
import Colors from "../globals/colors";
import validator from "validator";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useAppContext } from "../context/appContext";
import Button from "../components/Button";
import RadioButtons from "../components/RadioButtons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RegistrationScreen() {
  const { setIsSignedIn } = useAppContext();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    gender: "",
  });
  const [date, setDate] = useState(
    new Date(
      `${moment().year() - 18}-${moment().month() + 1}-${moment().date()}`
    )
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const genders = [
    { id: "f", name: "Femme" },
    { id: "h", name: "Homme" },
    { id: "n", name: "Non-binaire" },
  ];

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const addNewUser = async (userData) => {
    setIsLoading(true);

    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/register`,
        requestOptions("POST", "", userData)
      ).then((response) => {
        response.json().then((data) => {
          setIsLoading(false);
          if (data.token) {
            save(AUTH_TOKEN, data.token).then(() => {
              autoLogOut(data.token, setIsSignedIn);
              setFormData({
                username: "",
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                birthdate: "",
                gender: "",
              });
              setIsSignedIn(true);
            });
            return;
          }

          Alert.alert("Erreur", data.message);
        });
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setDate(currentDate);

      if (Platform.OS === ANDROID) {
        toggleDatePicker();
        setFormData({ ...formData, birthdate: currentDate });
      }
    } else {
      toggleDatePicker();
    }
  };

  const handleSubmit = () => {
    if (!Object.values(formData).every((inputValue) => inputValue.toString().trim() !== "")) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis.");
      return;
    }

    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ]{2,}$/.test(formData.firstName)) {
      Alert.alert(
        "Erreur",
        "Le prénom doit contenir au moins 2 caractères alphabétiques."
      );
      return;
    }

    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ]{2,}$/.test(formData.lastName)) {
      Alert.alert(
        "Erreur",
        "Le nom de famille doit contenir au moins 2 caractères alphabétiques."
      );
      return;
    }

    if (!validator.isEmail(formData.email)) {
      Alert.alert("Erreur", "L'adresse mail saisie est invalide.");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe saisis ne sont pas identiques.");
      return;
    }

    const userData = {
      username: formData.username.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      birthdate: formData.birthdate,
      gender: formData.gender,
    };

    addNewUser(userData);
  };

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const confirmIOSDate = () => {
    setFormData({ ...formData, birthdate: date });
    toggleDatePicker();
  };

  const formatDate = (timestamp) => {
    let day = moment.unix(timestamp).date();
    let month = moment.unix(timestamp).month() + 1;
    let year = moment.unix(timestamp).year();

    day = day < 10 ? `0${day}` : day;
    month = month < 10 ? `0${month}` : month;

    return `${day}/${month}/${year}`;
  };

  return (
    <ImageBackground
      source={require("../assets/img/profitez.jpg")}
      resizeMode="cover"
      style={styles.imageBackground}
    >
      <KeyboardAvoidingView
        {...(Platform.OS === IOS && { behavior: "position" })}
        style={styles.scrollViewContainer}
      >
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo}
                source={require("../assets/img/eventmates_logo_transparent_slogan.png")}
              />
            </View>
            {isLoading ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color={Colors.primary900}
              />
            ) : (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Genre</Text>
                  <RadioButtons
                    data={genders}
                    onSelect={(value) => handleInputChange("gender", value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nom d'utilisateur</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(value) =>
                      handleInputChange("username", value)
                    }
                    value={formData.username}
                    placeholder="JohnDoe92"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(value) =>
                      handleInputChange("firstName", value)
                    }
                    value={formData.firstName}
                    placeholder="John"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nom de famille</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(value) =>
                      handleInputChange("lastName", value)
                    }
                    value={formData.lastName}
                    placeholder="Doe"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(value) => handleInputChange("email", value)}
                    value={formData.email}
                    placeholder="johndoe@gmail.com"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="8 caractères min."
                      onChangeText={(value) =>
                        handleInputChange("password", value)
                      }
                      value={formData.password}
                      secureTextEntry={!showPassword}
                    />
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#aaa"
                      style={styles.icon}
                      onPress={toggleShowPassword}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmation du mot de passe</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="**********"
                      onChangeText={(value) =>
                        handleInputChange("confirmPassword", value)
                      }
                      value={formData.confirmPassword}
                      secureTextEntry={!showPassword}
                    />
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#aaa"
                      style={styles.icon}
                      onPress={toggleShowPassword}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date de naissance</Text>

                  {showDatePicker && (
                    <DateTimePicker
                      mode="date"
                      display="spinner"
                      value={date}
                      onChange={onChange}
                      style={styles.datePicker}
                      maximumDate={
                        new Date(
                          `${moment().year() - 18}-${
                            moment().month() + 1
                          }-${moment().date()}`
                        )
                      }
                    />
                  )}

                  {showDatePicker && Platform.OS === IOS && (
                    <View style={styles.datePickerButtons}>
                      <Button
                        text="Annuler"
                        onPress={toggleDatePicker}
                        height={40}
                      />
                      <Button
                        text="Confirmer"
                        onPress={confirmIOSDate}
                        height={40}
                      />
                    </View>
                  )}

                  {!showDatePicker && (
                    <Pressable onPress={toggleDatePicker}>
                      <TextInput
                        style={styles.input}
                        {...(formData.birthdate !== "" && {
                          value: formatDate(moment(formData.birthdate).unix()),
                        })}
                        placeholder="13/06/1998"
                        onPressIn={toggleDatePicker}
                        editable={false}
                      />
                    </Pressable>
                  )}
                </View>
                <View style={styles.buttonContainer}>
                  <Button text="S'inscrire" onPress={handleSubmit} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    paddingVertical: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContainer: {
    width: "88%",
    minHeight: 300,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 50,
    borderRadius: 15,
    overflow: "hidden",
  },
  container: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    marginVertical: "auto",
  },
  loader: {
    marginBottom: 60,
  },
  form: {
    width: "88%",
  },
  logoContainer: {
    alignSelf: "center",
    marginBottom: -30,
    marginTop: -55,
  },
  logo: {
    width: 230,
    height: 230,
    resizeMode: "contain",
  },
  label: {
    fontFamily: "openSansBold",
    fontSize: 14,
    color: Colors.textColor,
    marginBottom: 8,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 25,
  },
  input: {
    fontFamily: "openSansRegular",
    borderRadius: 10,
    height: 50,
    color: Colors.textColor,
    borderColor: "#111",
    borderWidth: 1,
    paddingLeft: 10,
    overflow: "hidden",
  },
  passwordInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: 10,
    borderRadius: 8,
    fontFamily: "openSansRegular",
    borderRadius: 10,
    height: 50,
    color: Colors.textColor,
    borderColor: "#111",
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flexGrow: 1,
    flexShrink: 1,
  },
  icon: {
    flexShrink: 0,
  },
  datePicker: {
    height: 120,
    marginTop: -10,
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 5,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 50,
  },
});
