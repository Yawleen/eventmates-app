import { requestOptions } from "../helpers/requestOptions";
import { useEffect, useState, useRef } from "react";
import { ANDROID, AUTH_TOKEN } from "../globals";
import Colors from "../globals/colors";
import { getValueFor } from "../helpers/secureStore";
import { Searchbar } from "react-native-paper";
import { useScrollToTop } from "@react-navigation/native";
import { useCollapsibleHeader } from "react-navigation-collapsible";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  Animated,
  Platform,
} from "react-native";
import EventCard from "../components/EventCard";
import IconButton from "../components/IconButton";

export default function EventsScreen() {
  const flatList = useRef();
  const [eventsInfo, setEventsInfo] = useState({
    events: [],
    nbOfEvents: 0,
    page: 1,
    isLastPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { onScroll, scrollIndicatorInsetTop, translateY } =
    useCollapsibleHeader({
      navigationOptions: {
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
        },
      },
    });
  useScrollToTop(flatList);
  const stickyHeaderHeight = 90;

  const onPressFunction = () =>
    flatList.current.scrollToOffset({ animated: true, offset: 0 });

  const fetchEvents = async (searchQuery = "", events = [], page = 1) => {
    setIsLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);
      if (token) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/events?page=${page}&eventName=${searchQuery}`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setIsLoading(false);
            if (data.totalPage === page || data.totalPage === 0) {
              setEventsInfo({
                ...eventsInfo,
                events: [...events, ...data.events],
                nbOfEvents: data.nbOfEvents,
                isLastPage: true,
              });
              return;
            }
            setEventsInfo({
              events: [...events, ...data.events],
              nbOfEvents: data.nbOfEvents,
              page: page + 1,
              isLastPage: false,
            });
          });
        });
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!eventsInfo.isLastPage && !isLoading) {
      fetchEvents(searchQuery, eventsInfo.events, eventsInfo.page);
    }
  };

  const handleSearch = (query) => setSearchQuery(query);

  const clearSearchInput = async () => {
    setSearchQuery("");
    setIsSearchLoading(true);
    await fetchEvents();
    setIsSearchLoading(false);
    onPressFunction();
  };

  const onSubmitSearch = async () => {
    setIsSearchLoading(true);
    await fetchEvents(searchQuery);
    setIsSearchLoading(false);
    onPressFunction();
  };

  const renderEventCard = ({ item }) => <EventCard eventInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  useEffect(() => {
    if (!eventsInfo.isLastPage) {
      fetchEvents();
    }
  }, []);

  return (
    <View style={styles.eventsPage}>
      <View style={styles.eventListContainer}>
        <Animated.FlatList
          onScroll={onScroll}
          contentContainerStyle={styles.eventsList}
          scrollIndicatorInsets={{
            top: scrollIndicatorInsetTop + stickyHeaderHeight,
          }}
          ref={flatList}
          data={eventsInfo.events}
          renderItem={renderEventCard}
          keyExtractor={setKeyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          {...(isLoading &&
            !eventsInfo.isLastPage && {
              ListFooterComponent: () => (
                <ActivityIndicator
                  size="large"
                  style={styles.loader}
                  color={Colors.primary600}
                />
              ),
            })}
          {...(!isLoading && {
            ListHeaderComponent: () => (
              <Text style={styles.nbOfEvents}>
                <Text style={styles.nbOfEventsBold}>
                  {eventsInfo.nbOfEvents}
                </Text>{" "}
                événement(s) à venir
              </Text>
            ),
          })}
          ItemSeparatorComponent={<View style={styles.separator}></View>}
        />

        <Animated.View
          style={[
            {
              transform: [{ translateY }],
              top: Platform.OS === ANDROID ? 80 : 92,
            },
            styles.searchBarContainer,
          ]}
        >
          <Searchbar
            placeholder="Rechercher un événement"
            style={styles.searchBar}
            iconColor={Colors.primary900}
            inputStyle={styles.searchBarInput}
            value={searchQuery}
            loading={isSearchLoading ? true : false}
            onChangeText={(query) => handleSearch(query)}
            {...(!isSearchLoading &&
              !isLoading && { onSubmitEditing: onSubmitSearch })}
            onClearIconPress={clearSearchInput}
          />
        </Animated.View>
      </View>
      {eventsInfo.events.length > 0 && (
        <>
          <Pressable style={styles.topButton} onPress={onPressFunction}>
            <IconButton icon="chevron-up" size={26} color="#fff" />
          </Pressable>
          <View style={styles.pageTextContainer}>
            <Text style={styles.pageText}>
              {eventsInfo.events.length} / {eventsInfo.nbOfEvents}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  eventsPage: {
    flex: 1,
    justifyContent: "center",
  },
  nbOfEvents: {
    padding: 6,
    fontSize: 15,
    color: "#fff",
    fontFamily: "montserratRegular",
    marginBottom: 10,
  },
  nbOfEventsBold: {
    fontSize: 18,
    fontFamily: "montserratBold",
  },
  eventListContainer: {
    flex: 1,
    paddingTop: 10,
  },
  eventsList: {
    paddingTop: 180,
    paddingHorizontal: 15,
    paddingBottom: 70,
  },
  loader: {
    marginVertical: 20,
  },
  separator: {
    height: 20,
  },
  pageTextContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    borderRadius: 5,
    backgroundColor: Colors.primary900,
    overflow: "hidden",
  },
  pageText: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "openSansBold",
    padding: 10,
  },
  topButton: {
    position: "absolute",
    right: 15,
    bottom: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: Colors.primary700,
  },
  searchBarContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: "#232238",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  searchBar: {
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  searchBarInput: {
    fontFamily: "openSansRegular",
  },
});
