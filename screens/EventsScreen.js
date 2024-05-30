import { requestOptions } from "../helpers/requestOptions";
import { useEffect, useState, useRef } from "react";
import { ANDROID, AUTH_TOKEN } from "../globals";
import Colors from "../globals/colors";
import { getValueFor } from "../helpers/secureStore";
import moment from "moment";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Searchbar, RadioButton } from "react-native-paper";
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

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

export default function EventsScreen({ navigation }) {
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
  const [modal, setModal] = useState({
    date: false,
    genres: false,
    sort: false,
  });
  const [isGenresLoading, setIsGenresLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    dateString: "",
    dateUTC: "",
  });
  const [sortBy, setSortBy] = useState("ascPrice");
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

  const fetchEvents = async (
    searchQuery = "",
    events = [],
    page = 1,
    date = ""
  ) => {
    setIsLoading(true);

    try {
      const token = await getValueFor(AUTH_TOKEN);
      if (token) {
        await fetch(
          `${
            process.env.EXPO_PUBLIC_API_URL
          }/events?page=${page}&eventName=${searchQuery}&genres=${selectedGenres.join(
            ","
          )}&date=${date}&sort=${sortBy}`,
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
      fetchEvents(
        searchQuery,
        eventsInfo.events,
        eventsInfo.page,
        selectedDate.dateUTC
      );
    }
  };

  const handleSearch = (query) => setSearchQuery(query);

  const clearSearchInput = async () => {
    setSearchQuery("");
    setIsSearchLoading(true);
    await fetchEvents(undefined, undefined, undefined, selectedDate.dateUTC);
    setIsSearchLoading(false);
    onPressFunction();
  };

  const onSubmitSearch = async () => {
    setIsSearchLoading(true);
    await fetchEvents(searchQuery, undefined, undefined, selectedDate.dateUTC);
    setIsSearchLoading(false);
    onPressFunction();
    if (Object.values(modal).includes(true)) {
      setModal({ date: false, genres: false, sort: false });
    }
  };

  const renderEventCard = ({ item }) => <EventCard eventInfo={item} />;

  const setKeyExtractor = (item) => item._id;

  const toggleModal = (filter) => {
    if (filter) {
      setModal({ ...modal, [filter]: !modal[filter] });
      return;
    }

    setModal({ date: false, genres: false, sort: false });
  };

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

  const resetSelectedDate = async () => {
    setSelectedDate({ dateString: "", dateUTC: "" });
    setIsSearchLoading(true);
    await fetchEvents(searchQuery, undefined, undefined, undefined);
    setIsSearchLoading(false);
    onPressFunction();
    if (Object.values(modal).includes(true)) {
      setModal({ date: false, genres: false, sort: false });
    }
  };

  useEffect(() => {
    const fetch = navigation.addListener("focus", () => {
      if (!eventsInfo.isLastPage) {
        fetchEvents();
      }

      fetchGenres();
    });

    return fetch;
  }, [navigation]);

  return (
    <View style={styles.eventsPage}>
      <View style={styles.eventListContainer}>
        <Animated.FlatList
          onScroll={onScroll}
          contentContainerStyle={[
            styles.eventsList,
            { paddingTop: isLoading ? 200 : 240 },
          ]}
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
          ItemSeparatorComponent={<View style={styles.separator}></View>}
        />
        <Animated.View
          style={[
            {
              transform: [{ translateY }],
              top: Platform.OS === ANDROID ? 80 : 92,
            },
            styles.stickyBar,
          ]}
        >
          <View style={styles.searchBarContainer}>
            <Searchbar
              placeholder="Rechercher..."
              style={styles.searchBar}
              iconColor={Colors.primary900}
              inputStyle={styles.searchBarInput}
              numberOfLines={1}
              value={searchQuery}
              loading={isSearchLoading ? true : false}
              onChangeText={(query) => handleSearch(query)}
              {...(!isSearchLoading &&
                !isLoading && { onSubmitEditing: onSubmitSearch })}
              onClearIconPress={clearSearchInput}
            />
            <View style={styles.filter}>
              <IconButton
                icon="calendar-blank"
                size={20}
                color="#111"
                onPress={() => toggleModal("date")}
              />
            </View>
            <View style={styles.filter}>
              <IconButton
                icon="music"
                size={20}
                color="#111"
                onPress={() => toggleModal("genres")}
              />
            </View>
          </View>
          {!isLoading && (
            <View style={styles.sortFilterContainer}>
              <View style={styles.nbOfEventsContainer}>
                <Text style={styles.nbOfEventsBold}>
                  {eventsInfo.nbOfEvents}
                </Text>
                <Text style={styles.nbOfEvents}>événement(s) à venir</Text>
              </View>
              <Pressable
                style={styles.sortFilter}
                onPress={() => toggleModal("sort")}
              >
                <Text style={styles.sortFilterText}>Trier par</Text>
                <IconButton icon="chevron-down" size={20} color="#fff" />
              </Pressable>
            </View>
          )}
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
      {Object.values(modal).includes(true) && (
        <Modal
          isVisible={true}
          backdropColor="#111"
          backdropOpacity={0.6}
          onBackdropPress={() => toggleModal()}
          hideModalContentWhileAnimating={true}
        >
          <View style={styles.modal}>
            <View style={styles.closeIconContainer}>
              <Text style={styles.modalText}>
                {modal.sort
                  ? "Trier par"
                  : `Filtrer par ${modal.genres ? "genre(s)" : "date"} :`}
              </Text>
              <IconButton
                icon="close"
                size={26}
                color="#111"
                onPress={
                  modal.genres
                    ? () => toggleModal("genres")
                    : modal.date
                    ? () => toggleModal("date")
                    : () => toggleModal("sort")
                }
              />
            </View>
            {modal.genres && (
              <>
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
              </>
            )}
            {modal.date && (
              <>
                <Calendar
                  minDate={moment().format("YYYY-MM-DD")}
                  onDayPress={(day) =>
                    setSelectedDate({
                      dateString: day.dateString,
                      dateUTC: moment(day.timestamp).utc().format(),
                    })
                  }
                  monthFormat={"MMMM yyyy"}
                  theme={{
                    todayTextColor: Colors.primary900,
                    selectedDayTextColor: "#fff",
                    selectedDayBackgroundColor: Colors.primary900,
                    dayTextColor: "#111",
                    textMonthFontWeight: "bold",
                    textMonthFontSize: 16,
                    textDayFontSize: 16,
                    arrowColor: Colors.primary900,
                  }}
                  markedDates={{
                    [selectedDate.dateString]: { selected: true },
                  }}
                  disableMonthChange={true}
                  firstDay={1}
                  hideDayNames={false}
                  onPressArrowLeft={(subtractMonth) => subtractMonth()}
                  onPressArrowRight={(addMonth) => addMonth()}
                  disableAllTouchEventsForDisabledDays={true}
                  enableSwipeMonths={true}
                />
                <View style={styles.buttonContainer}>
                  <Button text="Filtrer" onPress={onSubmitSearch} />
                </View>
                <View style={styles.resetButtonContainer}>
                  <Button
                    text="Réinitialiser"
                    textColor={Colors.primary700}
                    onPress={resetSelectedDate}
                  />
                </View>
              </>
            )}
            {modal.sort && (
              <>
                <RadioButton.Group
                  onValueChange={(value) => setSortBy(value)}
                  value={sortBy}
                >
                  <RadioButton.Item
                    textStyle={styles.checkBoxText}
                    value="ascPrice"
                    label="Prix croissant"
                    color={Colors.primary900}
                    uncheckedColor="#111"
                    status={sortBy === "ascPrice" ? "checked" : "unchecked"}
                  />
                  <RadioButton.Item
                    textStyle={styles.checkBoxText}
                    value="descPrice"
                    label="Prix décroissant"
                    color={Colors.primary900}
                    uncheckedColor="#111"
                    status={sortBy === "descPrice" ? "checked" : "unchecked"}
                  />
                  <RadioButton.Item
                    textStyle={styles.checkBoxText}
                    value="ascStartDate"
                    label="Date croissante"
                    color={Colors.primary900}
                    uncheckedColor="#111"
                    status={sortBy === "ascStartDate" ? "checked" : "unchecked"}
                  />
                  <RadioButton.Item
                    textStyle={styles.checkBoxText}
                    value="descStartDate"
                    label="Date décroissante"
                    color={Colors.primary900}
                    uncheckedColor="#111"
                    status={
                      sortBy === "descStartDate" ? "checked" : "unchecked"
                    }
                  />
                </RadioButton.Group>
                <View style={styles.buttonContainer}>
                  <Button text="Trier" onPress={onSubmitSearch} />
                </View>
              </>
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
  sortFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: 30,
    marginVertical: 12,
  },
  sortFilter: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 2,
  },
  sortFilterText: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    color: "#fff",
  },
  nbOfEventsContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 5,
  },
  nbOfEvents: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "montserratRegular",
  },
  nbOfEventsBold: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "montserratBold",
  },
  eventListContainer: {
    flex: 1,
    paddingTop: 10,
  },
  eventsList: {
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
    bottom: 30,
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
    bottom: 30,
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
    borderRadius: 5,
    backgroundColor: Colors.primary700,
  },
  stickyBar: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 5,
    backgroundColor: "#232238",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  searchBarContainer: { flexDirection: "row", columnGap: 5, marginBottom: 10 },
  searchBar: {
    flexGrow: 1,
    columnGap: -5,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  searchBarInput: {
    flexGrow: 1,
    fontFamily: "openSansRegular",
  },
  filter: {
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
  modalText: {
    fontSize: 15,
    fontFamily: "openSansBold",
    marginBottom: 10,
  },
  checkBoxText: { color: "#111", fontFamily: "openSansRegular", fontSize: 15 },
  buttonContainer: {
    marginTop: 15,
  },
  resetButtonContainer: {
    marginTop: 4,
  },
});
