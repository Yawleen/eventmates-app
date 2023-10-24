import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function IconButton({ style, icon, size, color, onPress }) {
  return (
    <Pressable style={style} onPress={onPress}>
      <Feather name={icon} size={size} color={color} />
    </Pressable>
  );
}
