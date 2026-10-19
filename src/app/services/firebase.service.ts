
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
  subject: string;
  task: string;
  category: string;
  deadline: string;
  completed: boolean;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // Connect to Firestore
  private firestore = inject(Firestore);

  // Connect to Firebase Authentication
  private auth = inject(Auth);

  // Reference to the tasks collection
  private tasksCollection = collection(
    this.firestore,
    'tasks'
  );

  // Get the signed-in user's Firebase ID token
  async getIdToken(): Promise<string> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error(
        'No user is currently logged in.'
      );
    }

    return currentUser.getIdToken();
  }

  // Add a new task for the logged-in user
  addTask(task: StudyTask) {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error(
        'No user is currently logged in.'
      );
    }

    const taskWithUser = {
      ...task,
      userId: currentUser.uid
    };

    return addDoc(
      this.tasksCollection,
      taskWithUser
    );
  }

  // Get tasks belonging to the logged-in user
  getTasks() {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error(
        'No user is currently logged in.'
      );
    }

    const userTasksQuery = query(
      this.tasksCollection,
      where(
        'userId',
        '==',
        currentUser.uid
      )
    );

    return collectionData(
      userTasksQuery,
      {
        idField: 'id'
      }
    );
  }

  // Update task completion status
  updateTask(
    taskId: string,
    completed: boolean
  ) {
    const taskDocument = doc(
      this.firestore,
      'tasks',
      taskId
    );

    return updateDoc(
      taskDocument,
      {
        completed: completed
      }
    );
  }

  // Delete a task
  deleteTask(taskId: string) {
    const taskDocument = doc(
      this.firestore,
      'tasks',
      taskId
    );

    return deleteDoc(taskDocument);
  }

  // Test Firestore connection
  testFirestore() {
    return addDoc(
      this.tasksCollection,
      {
        subject: 'Firebase Test',
        task: 'Testing Firestore connection',
        category: 'Test',
        deadline: '2026-09-10',
        completed: false
      }
    );
  }
}
