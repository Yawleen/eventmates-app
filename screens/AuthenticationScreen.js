import { SCREEN_REGISTRATION, SCREEN_LOG_IN } from "../globals";
import { StyleSheet, View, Image, ScrollView, Text } from "react-native";
import Carousel from "react-native-intro-carousel";
import Button from "../components/Button";
import { ImageBackground } from "react-native";

export default function AuthenticationScreen({ navigation }) {
  const registrationPressHandler = () =>
    navigation.navigate(SCREEN_REGISTRATION);
  const logInPressHandler = () => navigation.navigate(SCREEN_LOG_IN);

  return (
    <View style={styles.container}>
      <Carousel
        data={[
          {
            key: "1",
            image: require("../assets/img/rencontrez.jpg"),
            title: "Rencontrez",
            backgroundColor: "red",
          },
          {
            key: "2",
            image: require("../assets/img/vibrez.jpg"),
            title: "Vibrez",
          },
          {
            key: "3",
            image: require("../assets/img/profitez.jpg"),
            title: "Profitez",
          },
        ]}
        buttonsConfig={{
          disabled: true,
        }}
        paginationConfig={{
          dotSize: 8,
          bottomOffset: 5,
          animated: false
        }}
        renderItem={({ item }) => (
          <ImageBackground source={item.image} style={styles.image}>
              <Text style={styles.title}>{item.title}</Text>
          </ImageBackground>
        )}
      />
      <View style={styles.scrollViewContainer}>
        <ScrollView>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../assets/img/eventmates_logo_transparent.png")}
            />
          </View>
          <View style={styles.ctaContainer}>
            <Button text="Inscription" onPress={registrationPressHandler} />
            <Button text="Connexion" onPress={logInPressHandler} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  logoContainer: {
    alignSelf: "center",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "cover",
  },
  title: {
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    fontSize: 23,
    textShadowColor: "#111111",
    textShadowRadius: 10,
    fontFamily: "montserratBold",
  },
  scrollViewContainer: {
    height: "50%",
    paddingHorizontal: 20,
    marginTop: "auto",
    backgroundColor: "#fff",
    overflow: "auto",
  },
  ctaContainer: {
    justifyContent: "center",
    rowGap: 15,
    marginTop: -25,
  },
});
