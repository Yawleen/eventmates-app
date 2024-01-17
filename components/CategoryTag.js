import { StyleSheet, Text, View } from "react-native";

export default function CategoryTag({ name, color }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.tagName}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  tagName: {
    color: "white",
    fontWeight: "bold",
  },
});
