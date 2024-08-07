//code for signup
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { RadioButton } from "react-native-paper";
import {
  signUpNgo,
  signUpUser,
  getCategories,
  getGeoCode,
} from "../../backend/getApiRequests";
import { Formik } from "formik";
import * as yup from "yup";
import { RFValue } from "react-native-responsive-fontsize";
import {
  getAddressResults,
  getCityResults,
  checkIfDataExists,
} from "../../backend/getApiRequests";
const { width } = Dimensions.get("window");

const ngoSignUpValidationSchema = yup.object().shape({
  userName: yup
    .string()
    .min(3, "Username is too short")
    .max(50, "Username is too long")
    .required("Username is required")
    .test(
      "checkUsername",
      "Username already exists",
      async function checkIfDataExistsApi(value) {
        try {
          const response = await checkIfDataExists(value, "username");
          return response.message !== "Username already exists";
        } catch (error) {
          console.error("Error fetching data:", error);
          return false;
        }
      }
    ),

  ngoEmail: yup
    .string()
    .email("Enter a valid Email Address")
    .required("Email is required")
    .test(
      "checkEmail",
      "Email already exists",
      async function checkIfDataExistsApi(value) {
        try {
          const response = await checkIfDataExists(value, "email");
          return response.message !== "Email already exists";
        } catch (error) {
          console.error("Error fetching data:", error);
          return false;
        }
      }
    ),

  number: yup
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(19, "Phone number can be maximum 19 digits")
    .required("Phone number is required"),

  ngoPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  ngoConfirmPassword: yup
    .string()
    .oneOf([yup.ref("ngoPassword"), null], "Passwords must match")
    .required("Confirm Password is required"),

  address: yup
    .string()
    // .min(3, "Address is too short")
    .required("Address is required"),

  city: yup
    .string()
    // .min(2, "City name is too short")
    // .max(50, "City name is too long")
    .required("City is required"),

  description: yup
    .string()
    .min(2, "Description is too short")
    .max(300, "Description is too long. Maximum 300 characters allowed")
    .required("Description is required"),

  category: yup.string().required("Select a category from the list"),
});

const userSignUpValidationSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(3, "Firstname is too short")
    .max(50, "Firstname is too long")
    .required("Firstname is required"),
  lastName: yup
    .string()
    .min(3, "Lastname is too short")
    .max(50, "Lastname is too long")
    .required("Lastname is required"),

  userEmail: yup
    .string()
    .email("Enter a valid Email")
    .required("User email is required")
    .test(
      "checkUserEmail",
      "Email already exists",
      async function checkIfDataExistsApi(value) {
        try {
          const response = await checkIfDataExists(value, "email");
          return response.message !== "Email already exists";
        } catch (error) {
          console.error("Error fetching data:", error);
          return false;
        }
      }
    ),

  userPassword: yup
    .string()
    .min(6, "User password must be at least 6 characters")
    .required("User password is required"),

  userConfirmPassword: yup
    .string()
    .oneOf([yup.ref("userPassword"), null], "Passwords must match")
    .required("Confirm Password is required"),

  age: yup.string().required("Age is required"),

  number: yup
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(19, "Phone number can be maximum 19 digits")
    .required("Phone number is required"),
});

