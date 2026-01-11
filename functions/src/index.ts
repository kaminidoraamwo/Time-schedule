/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Callable function: Can be called directly from the React App
export const sendNotification = onCall(async (request) => {
    const { token, title, body } = request.data;

    if (!token) {
        throw new Error("No token provided");
    }

    const message = {
        notification: {
            title: title || "Timer Finished",
            body: body || "The scheduling step is complete.",
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        logger.info("Successfully sent message:", response);
        return { success: true, messageId: response };
    } catch (error) {
        logger.error("Error sending message:", error);
        return { success: false, error: error };
    }
});
