import Colors from "../globals/colors";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Button({
  text,
  height,
  backgroundColor,
  textColor,
  isBold,
  onPress,
}) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          height ? { height } : styles.button,
          pressed ? styles.buttonPressed : null,
        ]}
        android_ripple={{ color: Colors.primary600 }}
        onPress={onPress}
      >
        {backgroundColor || textColor ? (
          <View
            style={[
              styles.gradient,
              {
                backgroundColor: backgroundColor
                  ? backgroundColor
                  : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: textColor ? textColor : "#fff",
                  fontFamily: isBold ? "openSansBold" : "openSansRegular",
                },
              ]}
            >
              {text}
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={[Colors.primary600, Colors.primary900]}
            style={styles.gradient}
          >
            <Text
              style={[
                styles.text,
                { fontFamily: isBold ? "openSansBold" : "openSansRegular" },
              ]}
            >
              {text}
            </Text>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  gradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    color: "white",
  },
});
