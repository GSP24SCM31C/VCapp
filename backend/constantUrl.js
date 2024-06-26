//const baseurl = 'https://shepherd-moved-heavily.ngrok-free.app/'
const baseurl = "http://172.20.10.2:5000/";
export const signupNgo = baseurl + "signup-ngo";
export const signupUser = baseurl + "signup-user";
export const login = baseurl + "login";
export const getAllCategories = baseurl + "getCategories";
export const getNgoBasedOnCategoryId = baseurl + "category";
export const getNgoDetailsBasedOnNgoId = baseurl + "ngo";
export const addEvent = baseurl + "add-event";
export const addVolunteer = baseurl + "volunteerEvent";
export const getVolunteerForEvent = baseurl + "getVounteers";
export const getEventsForUser = baseurl + "eventsVolunteered";
export const getAllEventsByNgoId = baseurl + "getEvents";
export const getNgoNames = baseurl + "search";
export const refreshToken = baseurl + "refresh";
export const logout = baseurl + "logout";
export const removeVolunteer = baseurl + "removeVolunteerEvent";
export const checkUserRegistration = baseurl + "checkUserRegistration";
