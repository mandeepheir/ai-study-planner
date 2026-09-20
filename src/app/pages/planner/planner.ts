import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FirebaseService } from '../../services/firebase.service';

interface StudyTask {
  id?: string;
  subject: string;
  task: string;
  category: string;
  deadline: string;
  completed: boolean;
}

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './planner.html',
  styleUrl: './planner.css'
})
export class Planner implements OnInit {

  subject = '';
  task = '';
  category = '';
  deadline = '';
  searchText = '';

  tasks: StudyTask[] = [];

  constructor(
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {

    // Load tasks from Firebase
    this.firebaseService.getTasks().subscribe({

      next: (tasks: any[]) => {

        this.tasks = tasks;

        // Keep LocalStorage as backup
        this.saveTasks();

        console.log(
          'Tasks loaded from Firebase:',
          tasks
        );

      },

      error: (error) => {

        console.error(
          'Failed to load tasks from Firebase:',
          error
        );

        // Load backup from LocalStorage
        const savedTasks =
          localStorage.getItem('tasks');

        if (savedTasks) {

          this.tasks =
            JSON.parse(savedTasks);

        }

      }

    });

  }


  // Add a new task
  addTask(): void {

    // Check required fields
    if (
      !this.subject.trim() ||
      !this.task.trim() ||
      !this.category ||
      !this.deadline
    ) {

      alert('Please fill all fields.');

      return;
    }


    // Create task object
    const newTask: StudyTask = {

      subject: this.subject,

      task: this.task,

      category: this.category,

      deadline: this.deadline,

      completed: false

    };


    // Save task to Firebase
    this.firebaseService
      .addTask(newTask)

      .then((document) => {

        console.log(
          'Task saved to Firebase!',
          document.id
        );


        // Store Firebase document ID
        newTask.id = document.id;


        // Add task to local array
        this.tasks.push(newTask);


        // Save backup
        this.saveTasks();

      })

      .catch((error) => {

        console.error(
          'Firebase save failed:',
          error
        );

        alert(
          'Task could not be saved to Firebase.'
        );

      });


    // Clear form
    this.subject = '';
    this.task = '';
    this.category = '';
    this.deadline = '';

  }


  // Delete a task
  deleteTask(task: StudyTask): void {

    // Check Firebase ID
    if (!task.id) {

      console.error(
        'Task ID not found.'
      );

      return;
    }


    // Delete from Firebase
    this.firebaseService
      .deleteTask(task.id)

      .then(() => {

        // Remove the exact task
        this.tasks =
          this.tasks.filter(
            item => item.id !== task.id
          );


        // Update LocalStorage
        this.saveTasks();


        console.log(
          'Task deleted from Firebase!'
        );

      })

      .catch((error) => {

        console.error(
          'Firebase delete failed:',
          error
        );

        alert(
          'Task could not be deleted.'
        );

      });

  }


  // Complete / uncomplete a task
  toggleComplete(task: StudyTask): void {

    // Store old status
    const oldStatus =
      task.completed;


    // Change status
    task.completed =
      !task.completed;


    // Update Firebase
    if (task.id) {

      this.firebaseService
        .updateTask(
          task.id,
          task.completed
        )

        .then(() => {

          console.log(
            'Task completion updated in Firebase!'
          );


          // Update LocalStorage
          this.saveTasks();

        })

        .catch((error) => {

          console.error(
            'Firebase update failed:',
            error
          );


          // Revert if Firebase fails
          task.completed =
            oldStatus;


          this.saveTasks();


          alert(
            'Task could not be updated.'
          );

        });

    }

  }


  // Save tasks to LocalStorage
  saveTasks(): void {

    localStorage.setItem(
      'tasks',
      JSON.stringify(this.tasks)
    );

  }


  // Search / filter tasks
  getFilteredTasks(): StudyTask[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    return this.tasks.filter(task =>

      task.subject
        .toLowerCase()
        .includes(search)

      ||

      task.task
        .toLowerCase()
        .includes(search)

      ||

      task.category
        .toLowerCase()
        .includes(search)

    );

  }


  // Test Firebase
  testFirebase(): void {

    this.firebaseService
      .testFirestore()

      .then(() => {

        alert(
          'Firebase is working!'
        );

      })

      .catch((error) => {

        console.error(error);

        alert(
          'Firebase test failed. Check the browser console.'
        );

      });

  }

}