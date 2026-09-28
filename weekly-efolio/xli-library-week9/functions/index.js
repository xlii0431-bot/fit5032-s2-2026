/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const {getApps, initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const cors = require("cors")({origin: true});

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.countBooks = onRequest((request, response) => {
  cors(request, response, async () => {
    if (request.method !== "GET") {
      response.set("Allow", "GET");
      response.status(405).json({error: "Method not allowed."});
      return;
    }

    try {
      const booksSnapshot = await db.collection("books").get();
      response.status(200).json({count: booksSnapshot.size});
    } catch (error) {
      logger.error("Failed to count books in Firestore.", error);
      response.status(500).json({error: "Unable to count books."});
    }
  });
});

exports.capitaliseBook = onDocumentCreated(
    {
      document: "books/{bookId}",
      region: "australia-southeast1",
    },
    async (event) => {
      const createdSnapshot = event.data;

      if (!createdSnapshot) {
        logger.warn("capitaliseBook received an event without document data.", {
          eventId: event.id,
        });
        return;
      }

      const createdBook = createdSnapshot.data();
      if (typeof createdBook.name !== "string") {
        logger.info("Book has no text name field to capitalise.", {
          bookId: event.params.bookId,
        });
        return;
      }

      const capitalisedName = createdBook.name.toUpperCase();
      if (capitalisedName === createdBook.name) {
        logger.info("Book name is already uppercase.", {
          bookId: event.params.bookId,
        });
        return;
      }

      try {
        await db.runTransaction(async (transaction) => {
          const currentSnapshot = await transaction.get(createdSnapshot.ref);

          if (!currentSnapshot.exists) {
            logger.info("Book was deleted before it could be capitalised.", {
              bookId: event.params.bookId,
            });
            return;
          }

          const isSameCreation = currentSnapshot.createTime.isEqual(
              createdSnapshot.createTime,
          );
          const isUnchanged = currentSnapshot.updateTime.isEqual(
              createdSnapshot.updateTime,
          );

          if (!isSameCreation || !isUnchanged) {
            logger.info("Book changed after creation; skipping capitalisation.", {
              bookId: event.params.bookId,
            });
            return;
          }

          transaction.update(createdSnapshot.ref, {name: capitalisedName});
        });
      } catch (error) {
        logger.error("Failed to capitalise the book name.", {
          bookId: event.params.bookId,
          error,
        });
        throw error;
      }
    },
);
