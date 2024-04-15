import { useLayoutEffect } from "react";
import moment from "moment";
import "moment/locale/fr";
import Colors from "../globals/colors";
import { SCREEN_EVENT } from "../globals";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import IconButton from "../components/IconButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function GroupScreen({ route, navigation }) {
  const groupInfo = route.params.data;

  const redirectToEvent = () =>
    navigation.navigate(SCREEN_EVENT, { data: groupInfo.event });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Groupe ${groupInfo.name}`,
    });
  }, [navigation, groupInfo.name]);

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
          Membres du groupe ({groupInfo.users.length}/{groupInfo.maxCapacity})
        </Text>
        <View style={styles.membersContainer}>
          <View style={styles.members}>
            <MaterialCommunityIcons name="account" size={18} color="#fff" />
            <Text style={styles.memberName}>
              {groupInfo.creator.username} (Créateur)
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
        <Text style={styles.infoText}>{groupInfo.description}</Text>
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
    marginBottom: 90,
    overflow: "hidden",
  },
  eventImage: {
    flexShrink: 0,
    width: "35%",
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
});
