import { StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../globals/colors";

export default function QuantitySelector({ sign, onPress }) {
  return (
    <Pressable style={styles.selector} onPress={onPress}>
      <MaterialCommunityIcons name={sign} size={16} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  selector: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    backgroundColor: Colors.primary900,
    borderRadius: 50,
  },
});
