import { getStorageItem } from './stateManagement'

export const site = 'http://127.0.0.1:8080/'

export const loginData = getStorageItem<{method: string, auth: string}>('!Auth', JSON.stringify, JSON.parse)

// Hashes a string using SHA-256
async function hash(val: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(val)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')

  return hashHex
}

