import jwt_decode from "jwt-decode";
import { getValueFor } from "../helpers/secureStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Colors from "../globals/colors";
import { AUTH_TOKEN, SCREEN_GROUP } from "../globals";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

export default function EventGroup({ groupInfo }) {
  const [isUserGroup, setIsUserGroup] = useState(false);
  const navigation = useNavigation();

  const checkUserGroup = async () => {
    const token = await getValueFor(AUTH_TOKEN);

    if (token) {
      const decodedToken = await jwt_decode(token);
      if (decodedToken.userId === groupInfo.creator._id) {
        setIsUserGroup(true);
        return;
      }

      setIsUserGroup(false);
    }
  };

  const redirectToGroup = () =>
    navigation.navigate(SCREEN_GROUP, {
      data: { groupId: groupInfo._id, eventId: groupInfo.event._id },
    });

  useEffect(() => {
    checkUserGroup();
  }, []);

  return (
    <Pressable
      onPress={redirectToGroup}
      style={
        isUserGroup
          ? [styles.eventGroup, styles.eventUserGroup]
          : styles.eventGroup
      }
    >
      <Text style={styles.eventGroupName}>{groupInfo.name}</Text>
      <View style={styles.membersContainer}>
        <MaterialCommunityIcons name="account" size={18} color="#111" />
        <Text style={styles.eventGroupText}>
          Créateur :{" "}
          <Text style={styles.eventGroupInfoTextBold}>
            {isUserGroup
              ? `${groupInfo.creator.username} (Toi)`
              : groupInfo.creator.username}{" "}
          </Text>
        </Text>
      </View>
      <Text
        style={[styles.eventGroupText, styles.description]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {groupInfo.description}
      </Text>
      <View style={[styles.membersContainer, styles.maxCapacityContainer]}>
        <MaterialCommunityIcons name="account-group" size={18} color="#111" />
        <Text style={styles.eventGroupText}>
          <Text style={styles.eventGroupInfoTextBold}>
            {groupInfo.users.length}
          </Text>{" "}
          membre(s) /{" "}
          <Text style={styles.eventGroupInfoTextBold}>
            {groupInfo.maxCapacity}
          </Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eventGroup: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderColor: Colors.textColor,
    borderWidth: 1,
  },
  eventUserGroup: {
    borderColor: Colors.primary600,
    borderWidth: 3,
  },
  eventGroupName: {
    textAlign: "center",
    textTransform: "uppercase",
    fontFamily: "openSansBold",
    fontSize: 17,
    color: Colors.primary900,
    marginBottom: 20,
  },
  membersContainer: {
    flexDirection: "row",
    columnGap: 5,
    marginBottom: 5,
  },
  maxCapacityContainer: {
    marginTop: 15,
  },
  eventGroupText: {
    fontFamily: "openSansRegular",
    fontSize: 15,
    color: Colors.textColor,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
  },
  eventGroupInfoTextBold: {
    fontFamily: "openSansBold",
  },
});
