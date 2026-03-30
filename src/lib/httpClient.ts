import axios from 'axios'

const apiGateway = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

apiGateway.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
)

export const httpClient = apiGateway
