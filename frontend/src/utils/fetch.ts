export const site = 'http://127.0.0.1:8080/'

export interface Location {
  id: string
  names: string[]
  misspellings: string[]

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

