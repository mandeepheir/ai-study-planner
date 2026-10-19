
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const PORT = process.env.PORT || 3000;

initializeApp({
  projectId: 'ai-study-planner-11f5f'
});

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'AI Study Planner backend is running!',
    planner: 'Free task-based JavaScript planner'
  });
});

// Verify Firebase authentication token
async function verifyFirebaseToken(req, res, next) {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication token is required.'
    });
  }

  try {
    req.user = await getAuth().verifyIdToken(
      authorization.slice(7)
    );
    next();
  } catch (error) {
    console.error(
      'Firebase token verification failed:',
      error.code || ''
    );

    return res.status(401).json({
      error: 'Invalid or expired authentication token.'
    });
  }
}

app.get('/api/protected', verifyFirebaseToken, (req, res) => {
  res.json({
    message: 'Firebase authentication successful!',
    uid: req.user.uid
  });
});

// Calculate calendar days until a valid YYYY-MM-DD deadline
function getDaysUntilDeadline(deadline) {
  if (
    typeof deadline !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(deadline)
  ) {
    return null;
  }

  const [year, month, day] = deadline.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const now = new Date();
  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return Math.round(
    (date.getTime() - today) / 86400000
  );
}

// Deadline urgency
function getPriority(daysLeft) {
  if (daysLeft !== null && daysLeft < 0) return 'Overdue';
  if (daysLeft === 0) return 'High';
  if (daysLeft !== null && daysLeft <= 3) return 'High';
  if (daysLeft !== null && daysLeft <= 7) return 'Medium';
  return 'Low';
}

// Higher scores are scheduled first
function priorityScore(task) {
  const days = task.daysLeft;
  let score;

  if (days === null) {
    score = 10;
  } else if (days < 0) {
    score = 140 + Math.min(Math.abs(days), 30);
  } else if (days === 0) {
    score = 130;
  } else if (days === 1) {
    score = 115;
  } else if (days <= 3) {
    score = 95 - days;
  } else if (days <= 7) {
    score = 75 - days;
  } else {
    score = Math.max(15, 40 - days);
  }

  const categoryScores = {
    Exam: 12,
    Assignment: 10,
    Project: 7,
    Quiz: 5
  };

  return score + (categoryScores[task.category] || 0);
}

// Estimated study time for each category
function estimateMinutes(category) {
  const estimates = {
    Exam: 120,
    Project: 180,
    Assignment: 90,
    Quiz: 45
  };

  return estimates[category] || 60;
}

// Describe each task's deadline
function formatDeadline(task) {
  if (task.daysLeft === null) {
    return task.deadline
      ? `Deadline: ${task.deadline} (unrecognized date)`
      : 'No deadline set';
  }

  if (task.daysLeft < 0) {
    return `Overdue by ${Math.abs(task.daysLeft)} day(s)`;
  }

  if (task.daysLeft === 0) return 'Due today';
  if (task.daysLeft === 1) return 'Due tomorrow';

  return `Due in ${task.daysLeft} days`;
}

