import { SCREEN_REGISTRATION, SCREEN_LOG_IN } from "../globals";
import { StyleSheet, View, Image, ScrollView, Text } from "react-native";
import Colors from "../globals/colors";
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
            title: "Trouve le groupe idéal pour chaque événement",
            description: "Crée ou rejoins des groupes autour de tes événements musicaux préférés",
          },
          {
            key: "2",
            image: require("../assets/img/vibrez.jpg"),
            title: "Fais-toi de \nnouveaux potes",
            description: "Chatte et organise tes rencontres",
          },
          {
            key: "3",
            image: require("../assets/img/profitez.jpg"),
            title: "Partage des moments\n uniques en groupe",
            description: "Retrouve tes nouveaux potes aux événements et enjaille-toi !",
          },
        ]}
        buttonsConfig={{
          disabled: true,
        }}
        paginationConfig={{
          dotSize: 8,
          color: "white",
          activeColor: Colors.primary700,
          bottomOffset: 5,
        }}
        renderItem={({ item }) => (
          <ImageBackground source={item.image} style={styles.image}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
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
    paddingHorizontal: 7,
    marginBottom: 8,
    opacity: 0.9,
    textAlign: "center",
    fontSize: 23,
    textShadowColor: "#111111",
    textShadowRadius: 10,
    fontFamily: "montserratBold",
  },
  description: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    textShadowColor: "#111111",
    textShadowRadius: 10,
    fontFamily: "openSansRegular",
  },
  scrollViewContainer: {
    height: "50%",
    padding: 20,
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
