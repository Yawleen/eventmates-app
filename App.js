import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState("");

  const fetchMessage = () => {
    fetch(process.env.EXPO_PUBLIC_API_URL)
      .then((response) => response.json())
      .then((data) => {
        setData(data.message);
      })
      .catch((error) => {
        console.error("Erreur de requête :", error);
      });
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{data}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
