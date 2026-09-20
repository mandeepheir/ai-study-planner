import { Component, OnInit } from '@angular/core';

import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from 'ng-apexcharts';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  totalTasks = 0;

  completedTasks = 0;

  pendingTasks = 0;

  completionRate = 0;

  upcomingTasks: StudyTask[] = [];


  chartSeries: ApexNonAxisChartSeries = [0, 0];


  chartDetails: ApexChart = {
    type: 'pie',
    height: 350
  };


  chartLabels: string[] = [
    'Completed',
    'Pending'
  ];


  chartResponsive: ApexResponsive[] = [
    {
      breakpoint: 480,

      options: {
        chart: {
          width: 300
        }
      }
    }
  ];


  constructor(
    private firebaseService: FirebaseService
  ) {}


  ngOnInit(): void {

    // Load tasks from Firebase
    this.firebaseService.getTasks().subscribe({

      next: (tasks: any[]) => {

        const studyTasks =
          tasks as StudyTask[];


        // Total tasks
        this.totalTasks =
          studyTasks.length;


        // Completed tasks
        this.completedTasks =
          studyTasks.filter(
            task => task.completed
          ).length;


        // Pending tasks
        this.pendingTasks =
          this.totalTasks -
          this.completedTasks;


        // Completion percentage
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


        // Update chart
        this.chartSeries = [
          this.completedTasks,
          this.pendingTasks
        ];


        // Find upcoming tasks
        this.findUpcomingTasks(
          studyTasks
        );


        console.log(
          'Dashboard tasks loaded from Firebase:',
          studyTasks
        );

      },


      error: (error) => {

        console.error(
          'Failed to load dashboard tasks from Firebase:',
          error
        );

      }

    });

  }


  // Find incomplete tasks due within the next 3 days
  private findUpcomingTasks(
    tasks: StudyTask[]
  ): void {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    this.upcomingTasks =
      tasks.filter(task => {

        // Ignore completed tasks
        if (task.completed) {
          return false;
        }


        const deadline =
          new Date(task.deadline);

        deadline.setHours(
          0,
          0,
          0,
          0
        );


        const diffTime =
          deadline.getTime() -
          today.getTime();


        const daysLeft =
          Math.ceil(
            diffTime /
            (1000 * 60 * 60 * 24)
          );


        return (
          daysLeft >= 0 &&
          daysLeft <= 3
        );

      });

  }

}