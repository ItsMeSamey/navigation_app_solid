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

async function GetLocationsRaw(): Promise<LocationInfo[]> {
  const response = await fetch(site + 'v1/locations')
  if (response.status !== 200) {
    throw new Error('Fetching locations Failed')
  }
  return await response.json() as LocationInfo[]
}

let lp: Promise<LocationInfo[]> = (async() => {
  const ts = locationsCacheTimestamp.get() === null? null: await GetLocationsTimestamp()
  if (locationsCacheTimestamp.get() === null || ts !== locationsCacheTimestamp.get()) {
    locationsCache.set(await GetLocationsRaw())
    locationsCacheTimestamp.set(ts)
  }
  return locationsCache.get()!
})()

export async function GetLocations(): Promise<LocationInfo[]> {
  return locationsCache.get() ?? await lp
}

export async function GetLocationsTimestamp(): Promise<number> {
  const response = await fetch(site + 'v1/locations/timestamp')
  if (response.status !== 200) {
    throw new Error('Fetching locations timestamp Failed')
  } 
  return Number(await response.text())
}

