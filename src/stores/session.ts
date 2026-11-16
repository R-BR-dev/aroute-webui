import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'aroute.session'

/**
 * Whether the admin is signed in.
 *
 * M0: the Core has no authentication yet, so there is nothing to ask it. Any
 * password opens the session, and "signed in" is only a flag kept for this
 * browser tab. It protects nothing: the API answers everyone.
 *
 * M1 replaces the bodies of `signIn` and `signOut` with calls to the Core's
 * `auth` endpoints, and the flag with the state of the session cookie. The
 * login page and the route guard already use this store and stay as they are.
 */
export const useSessionStore = defineStore('session', () => {
  const signedIn = ref(sessionStorage.getItem(STORAGE_KEY) === '1')

  async function signIn(_password: string): Promise<void> {
    signedIn.value = true
    sessionStorage.setItem(STORAGE_KEY, '1')
  }

  async function signOut(): Promise<void> {
    signedIn.value = false
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { signedIn, signIn, signOut }
})