// Generate a study plan
function createStudyPlan({ tasks, availableHours, goals }) {
  const prioritizedTasks = tasks
    .filter(task => !task.completed)
    .map((task, index) => ({
      ...task,
      originalIndex: index,
      daysLeft: getDaysUntilDeadline(task.deadline)
    }))
    .sort((a, b) =>
      priorityScore(b) - priorityScore(a) ||
      a.originalIndex - b.originalIndex
    );

  const lines = [
    'YOUR PERSONALIZED STUDY PLAN',
    '================================',
    '',
    `Daily study time: ${availableHours} hour(s)`,
    `Study goal: ${goals.trim()}`,
    `Pending tasks: ${prioritizedTasks.length}`,
    ''
  ];

  if (prioritizedTasks.length === 0) {
    lines.push(
      'You have no pending tasks. Add tasks to create a study schedule.'
    );
    return lines.join('\n');
  }

  lines.push(
    'PRIORITIZED TASKS',
    '--------------------------------'
  );

  prioritizedTasks.forEach((task, index) => {
    lines.push(
      `${index + 1}. ${task.subject} — ${task.task}`,
      `   Category: ${task.category || 'General'} | ` +
      `Priority: ${getPriority(task.daysLeft)} | ` +
      formatDeadline(task)
    );
  });

  lines.push(
    '',
    "TODAY'S STUDY SCHEDULE",
    '--------------------------------'
  );

  // Available hours count study time, not break time.
  let remainingStudyMinutes = Math.floor(availableHours * 60);
  let sessionNumber = 1;

  const sessionLength = 45;
  const breakLength = 10;

  const taskTimeRemaining = prioritizedTasks.map(task =>
    estimateMinutes(task.category)
  );

  // Rotate through tasks, giving each pending task a session
  // before returning to tasks that still need more time.
  while (
    remainingStudyMinutes > 0 &&
    taskTimeRemaining.some(minutes => minutes > 0)
  ) {
    let scheduledInThisPass = false;

    for (let i = 0; i < prioritizedTasks.length; i++) {
      if (remainingStudyMinutes <= 0) break;
      if (taskTimeRemaining[i] <= 0) continue;

      const task = prioritizedTasks[i];

      const minutes = Math.min(
        sessionLength,
        taskTimeRemaining[i],
        remainingStudyMinutes
      );

      if (sessionNumber > 1) {
        lines.push(`Break: ${breakLength} min`);
      }

      lines.push(
        `Session ${sessionNumber}: ${task.subject} — ` +
        `${task.task} (${minutes} min)`
      );

      taskTimeRemaining[i] -= minutes;
      remainingStudyMinutes -= minutes;
      sessionNumber++;
      scheduledInThisPass = true;
    }

    if (!scheduledInThisPass) break;
  }

  const scheduledStudyMinutes =
    Math.floor(availableHours * 60) - remainingStudyMinutes;

  lines.push(
    '',
    `Total scheduled study time: ${scheduledStudyMinutes} min`,
    `Study time remaining: ${remainingStudyMinutes} min`
  );

  if (remainingStudyMinutes > 0) {
    lines.push(
      'Use remaining time for revision or unfinished work.'
    );
  }

  if (scheduledStudyMinutes === 0) {
    lines.push('No study sessions could be scheduled.');
  }

  lines.push(
    '',
    'STUDY TIPS',
    '--------------------------------',
    '1. Start with overdue tasks and the closest deadlines.',
    '2. Split large tasks into smaller achievable steps.',
    '3. Take short breaks to maintain concentration.',
    '4. Review your progress and update completed tasks.',
    '',
    'Generated using free JavaScript rules; no paid AI API is used.'
  );

  return lines.join('\n');
}

// Generate a plan for an authenticated user
app.post('/api/ai/study-plan', verifyFirebaseToken, (req, res) => {
  try {
    const { tasks, availableHours, goals } = req.body;

    if (
      !Array.isArray(tasks) ||
      tasks.length === 0 ||
      tasks.length > 100 ||
      tasks.some(task =>
        !task ||
        typeof task.subject !== 'string' ||
        !task.subject.trim() ||
        typeof task.task !== 'string' ||
        !task.task.trim() ||
        typeof task.category !== 'string' ||
        typeof task.deadline !== 'string' ||
        typeof task.completed !== 'boolean'
      ) ||
      typeof availableHours !== 'number' ||
      !Number.isFinite(availableHours) ||
      availableHours <= 0 ||
      availableHours > 24 ||
      typeof goals !== 'string' ||
      !goals.trim() ||
      goals.length > 2000
    ) {
      return res.status(400).json({
        error: 'Provide valid tasks, study hours (up to 24), and a study goal.'
      });
    }

    const pendingTasks = tasks.filter(task => !task.completed);

    console.log(
      `Generating a study plan for user ${req.user.uid} ` +
      `with ${pendingTasks.length} pending task(s).`
    );

    const studyPlan = createStudyPlan({
      tasks: pendingTasks,
      availableHours,
      goals
    });

    return res.json({
      studyPlan,
      generator: 'javascript-rules'
    });
  } catch (error) {
    console.error('Study-plan generation error:', error);

    return res.status(500).json({
      error: 'Unable to generate a study plan right now.'
    });
  }
});

// Handle malformed JSON
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: 'Invalid JSON request body.'
    });
  }

  next(error);
});

// Start backend
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log('Free task-based study planner is enabled.');
});
