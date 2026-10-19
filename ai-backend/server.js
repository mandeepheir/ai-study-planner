
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin
initializeApp({
  projectId: 'ai-study-planner-11f5f'
});

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());

// Check that the backend is running
app.get('/', (req, res) => {
  res.json({
    message: 'AI Study Planner backend is running!'
  });
});

// Verify the Firebase ID token
async function verifyFirebaseToken(req, res, next) {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication token is required.'
    });
  }

  const token = authorization.slice(7);

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(
      'Firebase token verification failed:',
      error.code || '',
      error.message
    );

    return res.status(401).json({
      error: 'Invalid or expired authentication token.'
    });
  }
}

// Protected test route
app.get('/api/protected', verifyFirebaseToken, (req, res) => {
  res.json({
    message: 'Firebase authentication successful!',
    uid: req.user.uid
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
