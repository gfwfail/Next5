import axios from 'axios'

const API_BASE = 'http://vuejs.com.au/api/v1';

export const racesApi = axios.get(API_BASE + '/races');