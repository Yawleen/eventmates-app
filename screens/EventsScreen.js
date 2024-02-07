import { requestOptions } from "../helpers/requestOptions";
import { useEffect, useState, useRef } from "react";
import { ANDROID, AUTH_TOKEN } from "../globals";
import Colors from "../globals/colors";
import { getValueFor } from "../helpers/secureStore";
import { Searchbar } from "react-native-paper";
import { useScrollToTop } from "@react-navigation/native";
import { useCollapsibleHeader } from "react-navigation-collapsible";
import Modal from "react-native-modal";
import { CheckBox } from "@rneui/themed";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  Animated,
  Platform,
  FlatList,
} from "react-native";
import EventCard from "../components/EventCard";
import IconButton from "../components/IconButton";
import Button from "../components/Button";

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
  const [showGenres, setShowGenres] = useState(false);
  const [isGenresLoading, setIsGenresLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
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
          `${
            process.env.EXPO_PUBLIC_API_URL
          }/events?page=${page}&eventName=${searchQuery}&genres=${selectedGenres.join(
            ","
          )}`,
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
    if (showGenres) {
      setShowGenres(false);
    }
  };

  const renderEventCard = ({ item }) => <EventCard eventInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  const toggleGenresModal = () => setShowGenres(!showGenres);

  const fetchGenres = async () => {
    setIsGenresLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);
      if (token) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/genres`,
          requestOptions("GET", token)
        ).then((response) => {
          response.json().then((data) => {
            setGenres(data.genres);
            setIsGenresLoading(false);
          });
        });
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
      setIsGenresLoading(false);
    }
  };

  const renderGender = ({ item }) => (
    <CheckBox
      checked={selectedGenres.includes(item.name)}
      checkedColor={item.color}
      uncheckedColor="#111"
      textStyle={styles.checkBoxText}
      title={item.name}
      onPress={() => handleGenresSelection(item.name)}
    />
  );

  const handleGenresSelection = (genre) => {
    if (selectedGenres.includes(genre)) {
      const selectedGenresCopy = [...selectedGenres];
      const genreIndex = selectedGenresCopy.findIndex(
        (selectedGenre) => selectedGenre === genre
      );
      selectedGenresCopy.splice(genreIndex, 1);
      setSelectedGenres(selectedGenresCopy);
      return;
    }

    setSelectedGenres([...selectedGenres, genre]);
  };

  useEffect(() => {
    if (!eventsInfo.isLastPage) {
      fetchEvents();
    }

    fetchGenres();
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
          <View style={styles.genresFilter}>
            <IconButton
              icon="music"
              size={20}
              color="#111"
              onPress={toggleGenresModal}
            />
          </View>
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
      {showGenres && (
        <Modal
          isVisible={showGenres}
          backdropColor="#111"
          backdropOpacity={0.6}
          onBackdropPress={toggleGenresModal}
          hideModalContentWhileAnimating={true}
        >
          <View style={styles.modal}>
            <View style={styles.closeIconContainer}>
              <Text style={styles.genresText}>Filtrer par genre(s) :</Text>
              <IconButton
                icon="close"
                size={26}
                color="#111"
                onPress={toggleGenresModal}
              />
            </View>
            <FlatList
              data={genres}
              renderItem={renderGender}
              keyExtractor={setKeyExtractor}
              {...(isGenresLoading && {
                ListFooterComponent: () => (
                  <ActivityIndicator
                    size="large"
                    style={styles.loader}
                    color={Colors.primary600}
                  />
                ),
              })}
            />
            {!isGenresLoading && (
              <View style={styles.buttonContainer}>
                <Button text="Filtrer" onPress={onSubmitSearch} />
              </View>
            )}
          </View>
        </Modal>
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
    flexDirection: "row",
    columnGap: 5,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: "#232238",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  searchBar: {
    flexGrow: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  searchBarInput: {
    fontFamily: "openSansRegular",
  },
  genresFilter: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
  },
  closeIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genresText: {
    fontSize: 15,
    fontFamily: "openSansBold",
    marginBottom: 10,
  },
  checkBoxText: { fontFamily: "openSansRegular", fontSize: 15 },
  buttonContainer: {
    marginTop: 15,
  },
});
