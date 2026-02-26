import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { getRestApiUrl } from '../utils/apiConfig.js'

// We create a separate axios instance for the REST API
const api = axios.create()

export default defineBoot(({ app, store, router }) => {
  // Set baseURL dynamically from config
  api.defaults.baseURL = getRestApiUrl(store)

  // Request Interceptor: Attach Token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response Interceptor: Handle Token Expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        store.commit('setMyAuthenticate', false)
        router.push('/registration/LoginPage') // Adjust path if needed
      }
      return Promise.reject(error)
    }
  )

  // Synchronize global axios defaults too, in case components use it directly
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
