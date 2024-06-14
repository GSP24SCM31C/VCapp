import { StatusBar } from "expo-status-bar";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { React, useState, useLayoutEffect, useEffect } from "react";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import BackButton from "../../components/backButton";
import EventRow from "./EventRow";
import { getNgoInfo, getAllEventsByNgoId } from "../../backend/getApiRequests";

// const dimensions = Dimensions.get("window").width

const NgoScreen = ({ route }) => {
  const navigation = useNavigation();

  const ngoData = route.params["ngoData"];
  const [ngoDetails, setNgoDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState([{}]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  async function getEventDetails() {
    try {
      const events_per_ngo = await getAllEventsByNgoId(ngoData.ngo_id);
      setEventDetails(events_per_ngo);
    } catch (error) {
      throw error;
    }
  }

  async function getNgoDetails() {
    try {
      const response = await getNgoInfo(ngoData.ngo_id);
      setNgoDetails(response);
      setLoading(false);
    } catch (err) {
      throw err;
    }
  }

  useEffect(() => {
    getNgoDetails();
    getEventDetails();
  }, []);

  const saved_ngo = ngoDetails;

  return (
    <SafeAreaView className="bg-white">
      {loading ? <Text>Loading</Text> : null}
      {ngoDetails &&
        ngoDetails.map((data) => (
          <ScrollView key={data.id}>
            <BackButton />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
            >
              <Image
                source={{ uri: "https://picsum.photos/1091/300" }}
                style={styles.image}
              />
              <View>
                <Text style={{ paddingLeft: 10, fontSize: 40 }}>
                  {data.ngo_display_name}
                </Text>
                <Text style={{ paddingLeft: 10, fontSize: 15, color: "gray" }}>
                  {data.category}
                </Text>
              </View>
            </View>
            <View>
              <View style={styles.element}>
                <Text style={styles.title}>Description</Text>
                <Text style={styles.paragraph}>
                  {data.description}
                  {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer porttitor lorem id augue egestas convallis. Etiam eu finibus eros, sed iaculis felis. Donec sagittis sollicitudin augue. Proin eleifend blandit pulvinar. Morbi id tincidunt urna, sit amet efficitur purus. Sed non diam at dolor luctus vehicula. Etiam sit amet sapien euismod. */}
                </Text>
              </View>
              <View style={styles.element}>
                <Text style={styles.title}>Address</Text>
                <Text style={styles.paragraph}>{data.address}</Text>
              </View>

              {data.email != null || data.contact_phone != null ? (
                <View style={styles.element}>
                  <Text style={styles.title}>Contact</Text>
                  {data.email != null ? (
                    <Text style={styles.paragraph}>
                      Email: {data.contact_email}
                    </Text>
                  ) : null}
                  {data.contact_phone != null ? (
                    <Text style={styles.paragraph}>
                      Phone: {data.contact_phone}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            <View className="pb-36 bg-white">
              <Text className="px-6 py-4 text-2xl font-bold">Events</Text>
              {eventDetails && eventDetails.length != 0 ? (
                eventDetails.map((event, index) => (
                  <View
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 20,
                      },
                      shadowOpacity: 0.15,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                    key={index}
                  >
                    <EventRow
                      key={index}
                      event={event}
                      saved_ngo={ngoData.ngo_id}
                    />
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", fontSize: 20 }}>
                  No events for this NGO currently
                </Text>
              )}
            </View>
          </ScrollView>
        ))}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    paddingLeft: 12.5,
  },
  element: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  paragraph: {
    alignItems: "center",
    fontSize: 15,
    paddingLeft: 20,
    color: "gray",
  },
  image: {
    borderRadius: 25,
    borderWidth: 1,
    width: 150,
    height: 150,
  },
});

export default NgoScreen;
