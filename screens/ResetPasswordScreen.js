import { useState } from "react";
import validator from "validator";
import { requestOptions } from "../helpers/requestOptions";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ImageBackground,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import Button from "../components/Button";
import Colors from "../globals/colors";

export default function ResetPasswordScreen() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    resetToken: "",
  });
  const [passwordView, setPasswordView] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordView = () => setPasswordView(!passwordView);

  const toggleSwitch = () => setIsEnabled(!isEnabled);

  const handleInputChange = (field, value) =>
    setUserInfo({ ...userInfo, [field]: value });

  const sendResetEmail = async (userData) => {
    setIsLoading(true);

    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/forgot-password`,
        requestOptions("POST", "", userData)
      ).then((response) => {
        response.json().then((data) => {
          setIsLoading(false);
          Alert.alert(data.message);
        });
      });
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsLoading(false);
    }
  };

  const resetPassword = async (userData) => {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reset-password`,
        requestOptions("POST", userInfo.resetToken.trim(), userData)
      ).then((response) => {
        response.json().then((data) => {
          setIsLoading(false);
          Alert.alert(data.message);
          setUserInfo({ email: "", password: "", resetToken: ""})
        });
      });
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (!userInfo.password || !userInfo.resetToken) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis.");
      return;
    }

    if (userInfo.password.length < 8) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    const userData = {
      newPassword: userInfo.password,
    };

    resetPassword(userData);
  };

  const handleSendEmail = () => {
    if (!userInfo.email) {
      Alert.alert("Erreur", "Saisis ton adresse mail.");
      return;
    }

    if (!validator.isEmail(userInfo.email)) {
      Alert.alert("Erreur", "L'adresse mail saisie est invalide.");
      return;
    }

    const userData = {
      email: userInfo.email.toLowerCase().trim(),
    };

    sendResetEmail(userData);
  };

  return (
    <ImageBackground
      source={require("../assets/img/vibrez.jpg")}
      resizeMode="cover"
      style={styles.imageBackground}
    >
      <KeyboardAvoidingView behavior="position">
        <View style={styles.container}>
          <Text style={styles.title}>Réinitialisation du mot de passe</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary900} />
          ) : passwordView ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="**********"
                  onChangeText={(value) => handleInputChange("password", value)}
                  value={userInfo.password}
                  {...(!isEnabled && { secureTextEntry: true })}
                />
              </View>
              <View style={styles.toggleButtonContainer}>
                <Switch
                  trackColor={{ false: "#D4D4D4", true: "#B46AFF7A" }}
                  thumbColor={isEnabled ? Colors.primary700 : Colors.primary600}
                  ios_backgroundColor={"#D4D4D4"}
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
                <Text style={styles.showPasswordText}>
                  Afficher le mot de passe
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Token de réinitialisation</Text>
                <TextInput
                  style={styles.input}
                  placeholder="eyJhbGciOiJIUzI..."
                  onChangeText={(value) =>
                    handleInputChange("resetToken", value)
                  }
                  value={userInfo.resetToken}
                  returnKeyType="go"
                  onSubmitEditing={handleResetPassword}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.mailButtonContainer}>
                <Button
                  text="Réinitialiser le mot de passe"
                  onPress={handleResetPassword}
                />
              </View>
              <View style={styles.resetButtonContainer}>
                <Button
                  text="Saisir l'adresse mail"
                  textColor={Colors.textColor}
                  backgroundColor="transparent"
                  onPress={togglePasswordView}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Saisis ton adresse mail pour réinitialiser ton mot de passe.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                  onChangeText={(value) => handleInputChange("email", value)}
                  value={userInfo.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleSendEmail}
                />
              </View>
              <View style={styles.mailButtonContainer}>
                <Button text="Envoyer un mail" onPress={handleSendEmail} />
              </View>
              <View style={styles.resetButtonContainer}>
                <Button
                  text="Saisir le token reçu"
                  textColor={Colors.textColor}
                  backgroundColor="transparent"
                  onPress={togglePasswordView}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    width: "88%",
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 50,
    borderRadius: 15,
  },
  title: {
    fontFamily: "openSansBold",
    textAlign: "center",
    color: Colors.textColor,
    fontSize: 18,
    marginBottom: 18,
  },
  description: {
    fontFamily: "openSansRegular",
    textAlign: "center",
    color: Colors.textColor,
    fontSize: 15,
    marginBottom: 30,
  },
  label: {
    fontFamily: "openSansBold",
    color: Colors.textColor,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    fontFamily: "openSansRegular",
    borderRadius: 10,
    height: 50,
    borderColor: "#111",
    color: Colors.textColor,
    borderWidth: 1,
    paddingLeft: 10,
    overflow: "hidden",
  },
  toggleButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    marginBottom: 25,
  },
  showPasswordText: {
    fontSize: 16,
  },
  mailButtonContainer: {
    marginBottom: 20,
  },
});
