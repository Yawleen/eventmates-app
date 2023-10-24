import { useAppContext } from "../context/appContext";
import { View } from "react-native";
import Button from "../components/Button";

export default function HomeScreen() {
  const { setIsSignedIn } = useAppContext();

  const logOut = () => setIsSignedIn(false)

  return (
    <View>
      <Button text="Se déconnecter" onPress={logOut} />
    </View>
  );
}
