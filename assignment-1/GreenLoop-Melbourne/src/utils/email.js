import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

const sendRecyclingEmailFunction = httpsCallable(functions, 'sendRecyclingEmail')

export async function sendRecyclingEmail(emailRequest) {
  const response = await sendRecyclingEmailFunction(emailRequest)
  return response.data
}
