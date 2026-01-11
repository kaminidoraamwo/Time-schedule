import { onCall, onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { CloudTasksClient } from "@google-cloud/tasks";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Cloud Tasks Client
const tasksClient = new CloudTasksClient();

// Configuration
const PROJECT_ID = "salon-pacer-app";
const LOCATION = "us-central1";
const QUEUE = "salon-pacer-notifications";
const SERVICE_URL = `https://${LOCATION}-${PROJECT_ID}.cloudfunctions.net/onTaskTrigger`;

// --- Existing Manual Notification (Keep for testing) ---
export const sendNotification = onCall(async (request) => {
    const { token, title, body } = request.data;
    if (!token) throw new Error("No token provided");

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

// --- NEW: Schedule a Notification ---
export const scheduleNotification = onCall(async (request) => {
    const { token, title, body, delaySeconds } = request.data;

    if (!token || !delaySeconds) {
        throw new Error("Missing params: token or delaySeconds");
    }

    // Construct the task
    const parent = tasksClient.queuePath(PROJECT_ID, LOCATION, QUEUE);
    const task = {
        httpRequest: {
            httpMethod: "POST" as const,
            url: SERVICE_URL,
            headers: {
                "Content-Type": "application/json",
            },
            body: Buffer.from(JSON.stringify({ token, title, body })).toString("base64"),
        },
        scheduleTime: {
            seconds: Date.now() / 1000 + delaySeconds,
        },
    };

    try {
        const [response] = await tasksClient.createTask({ parent, task });
        logger.info(`Created task ${response.name}`);
        // Return task name so client can cancel it later
        return { success: true, taskName: response.name };
    } catch (error) {
        logger.error("Error creating task:", error);
        return { success: false, error: error };
    }
});

// --- NEW: Cancel a Scheduled Notification ---
export const cancelNotification = onCall(async (request) => {
    const { taskName } = request.data;
    if (!taskName) return { success: false, error: "No taskName provided" };

    try {
        await tasksClient.deleteTask({ name: taskName });
        logger.info(`Deleted task ${taskName}`);
        return { success: true };
    } catch (error) {
        logger.warn("Error deleting task (might already be executed):", error);
        // Treat as success since we wanted it gone anyway
        return { success: true };
    }
});

// --- NEW: The Worker Function (triggered by Cloud Tasks) ---
export const onTaskTrigger = onRequest(async (req, res) => {
    const { token, title, body } = req.body;

    // Validation: Check for Cloud Tasks header
    // Google Cloud Tasks adds this header. It is stripped if sent by external user.
    const queueName = req.header("x-cloudtasks-queuename");
    if (!queueName) {
        logger.warn("Received request without Cloud Tasks header. Potential scan/attack.", { ip: req.ip });
        res.status(403).send("Forbidden");
        return;
    }

    if (!token) {
        res.status(400).send("No token");
        return;
    }

    const message = {
        notification: {
            title: title || "Time's up!",
            body: body || "Timer finished.",
        },
        token: token,
    };

    try {
        await admin.messaging().send(message);
        logger.info("Task Triggered: Sent notification to", token);
        res.status(200).send("OK");
    } catch (error) {
        logger.error("Task Triggered: Failed to send", error);
        res.status(500).send(error);
    }
});