const Signup = () => {
  const navigation = useNavigation();
  const [selectedValue, setSelectedValue] = useState("NGO");
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchCityText, setSearchCityText] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [cityPredictions, setCityPredictions] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [categoryListVisible, setCategoryListVisible] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(30);
  const handleDescriptionChange = (event) => {
    setDescriptionHeight(event.nativeEvent.contentSize.height);
  };

  const ngoRequestObject = {
    userName: "",
    ngoEmail: "",
    number: "",
    ngoPassword: "",
    ngoConfirmPassword: "",
    address: "",
    city: "",
    description: "",
    category: null,
  };

  const userRequestObject = {
    firstName: "",
    lastName: "",
    phone: "",
    userEmail: "",
    userPassword: "",
    userConfirmPassword: "",
    age: "",
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  //fetch geo code from place id
  async function getGeoCodeFromPlaceId(place_id) {
    try {
      const response = await getGeoCode(place_id);
      setCurrentPlaceId(response);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  }

  // async function checkIfDataExistsApi(data, type) {
  //   try {
  //     const response = await checkIfDataExists(data, type);
  //     if(response.message=='Email already exists')
  //     {
  //       Alert.alert("Email already exists");
  //       ngoRequestObject.ngoEmail="";
  //     }
  //     return response;
  //   } catch (error) {
  //     console.error("Error fetching predictions:", error);
  //   }
  // }

  //fetch address predictions
  async function fetchPredictions(text) {
    setSearchText(text); // Ensure state is updated here

    if (text) {
      try {
        const response = await getAddressResults(text);
        let tempPredicts = response.predictions.map((prediction) => ({
          key: `${prediction.description}-${prediction.place_id}`,
          name: prediction.description,
          place_id: prediction.place_id,
        }));
        setPredictions(tempPredicts);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    } else {
      setPredictions([]);
    }
  }

  //fetch city predictions
  async function fetchCityPredictions(text) {
    setSearchCityText(text); // Ensure state is updated here
    if (text) {
      try {
        const response = await getCityResults(text);
        let tempPredicts = response.predictions.map((prediction) => ({
          key: `${prediction.description.split(",")[0]}-${prediction.place_id}`,
          name: prediction.description.split(",")[0],
        }));
        setCityPredictions(tempPredicts);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    } else {
      setCityPredictions([]);
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res !== null && res !== undefined) {
        const formattedCategories = res.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setData(formattedCategories);
      }
    } catch (error) {
      console.log("Error fetching categories: ", error);
    }
  };

  const registerNGO = async (userInfo) => {
    console.log(userInfo, "userrrr");
    await signUpNgo(userInfo)
      .then((response) => {
        console.log(
          "===============>signUpNgo: response" + JSON.stringify(response)
        );
        if (response != null || response != undefined) {
          Alert.alert("Ngo registered successfully");
          navigation.replace("Login");
        }
      })
      .catch(async (err) => {
        console.log("===============>signUpNgo: catch" + JSON.stringify(err));
        Alert.alert(err);
      });
  };

  const registerUser = async (userInfo) => {
    // const url = "https://volcomp.pythonanywhere.com/signup-user";
    // let response = fetch(url, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(
    //     firstName,
    //     lastName,
    //     email,
    //     password,
    //     reEnterPassword,
    //     age
    //   ),
    // });
    // result = await response.json();
    // if (result) {
    //   console.warn("Successfully signed up user");
    // }
    await signUpUser(userInfo)
      .then((response) => {
        console.log(
          "===============>signUpUser: response" + JSON.stringify(response)
        );
        if (response != null || response != undefined) {
          Alert.alert("User registered successfully");
          navigation.replace("Login");
        }
      })
      .catch(async (err) => {
        console.log("===============>signUpUser: catch" + JSON.stringify(err));
        Alert.alert(err);
      });
  };

  const toggleCategoryList = () => {
    setCategoryListVisible((prevState) => !prevState);
  };
  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   className="bg-white h-full w-full"
    // >

    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* handshake */}
        {/* <View className="flex-row justify-around w-full absolute">
            <Image className="h-[250] w-[250]" source={require('../../assets/images/handshake2.png')}/>
          </View> */}

        {/* title and form */}
        <View className="h-full w-full flex" style={{ marginTop: 120 }}>
          {/* Title */}

          {/* <View style={{ marginTop: 10 }} className="flex items-center"> */}
          {/* <Text className="text-black font-bold tracking-wider text-3xl mt-5">
              Sign Up
            </Text> */}
          {/* </View> */}

          <View style={{ marginVertical: RFValue(20), alignItems: "center" }}>
            <Text
              style={{
                marginVertical: RFValue(8),
                fontSize: RFValue(14),
                textAlign: "center",
                textAlignVertical: "center",
                fontWeight: "bold",
              }}
            >
              Who are you?
            </Text>

            <RadioButton.Group
              onValueChange={(value) => setSelectedValue(value)}
              value={selectedValue}
            >
              <View className="flex-row items-center">
                <View className="flex-row items-center">
                  <View style={styles.radioButton}>
                    <RadioButton value="NGO" color="green" />
                  </View>
                  <Text className="text-lg bold">NGO</Text>
                </View>
                <View className="flex-row items-center mx-4">
                  <View style={styles.radioButton}>
                    <RadioButton value="User" color="green" />
                  </View>
                  <Text className="text-lg">User</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          {/* Form */}
          <Formik
            key={selectedValue}
            initialValues={
              selectedValue === "NGO" ? ngoRequestObject : userRequestObject
            } // Initial values for form fields
            validationSchema={
              selectedValue === "NGO"
                ? ngoSignUpValidationSchema
                : userSignUpValidationSchema
            } // Validation schema
            onSubmit={(values, actions) => {
              // Handle form submission
              console.log(currentPlaceId); // You can replace this with your submission logic
              const tempRequestObject = {
                ngo_display_name: values.userName,
                contact_email: values.ngoEmail,
                contact_phone: values.number,
                password: values.ngoPassword,
                address: values.address,
                city: values.city,
                description: values.description,
                category: values.category,
                lat_long: currentPlaceId,
              };
              const userRequestObject = {
                first_name: values.firstName,
                last_name: values.lastName,
                phone: values.number,
                contact_email: values.userEmail,
                password: values.userPassword,
                age: values.age,
              };

              selectedValue === "NGO"
                ? registerNGO(tempRequestObject)
                : registerUser(userRequestObject);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View>
                {selectedValue === "NGO" ? (
                  <View className="flex items-center mx-4 space-y-4">
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{
                        width: width < 450 ? "100%" : 600,
                        fontSize: 100,
                      }}
                    >
                      <TextInput
                        placeholder="NGO Name"
                        placeholderTextColor={"gray"}
                        value={values.userName}
                        onChangeText={handleChange("userName")}
                        onBlur={() => {
                          handleChange("userName");
                        }}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.userName && errors.userName && (
                        <Text style={styles.errorTxt}>{errors.userName}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Email"
                        placeholderTextColor={"gray"}
                        inputMode="email"
                        value={values.ngoEmail}
                        onChangeText={handleChange("ngoEmail")}
                        onBlur={() => {
                          handleChange("userName");
                          // checkIfDataExistsApi(values.ngoEmail, "email");
                        }}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.ngoEmail && errors.ngoEmail && (
                        <Text style={styles.errorTxt}>{errors.ngoEmail}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Phone Number"
                        placeholderTextColor={"gray"}
                        inputMode="numeric"
                        value={values.number}
                        onChangeText={handleChange("number")}
                        onBlur={handleBlur("number")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.number && errors.number && (
                        <Text style={styles.errorTxt}>{errors.number}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor={"gray"}
                        value={values.ngoPassword}
                        onChangeText={handleChange("ngoPassword")}
                        onBlur={handleBlur("ngoPassword")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.ngoPassword && errors.ngoPassword && (
                        <Text style={styles.errorTxt}>
                          {errors.ngoPassword}
                        </Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor={"gray"}
                        secureTextEntry
                        value={values.ngoConfirmPassword}
                        onChangeText={handleChange("ngoConfirmPassword")}
                        onBlur={handleBlur("ngoConfirmPassword")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.ngoConfirmPassword &&
                        errors.ngoConfirmPassword && (
                          <Text style={styles.errorTxt}>
                            {errors.ngoConfirmPassword}
                          </Text>
                        )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="NGO Address"
                        placeholderTextColor={"gray"}
                        value={searchText}
                        onChangeText={fetchPredictions}
                        onBlur={handleBlur("address")}
                        style={{ fontSize: RFValue(13) }}
                      />

                      {predictions.length > 0 && (
                        <ScrollView
                          style={{ maxHeight: 200 }}
                          showsVerticalScrollIndicator={true}
                          automaticallyAdjustKeyboardInsets={true}
                        >
                          {predictions.map((item, index) => (
                            <TouchableOpacity
                              onPress={() => {
                                setFieldValue("address", item.name);
                                setSearchText(item.name);
                                getGeoCodeFromPlaceId(item.place_id);
                                setPredictions([]);
                              }}
                              style={{
                                marginTop: RFValue(10),
                              }}
                              key={item.key}
                            >
                              <Text
                                style={{ color: "black", margin: RFValue(6) }}
                              >
                                {item.name}
                              </Text>
                              {index < predictions.length - 1 && (
                                <View
                                  style={{
                                    borderBottomColor: "black",
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                  }}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}

                      {touched.address && errors.address && (
                        <Text style={styles.errorTxt}>{errors.address}</Text>
                      )}
                    </View>
                    {/* Search for City */}
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="City"
                        placeholderTextColor={"gray"}
                        value={searchCityText}
                        onChangeText={fetchCityPredictions}
                        onBlur={handleBlur("city")}
                        style={{ fontSize: RFValue(13) }}
                      />

                      {cityPredictions.length > 0 && (
                        <ScrollView
                          style={{ maxHeight: 200 }}
                          showsVerticalScrollIndicator={true}
                          automaticallyAdjustKeyboardInsets={true}
                        >
                          {cityPredictions.map((item, index) => (
                            <TouchableOpacity
                              onPress={() => {
                                setFieldValue("city", item.name);
                                setSearchCityText(item.name);
                                setCityPredictions([]);
                              }}
                              style={{
                                marginTop: RFValue(10),
                              }}
                              key={item.key}
                            >
                              <Text
                                style={{ color: "black", margin: RFValue(6) }}
                              >
                                {item.name}
                              </Text>
                              {index < cityPredictions.length - 1 && (
                                <View
                                  style={{
                                    borderBottomColor: "black",
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                  }}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                      {touched.city && errors.city && (
                        <Text style={styles.errorTxt}>{errors.city}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="NGO Description"
                        placeholderTextColor={"gray"}
                        inputMode="text"
                        value={values.description}
                        onChangeText={handleChange("description")}
                        onBlur={handleBlur("description")}
                        multiline={true}
                        onContentSizeChange={(event) =>
                          handleDescriptionChange(event)
                        }
                        style={{
                          fontSize: RFValue(13),
                          height: Math.max(40, descriptionHeight),
                        }}
                      />
                      {touched.description && errors.description && (
                        <Text style={styles.errorTxt}>
                          {errors.description}
                        </Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      {/* <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={data}
                        // search
                        maxHeight={150}
                        labelField="label"
                        valueField="value"
                        placeholder={"Select Category"}
                        searchPlaceholder="Search..."
                        value={category}
                        onChange={(item) => {
                          setFieldValue("category", item.value); // Correctly set the formik field value
                          setCategory(item.value);
                        }}
                      /> */}
                      <TextInput
                        placeholder="NGO Category"
                        placeholderTextColor={"gray"}
                        inputMode="text"
                        value={values.category}
                        onChangeText={handleChange("category")}
                        onBlur={handleBlur("category")}
                        editable={false}
                        style={{
                          fontSize: RFValue(13),
                        }}
                        onPress={() => toggleCategoryList()}
                      />
                      {data &&
                        categoryListVisible &&
                        data.map((item, index) => (
                          <ScrollView key={item.value}>
                            <TouchableOpacity
                              onPress={() => {
                                setFieldValue("category", item.value);
                                toggleCategoryList();
                              }}
                            >
                              <Text style={{ marginTop: RFValue(10) }}>
                                {item.value}
                              </Text>
                            </TouchableOpacity>
                            {index < data.length - 1 && (
                              <View
                                style={{
                                  borderBottomColor: "black",
                                  borderBottomWidth: StyleSheet.hairlineWidth,
                                  marginTop: RFValue(10),
                                }}
                              />
                            )}
                          </ScrollView>
                        ))}

                      {touched.category && errors.category && (
                        <Text style={styles.errorTxt}>{errors.category}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      className="w-full p-3 rounded-2xl mb-3"
                      onPress={handleSubmit}
                      style={{
                        backgroundColor: "#20a963",
                        width: width < 450 ? "100%" : 600,
                      }}
                    >
                      <Text
                        className="text-xl font-bold text-white text-center"
                        style={{ fontSize: RFValue(13) }}
                      >
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex items-center mx-4 space-y-4">
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="First name"
                        placeholderTextColor={"gray"}
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.firstName && errors.firstName && (
                        <Text style={styles.errorTxt}>{errors.firstName}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Last name"
                        placeholderTextColor={"gray"}
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.lastName && errors.lastName && (
                        <Text style={styles.errorTxt}>{errors.lastName}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Email"
                        placeholderTextColor={"gray"}
                        inputMode="email"
                        value={values.userEmail}
                        onChangeText={handleChange("userEmail")}
                        onBlur={handleBlur("userEmail")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.userEmail && errors.userEmail && (
                        <Text style={styles.errorTxt}>{errors.userEmail}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Phone Number"
                        placeholderTextColor={"gray"}
                        inputMode="numeric"
                        value={values.number}
                        onChangeText={handleChange("number")}
                        onBlur={handleBlur("number")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.number && errors.number && (
                        <Text style={styles.errorTxt}>{errors.number}</Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor={"gray"}
                        value={values.userPassword}
                        onChangeText={handleChange("userPassword")}
                        onBlur={handleBlur("userPassword")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.userPassword && errors.userPassword && (
                        <Text style={styles.errorTxt}>
                          {errors.userPassword}
                        </Text>
                      )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor={"gray"}
                        secureTextEntry
                        value={values.userConfirmPassword}
                        onChangeText={handleChange("userConfirmPassword")}
                        onBlur={handleBlur("userConfirmPassword")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.userConfirmPassword &&
                        errors.userConfirmPassword && (
                          <Text style={styles.errorTxt}>
                            {errors.userConfirmPassword}
                          </Text>
                        )}
                    </View>
                    <View
                      className="bg-black/5 p-3 rounded-2xl w-full"
                      style={{ width: width < 450 ? "100%" : 600 }}
                    >
                      <TextInput
                        inputMode="numeric"
                        placeholder="Age"
                        placeholderTextColor={"gray"}
                        value={values.age}
                        onChangeText={handleChange("age")}
                        onBlur={handleBlur("age")}
                        style={{ fontSize: RFValue(13) }}
                      />
                      {touched.age && errors.age && (
                        <Text style={styles.errorTxt}>{errors.age}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      className="w-full p-3 rounded-2xl mb-3"
                      onPress={handleSubmit}
                      style={{
                        backgroundColor: "#20a963",
                        width: width < 450 ? "100%" : 600,
                      }}
                    >
                      <Text
                        className="text-xl font-bold text-white text-center"
                        style={{ fontSize: RFValue(13) }}
                      >
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </Formik>

          {/* Button */}
          <View style={{ marginHorizontal: 15, marginTop: 5 }}>
            <View className="flex-row justify-center">
              <Text style={{ fontSize: RFValue(14) }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.replace("Login")}
                className="pr-1 pb-1"
              >
                <Text style={{ color: "blue", fontSize: RFValue(14) }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorTxt: {
    fontSize: RFValue(12),
    color: "red",
    fontWeight: "normal",
    marginTop: 5,
  },

  dropdown: {
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },

  placeholderStyle: {
    fontSize: RFValue(13),
    color: "gray",
  },

  selectedTextStyle: {
    fontSize: RFValue(14),
  },

  iconStyle: {
    width: 20,
    height: 20,
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 14.5,
  },

  radioButton: {
    borderWidth: 3.5,
    borderColor: "black",
    transform: [{ scale: 0.6 }],
    borderRadius: 50,
    marginRight: 5,
    padding: 0.1,
  },
});
