import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const racesApi = axios.get(API_BASE + '/races');