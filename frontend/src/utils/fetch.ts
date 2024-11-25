import { getStorageItem } from "./stateManagement"

export const site = 'https://navigationappsolid-production.up.railway.app/'

export interface LocationInfo {
  id: string
  names: string[]
  misspellings: string[]

  lat: number
  long: number
}

export const locationsCache = getStorageItem<LocationInfo[]>('!Locations', JSON.stringify, JSON.parse)
export const locationsCacheTimestamp = getStorageItem<number>('!Number', String, Number)

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

