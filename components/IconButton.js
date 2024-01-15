import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function IconButton({ style, icon, size, color, onPress }) {
  return (
    <Pressable style={style} {...(onPress && { onPress: onPress })}>
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </Pressable>
  );
}
