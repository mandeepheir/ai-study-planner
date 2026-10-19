
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin for token verification.
admin.initializeApp({
  projectId: 'ai-study-planner-11f5f'
});

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());

// Check that the backend is running.
app.get('/', (req, res) => {
  res.json({
    message: 'AI Study Planner backend is running!'
  });
});

// Verify the Firebase ID token sent by the frontend.
async function verifyFirebaseToken(req, res, next) {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication token is required.'
    });
  }

  const token = authorization.slice(7);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired authentication token.'
    });
  }
}

// Temporary protected test route.
app.get('/api/protected', verifyFirebaseToken, (req, res) => {
  res.json({
    message: 'Firebase authentication successful!',
    uid: req.user.uid
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
