import moment from "moment";
import "moment/locale/fr";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../globals/colors";
import { useState, useLayoutEffect } from "react";
import { getValueFor } from "../helpers/secureStore";
import { AUTH_TOKEN, SCREEN_GROUPS } from "../globals";
import { requestOptions } from "../helpers/requestOptions";
import { useNavigation, useRoute } from "@react-navigation/native";
import ReadMore from "@fawazahmed/react-native-read-more";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  Linking,
  Alert,
  Pressable,
} from "react-native";
import CategoryTag from "../components/CategoryTag";
import Button from "../components/Button";

export default function EventScreen({ isUserEvent, setIsUserEvent }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [_, setIsLoading] = useState(false);
  const eventInfo = route.params.data;

  const formatPrice = (price) =>
    price.toString().includes(".") ? price.toFixed(2) : price;

  const formatAddress = () => {
    const address = eventInfo.address.replaceAll(/\s{2,}/g, " ").split(", ");
    address.splice(-2, 1);

    return address.join("\n");
  };

  const redirectToExternalLink = (url) =>
    Linking.openURL(url).catch((err) => Alert.alert("Erreur", err.message));

  const redirectToGroups = () =>
    navigation.navigate(SCREEN_GROUPS, { data: eventInfo });

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
      } catch {
        setIsUserEvent(false);
      }
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    isAnUserEvent(eventInfo._id);
  }, [navigation]);

  return (
    <View style={styles.eventPage}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: eventInfo.media.url }}
            style={styles.image}
          >
            <LinearGradient
              style={styles.gradientStyle}
              colors={[
                "transparent",
                "transparent",
                "transparent",
                "transparent",
                "#12121E",
              ]}
            ></LinearGradient>
          </ImageBackground>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{eventInfo.name}</Text>
          <View style={styles.tagContainer}>
            <CategoryTag
              name={eventInfo.genre.name}
              color={eventInfo.genre.color}
              isBig={true}
            />
          </View>
          <View style={styles.info}>
            <View style={styles.infoContainerStyle}>
              <Text style={styles.titleStyle}>Date :</Text>
              <Text style={styles.textStyle}>
                {eventInfo.dates.start && eventInfo.dates?.end
                  ? `Du ${moment(eventInfo.dates.start.localDate).format(
                      "DD MMMM YYYY"
                    )} au ${moment(eventInfo.dates.end.localDate).format(
                      "DD MMMM YYYY"
                    )}`
                  : `Le ${moment(eventInfo.dates.start.localDate).format(
                      "DD MMMM YYYY"
                    )}`}{" "}
                {eventInfo.dates.start && eventInfo.dates?.end
                  ? `de ${eventInfo.dates.start.localTime.substring(
                      0,
                      5
                    )} à ${eventInfo.dates.end.localTime.substring(0, 5)}`
                  : `à ${eventInfo.dates.start.localTime.substring(0, 5)}`}
              </Text>
            </View>
            <View style={styles.infoContainerStyle}>
              <Text style={styles.titleStyle}>Localisation :</Text>
              <Text style={styles.textStyle}>{formatAddress()}</Text>
            </View>
            <View style={styles.infoContainerStyle}>
              <Text style={styles.titleStyle}>
                Informations sur les billets :
              </Text>
              <Text style={styles.textStyle}>
                •{" "}
                {moment(eventInfo.sales.public.startDate).isBefore()
                  ? "Billets actuellement en vente"
                  : `Billets en vente le ${moment(
                      eventInfo.sales.public.startDate
                    ).format("DD MMMM YYYY")}`}{" "}
                sur Ticketmaster
              </Text>
              <Text style={styles.textStyle}>
                • 
                {eventInfo.priceRanges[0].min === eventInfo.priceRanges[0].max
                  ? `${formatPrice(eventInfo.priceRanges[0].max)}€`
                  : `De ${formatPrice(
                      eventInfo.priceRanges[0].min
                    )}€ à ${formatPrice(eventInfo.priceRanges[0].max)}€`}
              </Text>
              {eventInfo?.ticketLimit &&
                moment(eventInfo.sales.public.startDate).isBefore() && (
                  <Text style={styles.textStyle}>
                    • {eventInfo.ticketLimit}
                  </Text>
                )}
            </View>
            {moment(eventInfo.sales.public.startDate).isAfter() &&
              eventInfo.sales.presales.length > 0 && (
                <View style={styles.presalesContainer}>
                  <Text style={styles.titleStyle}>Préventes :</Text>
                  {eventInfo.sales.presales.map((presale, i) => (
                    <Pressable
                      key={i}
                      onPress={() => redirectToExternalLink(presale.url)}
                    >
                      <Text style={styles.textStyle}>
                        - {presale.name}, du{" "}
                        {moment(presale.startDate).format("DD/MM/YYYY")} au{" "}
                        {moment(presale.endDate).format("DD/MM/YYYY")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            {eventInfo?.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>
                  À propos de l'événement
                </Text>
                <ReadMore
                  style={styles.textStyle}
                  numberOfLines={4}
                  seeMoreText="Voir plus"
                  seeLessText="Voir moins"
                  seeMoreStyle={styles.seeMore}
                  seeLessStyle={styles.seeMore}
                >
                  {eventInfo.description}
                </ReadMore>
              </View>
            )}
            {eventInfo?.pleaseNote && (
              <View style={styles.pleaseNoteContainer}>
                <Text style={styles.pleaseNoteText}>
                  {eventInfo.pleaseNote}
                </Text>
              </View>
            )}
            {eventInfo?.accessibility && (
              <View style={styles.accessibilityContainer}>
                <Text style={styles.textStyle}>{eventInfo.accessibility}</Text>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              text="Réserver sur Ticketmaster"
              isBold={true}
              backgroundColor={Colors.primary700}
              onPress={() => redirectToExternalLink(eventInfo.url)}
            />
          </View>
          {isUserEvent && (
            <View style={styles.buttonContainer}>
              <Button
                text="Voir les groupes EventMates"
                isBold={true}
                backgroundColor={Colors.primary900}
                onPress={redirectToGroups}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  eventPage: {
    flex: 1,
    position: "relative",
    backgroundColor: "#12121E",
  },
  imageContainer: {
    height: 500,
    marginBottom: 15,
  },
  image: {
    height: "100%",
    resizeMode: "cover",
  },
  gradientStyle: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    top: "-5%",
    paddingHorizontal: 20,
  },
  tagContainer: {
    marginBottom: 30,
  },
  name: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "montserratBold",
    letterSpacing: 0.5,
    marginBottom: 30,
  },
  info: {
    rowGap: 5,
    marginBottom: 30,
  },
  titleStyle: {
    color: "#fff",
    fontFamily: "openSansBold",
    fontSize: 15,
    marginBottom: 6,
  },
  textStyle: {
    color: "#fff",
    fontFamily: "openSansRegular",
    marginBottom: 4,
  },
  infoContainerStyle: {
    padding: 6,
  },
  presalesContainer: {
    padding: 6,
    marginBottom: 30,
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "openSansBold",
    marginBottom: 10,
  },
  seeMore: {
    color: Colors.primary600,
    fontFamily: "openSansRegular",
  },
  pleaseNoteContainer: {
    marginBottom: 5,
  },
  pleaseNoteText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "openSansRegular",
  },
  accessibilityContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 10,
  },
});
