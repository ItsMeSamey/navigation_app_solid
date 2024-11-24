import { userJwt } from './stateManagement'

export const site = 'http://127.0.0.1:8080/'

// Admin Login
export async function LoginAndStore(token: string): Promise<string> {
  const response = await fetch(site + 'v1/adminApi', {
    method: 'POST',
    body: token,
  })

  const text = await response.text()
  if (response.status !== 200) {
    throw new Error('Login Failed - ' + response.status + '\n' + text)
  }

  userJwt.set(text)
  return text
}


/**
 * Fetches a resource with authentication using the stored JWT token.
 * 
 * @param url The URL of the resource to fetch.
 * @param init Optional request initialization options (e.g., method, body).
 * @returns The fetch response.
 * @throws Will throw an error if the JWT is missing or if the response is not successful.
 */
async function fetchWithAuth(url: string, init?: RequestInit) {
  const options: RequestInit = init ?? {}
  const headers = (options.headers = (options.headers ?? {})) as any;
  headers.authorization = userJwt.get() ?? (():string => {throw new Error('Auth token not provided')})()
  return fetch(url, options)
}

/**
 * Performs an HTTP request with authentication.
 * 
 * @param method The HTTP method (e.g., 'GET', 'POST').
 * @param url The URL of the resource.
 * @param body Optional request body (can be stringified JSON or raw string).
 * @returns The response of the fetch request.
 * @throws Will throw an error if the status code is not between 200-299, or if login is required (status 511).
 */
async function perform(method: string, url: string, body: any | undefined = undefined) {
  const response = await fetchWithAuth(url, {method, body: body && (typeof body === 'string' ? body: JSON.stringify(body))})
  if (response.status === 511) throw new Error('Login required')
  if (response.status < 200 || response.status >= 300) throw new Error(`Error (status:${response.status}): ${await response.text()}`)

  return response
}

export interface Location {
  id: string
  names: string[]

  lati: number
  long: number
}

export async function GetLocations(): Promise<Location[]> {
  const response = await fetch(site + 'location')
  if (response.status !== 200) {
    throw new Error('Fetching locations Failed')
  } 
  return await response.json() as Location[]
}

export async function DeleteLocation(id: string) {
  return perform('DELETE', site + 'v1/adminApi/locations/' + id)
}

export async function AddLocation(location: Location) {
  return perform('PUT', site + 'v1/adminApi/locations', location)
}

export async function UpdateLocation(location: Location) {
  return perform('PATCH', site + 'v1/adminApi/locations', location)
}

