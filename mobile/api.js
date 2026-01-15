import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your IP address (localhost doesn't work on physical phones)
const BASE_URL = 'https://skilltracker-server.vercel.app/api'; 

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;