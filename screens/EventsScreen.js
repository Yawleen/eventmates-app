import { requestOptions } from "../helpers/requestOptions";
import { useEffect, useState, useRef } from "react";
import { AUTH_TOKEN } from "../globals";
import Colors from "../globals/colors";
import { getValueFor } from "../helpers/secureStore";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
} from "react-native";
import EventCard from "../components/EventCard";
import IconButton from "../components/IconButton";

export default function EventsScreen() {
  const flatList = useRef();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  const onPressFunction = () =>
    flatList.current.scrollToOffset({ animated: true, offset: 0 });

  const renderEventCard = ({ item }) => <EventCard eventInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  const fetchEvents = async () => {
    setIsLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);
      if (token) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/events?page=${page}`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setEvents([...events, ...data.events]);
            setIsLoading(false);
            if (data.totalPage === page) {
              setIsLastPage(true);
              return;
            }
            setPage((prevPage) => prevPage + 1);
          });
        });
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLastPage && !isLoading) {
      fetchEvents();
    }
  };

  useEffect(() => {
    if(!isLastPage) {
      fetchEvents();
    }
  }, []);

  return (
    <View style={styles.eventsPage}>
      <View style={styles.eventsListContainer}>
        <FlatList
          ref={flatList}
          data={events}
          contentContainerStyle={styles.eventsList}
          renderItem={renderEventCard}
          keyExtractor={setKeyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() =>
            isLastPage ? (
              <Text style={styles.pageText}>
                {events.length} sur {events.length}
              </Text>
            ) : (
              <ActivityIndicator
                size="large"
                style={styles.loader}
                color={Colors.primary900}
              />
            )
          }
          ItemSeparatorComponent={<View style={styles.separator}></View>}
        />
        {events.length > 0 && (
          <Pressable style={styles.button} onPress={onPressFunction}>
            <IconButton icon="chevron-up" size={26} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventsPage: {
    flex: 1,
    justifyContent: "center",
  },
  eventsListContainer: {
    padding: 20,
  },
  eventsList: {
    padding: 6,
  },
  loader: {
    marginTop: 20,
  },
  separator: {
    height: 20,
  },
  pageText: {
    textAlign: "center",
    marginVertical: 15,
    fontSize: 15,
    fontFamily: "montserratBold",
  },
  button: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: Colors.primary700,
    right: 15,
    bottom: 30,
  },
});
