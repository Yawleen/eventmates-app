import { StyleSheet, Text, View } from "react-native";

export default function CategoryTag({ name, color, isBig }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }, { paddingVertical: isBig ? 8 : 5, paddingHorizontal: isBig ? 15 : 11 }]}>
      <Text style={styles.tagName}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    borderRadius: 5,
  },
  tagName: {
    fontFamily: "openSansBold",
    color: "white",
    fontSize: 14
  },
});
