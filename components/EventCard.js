import moment from "moment";
import "moment/locale/fr";
import { memo } from "react";
import { SCREEN_EVENT } from "../globals";
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import IconButton from "../components/IconButton";
import Button from "./Button";
import CategoryTag from "./CategoryTag";

function EventCard({ eventInfo }) {
  const navigation = useNavigation();

  const formatPrice = (price) =>
    price.toString().includes(".") ? price.toFixed(2) : price;

  const onPressFunction = (eventData) => navigation.navigate(SCREEN_EVENT, { data: eventData });

  return (
    <View style={styles.card}>
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, styles.day]}>
          {moment(eventInfo.dates.start.localDate).format("D")}
        </Text>
        <Text style={[styles.dateText, styles.month]}>
          {moment(eventInfo.dates.start.localDate).format("MMM")}
        </Text>
        <Text style={[styles.dateText, styles.year]}>
          {moment(eventInfo.dates.start.localDate).format("YYYY")}
        </Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={{ uri: eventInfo.media.url }} style={styles.image} />
      </View>
      <View style={styles.tagContainer}>
        <CategoryTag
          name={eventInfo.genre.name}
          color={eventInfo.genre.color}
        />
      </View>
      <View style={styles.eventInfo}>
        <View style={styles.favIconContainer}>
          <Text style={styles.name}>{eventInfo.name}</Text>
          {/* <Pressable
            onPress={() => console.log("ajout aux favoris")}
            style={styles.favIcon}
          >
            <IconButton icon="heart-outline" size={26} color="#111" />
          </Pressable> */}
        </View>
        <View style={styles.addressContainer}>
          <View style={styles.infoContainer}>
            <IconButton icon="map-marker-outline" size={20} color="#111" />
            <Text style={styles.address} ellipsizeMode='tail' numberOfLines={1}>
              {eventInfo.address.split(",")[0]}
            </Text>
          </View>
          <View style={[styles.infoContainer, styles.timeInfo]}>
            <IconButton icon="clock-outline" size={19} color="#111" />
            <Text style={styles.address}>
              {eventInfo.dates.start.localTime.substring(0, 5)}
            </Text>
          </View>
        </View>
        <View style={[styles.infoContainer, styles.priceInfo]}>
          <IconButton icon="ticket-confirmation-outline" size={19} color="#111" />
          <Text style={styles.price}>
            {eventInfo.priceRanges[0].min === eventInfo.priceRanges[0].max
              ? `${formatPrice(eventInfo.priceRanges[0].max)}€`
              : `De ${formatPrice(eventInfo.priceRanges[0].min)}€ à ${formatPrice(
                  eventInfo.priceRanges[0].max
                )}€`}
          </Text>
        </View>
        {eventInfo.createdGroupsTotal > 0 && (
          <View style={styles.infoContainer}>
            <IconButton icon="account-group-outline" size={19} color="#111" />
            <Text style={styles.price}>
              {eventInfo.createdGroupsTotal} groupe(s) créé(s)
            </Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button text="Voir plus" onPress={() => onPressFunction(eventInfo)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    alignSelf: "center",
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    margin: 5,
  },
  imageContainer: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
  },
  image: {
    height: "100%",
    resizeMode: "cover",
  },
  dateContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 60,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    zIndex: 2,
  },
  dateText: {
    flex: 1,
    textAlign: "center",
    fontFamily: "openSansBold",
  },
  day: {
    fontSize: 15,
  },
  month: {
    fontSize: 13,
    fontFamily: "openSansRegular",
  },
  year: {
    fontSize: 15,
  },
  eventInfo: {
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 5
  },
  favIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 5,
    alignItems: "center",
    marginVertical: 6
  },
  favIcon: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 44,
    height: 44,
  },
  name: {
    flexShrink: 1,
    fontSize: 19,
    fontFamily: "montserratBold",
    letterSpacing: 0.3,
  },
  infoContainer: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
  },
  addressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: 4,
    marginBottom: 6,
  },
  address: {
    width: "75%",
    fontSize: 15,
    fontFamily: "openSansRegular",
    textTransform: "capitalize",
  },
  timeInfo: {
    flexShrink: 0,
    width: "25%",
    fontSize: 15,
  },
  priceInfo: {
    marginBottom: 6
  },
  price: {
    fontSize: 15,
    fontFamily: "openSansRegular",
  },
  buttonContainer: {
    marginTop: 15,
  },
});

export default memo(EventCard);
