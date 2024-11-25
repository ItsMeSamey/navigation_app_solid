import { getStorageItem, userJwt } from './stateManagement'

export const site = 'https://navigationappsolid-production.up.railway.app/'

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
  if (response.status < 200 || response.status >= 300) throw new Error(`Error (status:${response.status}): ${stripStack(await response.text())}`)

  return response
}

export interface LocationInfo {
  id: string
  names: string[]
  misspellings: string[]

  lat: number
  long: number
}

export const locationsCache = getStorageItem<LocationInfo[]>('!Locations', JSON.stringify, JSON.parse)
export const locationsCacheTimestamp = getStorageItem<number>('!Number', String, Number)

;(async()=>{
  try {
    const ts = locationsCacheTimestamp.get() === null? null: await GetLocationsTimestamp()
    if (locationsCacheTimestamp.get() === null || ts !== locationsCacheTimestamp.get()) {
      GetLocations().then(l => {
        locationsCache.set(l)
        locationsCacheTimestamp.set(ts)
      }).catch(console.log)
    }
  } catch (e) {
    console.log(e)
  }
})()

export async function GetLocations(): Promise<LocationInfo[]> {
  if (locationsCache.get() !== null) {
    return locationsCache.get()!
  }

  const response = await fetch(site + 'v1/locations')
  if (response.status !== 200) {
    throw new Error('Fetching locations Failed')
  }
  ;(async() => locationsCacheTimestamp.set(await GetLocationsTimestamp()))()

  const locations = await response.json() as LocationInfo[]
  locationsCache.set(locations)

  return locations
}

export async function GetLocationsTimestamp(): Promise<number> {
  const response = await fetch(site + 'v1/locations/timestamp')
  if (response.status !== 200) {
    throw new Error('Fetching locations timestamp Failed')
  } 
  return Number(await response.text())
}

export async function DeleteLocation(id: string) {
  return perform('DELETE', site + 'v1/adminApi/location' + id)
}

export async function AddLocation(location: LocationInfo) {
  return perform('PUT', site + 'v1/adminApi/location', location)
}

export async function UpdateLocation(location: LocationInfo) {
  return perform('PATCH', site + 'v1/adminApi/location', location)
}

export function stripStack(errorString: string): string {
  return errorString.split('##-STACK-##')[0]
}

