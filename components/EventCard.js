import moment from "moment";
import "moment/locale/fr";
import { memo } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import Icon from "../components/IconButton";
import Button from "./Button";
import CategoryTag from "./CategoryTag";

function EventCard({ eventInfo }) {
  const formatPrice = (price) =>
    price.toString().includes(".") ? price.toFixed(2) : price;

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
        <Image source={{ uri: eventInfo.media[0].url }} style={styles.image} />
      </View>
      <View style={styles.tagContainer}>
        <CategoryTag
          name={eventInfo.genre.name}
          color={eventInfo.genre.color}
        />
      </View>
      <View style={styles.favIconContainer}>
        <Text style={styles.name}>{eventInfo.name}</Text>
        <Pressable
          onPress={() => console.log("ajout aux favoris")}
          style={styles.favIcon}
        >
          <Icon icon="heart-outline" size={26} color="#111" />
        </Pressable>
      </View>
      <View style={styles.addressContainer}>
        <Icon icon="map-marker-outline" size={20} color="#111" />
        <Text style={styles.address}>
          {eventInfo.address.replace(", ", "\n")}
        </Text>
      </View>
      <View style={styles.addressContainer}>
        <Icon icon="clock-outline" size={19} color="#111" />
        <Text style={styles.address}>
          {eventInfo.dates.start.localTime.substring(0, 5)}
        </Text>
      </View>
      <View style={styles.addressContainer}>
        <Icon icon="wallet" size={19} color="#111" />
        <Text style={styles.price}>
          {eventInfo.priceRanges[0].min === eventInfo.priceRanges[0].max
            ? `${formatPrice(eventInfo.priceRanges[0].max)}€`
            : `De ${formatPrice(eventInfo.priceRanges[0].min)}€ à ${formatPrice(
                eventInfo.priceRanges[0].max
              )}€`}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button text="Voir plus" onPress={() => console.log("cc")} />
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
    fontFamily: "montserratBold",
  },
  day: {
    fontSize: 15,
  },
  month: {
    fontSize: 13,
    fontFamily: "montserratRegular",
  },
  year: {
    fontSize: 15,
  },
  favIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
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
    fontSize: 17,
    fontFamily: "montserratBold",
    letterSpacing: 0.5,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    marginBottom: 6,
  },
  address: {
    flex: 1,
    fontFamily: "montserratRegular",
    flexWrap: "wrap",
    textTransform: "capitalize",
  },
  price: {
    fontFamily: "montserratRegular",
  },
  buttonContainer: {
    marginTop: 15,
  },
});

export default memo(EventCard);
