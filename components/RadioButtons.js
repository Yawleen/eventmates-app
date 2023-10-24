import { useState } from "react";
import Colors from "../globals/colors";
import { Text, StyleSheet, Pressable, View } from "react-native";

export default function RadioButtons({ data, onSelect }) {
  const [userOption, setUserOption] = useState("");

  const selectHandler = (value) => {
    onSelect(value);
    setUserOption(value);
  };

  return (
    <View style={styles.container}>
      {data.map((value) => (
        <Pressable
          key={value.id}
          style={
            value.id === userOption
              ? { ...styles.input, ...styles.selectedInput }
              : styles.input
          }
          onPress={() => selectHandler(value.id)}
        >
          <Text
            style={
              value.id === userOption
                ? { ...styles.option, ...styles.selectedOption }
                : styles.options
            }
          >
            {value.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    columnGap: 8,
  },
  input: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
  },
  selectedInput: {
    backgroundColor: Colors.primary700,
  },
  option: {
    fontSize: 13,
    fontFamily: "openSansRegular",
    textAlign: "center",
  },
  selectedOption: {
    fontFamily: "openSansBold",
    color: "#fff",
  },
});
