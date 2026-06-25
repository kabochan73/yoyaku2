import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true, // Axios 1.x でクロスオリジンCSRFトークンを自動送信するために必要
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default api
