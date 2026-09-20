import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../../services/firebase.service';


interface StudyTask {
  id?: string;
  subject: string;
  task: string;
  category: string;
  deadline: string;
  completed: boolean;
}


interface CategoryProgress {
  category: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}


@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [],
  templateUrl: './progress.html',
  styleUrl: './progress.css'
})
export class Progress implements OnInit {

  completionRate = 0;

  totalTasks = 0;

  completedTasks = 0;

  pendingTasks = 0;

  categoryProgress: CategoryProgress[] = [];


  constructor(
    private firebaseService: FirebaseService
  ) {}


  ngOnInit(): void {

    this.firebaseService.getTasks().subscribe({

      next: (tasks: any[]) => {

        const studyTasks =
          tasks as StudyTask[];


        // =====================================
        // TOTAL TASKS
        // =====================================

        this.totalTasks =
          studyTasks.length;


        // =====================================
        // COMPLETED TASKS
        // =====================================

        this.completedTasks =
          studyTasks.filter(
            task => task.completed
          ).length;


        // =====================================
        // PENDING TASKS
        // =====================================

        this.pendingTasks =
          studyTasks.filter(
            task => !task.completed
          ).length;


        // =====================================
        // COMPLETION PERCENTAGE
        // =====================================

        if (this.totalTasks > 0) {

          this.completionRate =
            Math.round(
              (
                this.completedTasks /
                this.totalTasks
              ) * 100
            );

        } else {

          this.completionRate = 0;

        }


        // =====================================
        // CATEGORY ANALYTICS
        // =====================================

        this.calculateCategoryProgress(
          studyTasks
        );


        // =====================================
        // DEBUG INFORMATION
        // =====================================

        console.log(
          'Progress loaded from Firebase:',
          studyTasks
        );

        console.log(
          'Total tasks:',
          this.totalTasks
        );

        console.log(
          'Completed tasks:',
          this.completedTasks
        );

        console.log(
          'Pending tasks:',
          this.pendingTasks
        );

        console.log(
          'Category progress:',
          this.categoryProgress
        );

      },


      error: (error) => {

        console.error(
          'Failed to load progress from Firebase:',
          error
        );

      }

    });

  }


  // =========================================
  // CATEGORY PROGRESS
  // =========================================

  calculateCategoryProgress(
    tasks: StudyTask[]
  ): void {

    const categories = [
      'Assignment',
      'Quiz',
      'Exam',
      'Project'
    ];


    this.categoryProgress = [];


    for (const category of categories) {

      const categoryTasks =
        tasks.filter(
          task =>
            task.category === category
        );


      // Ignore categories
      // that have no tasks

      if (categoryTasks.length === 0) {

        continue;

      }


      // Count completed tasks

      const completed =
        categoryTasks.filter(
          task => task.completed
        ).length;


      // Count pending tasks

      const pending =
        categoryTasks.filter(
          task => !task.completed
        ).length;


      // Calculate percentage

      const completionRate =
        Math.round(
          (
            completed /
            categoryTasks.length
          ) * 100
        );


      // Store category information

      this.categoryProgress.push({

        category: category,

        total: categoryTasks.length,

        completed: completed,

        pending: pending,

        completionRate: completionRate

      });

    }

  }

}