import {onRequest} from "firebase-functions/v2/https";

export const testBackend = onRequest((request, response) => {
  response.send("AI Study Planner backend is working!");
});
