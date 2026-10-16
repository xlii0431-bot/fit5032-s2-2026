import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

function favouritesCollection(userId) {
  if (!userId) throw new Error('An authenticated user is required.')
  return collection(db, 'users', userId, 'favourites')
}

function normalizeItemId(itemId) {
  const normalizedItemId = Number(itemId)
  if (!Number.isInteger(normalizedItemId) || normalizedItemId <= 0) {
    throw new Error('A valid recycling item is required.')
  }
  return normalizedItemId
}

export function observeFavourites(userId, onChange, onError) {
  return onSnapshot(
    favouritesCollection(userId),
    (snapshot) => {
      const itemIds = snapshot.docs
        .map((favourite) => favourite.data().itemId)
        .filter((itemId) => Number.isInteger(itemId) && itemId > 0)
      onChange(itemIds)
    },
    onError,
  )
}

export function saveFavourite(userId, itemId) {
  const normalizedItemId = normalizeItemId(itemId)

  return setDoc(doc(favouritesCollection(userId), String(normalizedItemId)), {
    itemId: normalizedItemId,
    createdAt: serverTimestamp(),
  })
}

export function removeFavourite(userId, itemId) {
  const normalizedItemId = normalizeItemId(itemId)
  return deleteDoc(doc(favouritesCollection(userId), String(normalizedItemId)))
}
