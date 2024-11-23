import { createSelector, createSignal } from "solid-js"

export interface StorageItem<T> {
  val: T | null
  get: () => T | null
  set: (val: T | null) => void
}

export function getStorageItem<T>(key: string, stringify?: (value: T) => string, parser?: (value: string) => T, defaultValue?: T): StorageItem<T> {
  const value = localStorage.getItem(key)
  const retval: StorageItem<T> = {
    val: value !== null && value !== undefined && parser ? parser(value) : null,
    get() { return this.val },
    set(val: T | null) {
      if (val === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, stringify ? stringify(val): String(val))
      }
      this.val = val
    },
  }

  if (retval.val === null && defaultValue !== undefined) {
    retval.set(defaultValue)
  }

  return retval
}

//  Google User Response Format / User Data
// {
//   "id": "124276...",
//   "email": "sa...@gmail.com",
//   "verified_email": true,
//   "name": "Sanyam Singh",
//   "given_name": "Sanyam",
//   "family_name": "Singh",
//   "picture": "https://lh3.googleusercontent.com/a/..."
// }
export interface GoogleUserResponse {
  id: string,
  email: string,
  verified_email: boolean,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
}
export const userData = getStorageItem<GoogleUserResponse>("!User", JSON.stringify, JSON.parse)


// Page Navigaion
const [p, setP] = createSignal<string>(userData.get()? 'Dashboard': 'Login')
const selectP = createSelector(p)

export { p, setP, selectP }

