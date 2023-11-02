import { requestOptions } from "../helpers/requestOptions";
import { save } from "../helpers/secureStore";
import { autoLogOut } from "../helpers/autoLogOut";
import { useState } from "react";
import { AUTH_TOKEN, IOS } from "../globals";
import { useAppContext } from "../context/appContext";
import Colors from "../globals/colors";
import validator from "validator";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "../components/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { setIsSignedIn } = useAppContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const logUser = async (userData) => {
    setIsLoading(true);

    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        requestOptions("POST", "", userData)
      ).then((response) => {
        response.json().then((data) => {
          setIsLoading(false);
          if (data.token) {
            save(AUTH_TOKEN, data.token).then(() => {
              autoLogOut(data.token, setIsSignedIn);
              setFormData({ email: "", password: "" });
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

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis.");
      return;
    }

    if (!validator.isEmail(formData.email)) {
      Alert.alert("Erreur", "L'adresse mail saisie est invalide.");
      return;
    }

    logUser(formData);
  };

  return (
    <ImageBackground
      source={require("../assets/img/profitez.jpg")}
      resizeMode="cover"
      style={styles.imageBackground}
    >
      <KeyboardAvoidingView
        {...(Platform.OS === IOS && { behavior: "position" })}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../assets/img/eventmates_logo_transparent_slogan.png")}
            />
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary900} />
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                  onChangeText={(value) => handleInputChange("email", value)}
                  value={formData.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="**********"
                    onChangeText={(value) =>
                      handleInputChange("password", value)
                    }
                    value={formData.password}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
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
              <View style={styles.buttonContainer}>
                <Button text="Se connecter" onPress={handleLogin} />
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
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 50,
    borderRadius: 15,
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
    color: Colors.textColor,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    width: "90%",
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
  buttonContainer: {
    width: "90%",
  },
});
