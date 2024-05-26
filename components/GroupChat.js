import { SCREEN_GROUP } from "../globals";
import Colors from "../globals/colors";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, Image } from "react-native";
import IconButton from "./IconButton";

export default function GroupChat({ groupInfo }) {
  const navigation = useNavigation();

  const redirectToGroup = () =>
    navigation.navigate(SCREEN_GROUP, {
      data: { groupId: groupInfo._id, eventId: groupInfo.event._id },
    });

  return (
    <View style={styles.groupEvent}>
      <View style={styles.eventImage}>
        <Image
          style={styles.image}
          source={{ uri: groupInfo?.event?.media?.url }}
        />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{groupInfo.name}</Text>
        <View style={styles.iconsContainer}>
          <IconButton
            icon="information"
            size={24}
            color={Colors.primary900}
            onPress={redirectToGroup}
          />
          <IconButton
            icon="wechat"
            size={30}
            color={Colors.primary900}
            onPress={() => console.log("redirect to chat screen")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupEvent: {
    height: 125,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: Colors.primary700,
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
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 15.5,
    fontFamily: "openSansBold",
    textTransform: "uppercase",
    color: Colors.primary900,
    marginBottom: 6,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
});
