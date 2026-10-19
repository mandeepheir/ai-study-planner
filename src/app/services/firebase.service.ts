
import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where
} from '@angular/fire/firestore';

export interface StudyTask {
  id?: string;
  subject: string;
  task: string;
  category: string;
  deadline: string;
  completed: boolean;
  userId?: string;
}

export interface StudyPlanRequest {
  tasks: StudyTask[];
  availableHours: number;
  goals: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private tasksCollection = collection(
    this.firestore,
    'tasks'
  );

  // Get the signed-in user's Firebase authentication token.
  async getIdToken(): Promise<string> {
    const user = this.auth.currentUser;

    if (!user) {
      throw new Error(
        'Please sign in before generating a study plan.'
      );
    }

    return user.getIdToken();
  }

  // Test whether the backend accepts Firebase authentication.
  async testBackendAuth(): Promise<any> {
    const token = await this.getIdToken();

    const response = await fetch(
      'http://localhost:3000/api/protected',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Backend request failed: ${response.status}`
      );
    }

    return response.json();
  }

  // Send real task details to the Node.js backend.
  async generateStudyPlan(
    request: StudyPlanRequest
  ): Promise<string> {
    const token = await this.getIdToken();

    const response = await fetch(
      'http://localhost:3000/api/ai/study-plan',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      let message =
        `Study plan request failed: ${response.status}`;

      try {
        const errorBody = await response.json();

        if (typeof errorBody.error === 'string') {
          message = errorBody.error;
        }
      } catch {
        // Keep the fallback error message.
      }

      throw new Error(message);
    }

    const data = await response.json();

    if (
      typeof data.studyPlan !== 'string' ||
      !data.studyPlan.trim()
    ) {
      throw new Error(
        'The backend returned an empty study plan.'
      );
    }

    return data.studyPlan;
  }

  // Add a task for the signed-in user.
  addTask(task: StudyTask) {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No user is currently logged in.');
    }

    const { id, ...taskData } = task;

    return addDoc(this.tasksCollection, {
      ...taskData,
      userId: currentUser.uid
    });
  }

  // Retrieve tasks belonging to the signed-in user.
  getTasks() {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No user is currently logged in.');
    }

    const userTasksQuery = query(
      this.tasksCollection,
      where('userId', '==', currentUser.uid)
    );

    return collectionData(
      userTasksQuery,
      { idField: 'id' }
    );
  }

  // Mark a task complete or incomplete.
  updateTask(taskId: string, completed: boolean) {
    const taskDocument = doc(
      this.firestore,
      'tasks',
      taskId
    );

    return updateDoc(taskDocument, {
      completed
    });
  }

  // Delete a task.
  deleteTask(taskId: string) {
    const taskDocument = doc(
      this.firestore,
      'tasks',
      taskId
    );

    return deleteDoc(taskDocument);
  }

  // Test the Firestore connection.
  testFirestore() {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('Please sign in first.');
    }

    return addDoc(this.tasksCollection, {
      subject: 'Firebase Test',
      task: 'Testing Firestore connection',
      category: 'Test',
      deadline: '2026-09-10',
      completed: false,
      userId: currentUser.uid
    });
  }
}
