import { collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

function ratingsCollection(locationId) {
  return collection(db, 'locations', locationId, 'ratings')
}

export function observeLocationRatings(locationId, userId, onChange, onError) {
  return onSnapshot(
    ratingsCollection(locationId),
    (ratingsSnapshot) => {
      const ratings = ratingsSnapshot.docs
        .map((ratingDocument) => ratingDocument.data())
        .filter(
          (ratingDocument) =>
            Number.isInteger(ratingDocument.rating) &&
            ratingDocument.rating >= 1 &&
            ratingDocument.rating <= 5,
        )

      const total = ratings.reduce((sum, ratingDocument) => sum + ratingDocument.rating, 0)
      const currentUserRating = ratings.find(
        (ratingDocument) => ratingDocument.userId === userId,
      )

      onChange({
        average: ratings.length ? total / ratings.length : 0,
        count: ratings.length,
        userRating: currentUserRating?.rating || 0,
      })
    },
    onError,
  )
}

export async function saveLocationRating(locationId, userId, rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new RangeError('Rating must be an integer between 1 and 5.')
  }

  const ratingReference = doc(db, 'locations', locationId, 'ratings', userId)

  await runTransaction(db, async (transaction) => {
    const ratingSnapshot = await transaction.get(ratingReference)

    if (ratingSnapshot.exists()) {
      transaction.update(ratingReference, {
        rating,
        userId,
        updatedAt: serverTimestamp(),
      })
      return
    }

    transaction.set(ratingReference, {
      rating,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}
