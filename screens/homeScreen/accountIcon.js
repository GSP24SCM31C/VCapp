import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";

const AccountIcon = () => {
  const [name, setName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    const getFirstName = await AsyncStorage.getItem("first_name");
    const getLastName = await AsyncStorage.getItem("last_name");
    if (
      getFirstName &&
      getFirstName.length > 1 &&
      getLastName &&
      getLastName.length > 1
    ) {
      setName(getFirstName[0] + getLastName[0]);
    } else {
      setName(getFirstName[0]);
    }
  }

  const handleImagePress = () => {
    navigation.navigate("Account");
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleImagePress}
        style={{
          width: RFValue(28),
          height: RFValue(28),
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: RFValue(120),
        }}
      >
        <Text
          style={{ color: "black", fontWeight: "bold", fontSize: RFValue(12) }}
        >
          {name.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountIcon;
