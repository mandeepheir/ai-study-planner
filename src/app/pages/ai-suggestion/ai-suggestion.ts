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

interface Suggestion {
  text: string;
  level: 'info' | 'danger' | 'warning' | 'success';
}


@Component({
  selector: 'app-ai-suggestion',
  standalone: true,
  imports: [],
  templateUrl: './ai-suggestion.html',
  styleUrl: './ai-suggestion.css'
})
export class AiSuggestion implements OnInit {

  // =========================================================
  // AI SUGGESTIONS
  // =========================================================

  suggestions: Suggestion[] = [];


  // =========================================================
  // PENDING TASKS
  // =========================================================

  pendingTasks: StudyTask[] = [];


  // =========================================================
  // WORKLOAD
  // =========================================================

  workloadLevel = '';


  // =========================================================
  // STUDY TIME
  // =========================================================

  estimatedStudyHours = 0;


  // =========================================================
  // DAILY PLAN
  // =========================================================

  dailyPlan: StudyTask[] = [];


  // =========================================================
  // SMART STUDY SESSION
  // =========================================================

  selectedStudyMinutes = 0;

  sessionTasks: StudyTask[] = [];

  sessionStudyMinutes = 0;


  constructor(
    private firebaseService: FirebaseService
  ) {}


  // =========================================================
  // INITIALIZE AI ANALYSIS
  // =========================================================

  ngOnInit(): void {

    this.firebaseService.getTasks().subscribe({

      next: (tasks: any[]) => {

        const studyTasks =
          tasks as StudyTask[];

        this.pendingTasks =
          studyTasks
            .filter(task => !task.completed)
            .sort((a, b) => {
              return (
                this.calculatePriorityScore(b) -
                this.calculatePriorityScore(a)
              );
            });

        this.workloadLevel =
          this.calculateWorkloadLevel(this.pendingTasks);

        this.estimatedStudyHours =
          this.calculateStudyTime(this.pendingTasks);

        this.dailyPlan =
          this.createDailyPlan(this.pendingTasks);

        this.generateSuggestions(this.pendingTasks);

      },

      error: (error) => {
        console.error('Failed to load tasks for AI:', error);
      }

    });

  }


  // =========================================================
  // SMART STUDY SESSION
  // =========================================================

  createStudySession(minutes: number): void {

    this.selectedStudyMinutes = minutes;
    this.sessionTasks = [];
    this.sessionStudyMinutes = 0;

    if (this.pendingTasks.length === 0) {
      return;
    }

    for (const task of this.pendingTasks) {

      const taskMinutes = this.getTaskStudyMinutes(task);

      if (this.sessionStudyMinutes + taskMinutes <= minutes) {
        this.sessionTasks.push(task);
        this.sessionStudyMinutes += taskMinutes;
      }

      if (this.sessionStudyMinutes >= minutes) {
        break;
      }

    }

  }


  // =========================================================
  // GET STUDY TIME FOR ONE TASK
  // =========================================================

  getTaskStudyMinutes(task: StudyTask): number {

    if (task.category === 'Exam') {
      return 120;
    }

    if (task.category === 'Project') {
      return 180;
    }

    if (task.category === 'Assignment') {
      return 90;
    }

    if (task.category === 'Quiz') {
      return 45;
    }

    return 60;

  }


  // =========================================================
  // GENERATE PERSONALIZED RECOMMENDATIONS
  // =========================================================

  private generateSuggestions(tasks: StudyTask[]): void {

    this.suggestions = [];


    // NO PENDING TASKS

    if (tasks.length === 0) {

      this.suggestions.push({
        text: 'You have no pending tasks. Great job staying on track.',
        level: 'success'
      });

      return;

    }


    // TOP PRIORITY TASK

    const topTask = tasks[0];

    this.suggestions.push({
      text: `Start with ${topTask.subject}: "${topTask.task}". It has the highest priority score of ${this.calculatePriorityScore(topTask)}.`,
      level: 'info'
    });


    // WORKLOAD RECOMMENDATION

    if (this.workloadLevel === 'Heavy') {

      this.suggestions.push({
        text: `Your workload is heavy with ${tasks.length} pending tasks. Avoid multitasking and complete the highest-priority tasks first.`,
        level: 'danger'
      });

    } else if (this.workloadLevel === 'Moderate') {

      this.suggestions.push({
        text: `Your workload is moderate with ${tasks.length} pending tasks. Create focused study sessions and work through your highest-priority tasks.`,
        level: 'warning'
      });

    } else {

      this.suggestions.push({
        text: `Your workload is light with ${tasks.length} pending tasks. Use the available time to stay ahead of your deadlines.`,
        level: 'success'
      });

    }


    // TOTAL STUDY TIME

    this.suggestions.push({
      text: `Your current pending workload requires approximately ${this.estimatedStudyHours} hour(s) of study time.`,
      level: 'info'
    });


    // OVERDUE TASKS

    const overdueTasks = tasks.filter(task => this.calculateDaysLeft(task) < 0);

    if (overdueTasks.length > 0) {

      this.suggestions.push({
        text: `You have ${overdueTasks.length} overdue task(s). Complete these before starting lower-priority work.`,
        level: 'danger'
      });

    }


    // TASKS DUE TODAY

    const todayTasks = tasks.filter(task => this.calculateDaysLeft(task) === 0);

    if (todayTasks.length > 0) {

      this.suggestions.push({
        text: `${todayTasks.length} task(s) are due today. These should be part of your first study session.`,
        level: 'warning'
      });

    }


    // UPCOMING TASKS

    const upcomingTasks = tasks.filter(task => {
      const days = this.calculateDaysLeft(task);
      return days > 0 && days <= 3;
    });

    if (upcomingTasks.length > 0) {

      this.suggestions.push({
        text: `${upcomingTasks.length} task(s) are due within 3 days. Start preparing for them after handling today's urgent work.`,
        level: 'info'
      });

    }

  }


  // =========================================================
  // ESTIMATE TOTAL STUDY TIME
  // =========================================================

  calculateStudyTime(tasks: StudyTask[]): number {

    let totalMinutes = 0;

    tasks.forEach(task => {
      totalMinutes += this.getTaskStudyMinutes(task);
    });

    return Number((totalMinutes / 60).toFixed(1));

  }


  // =========================================================
  // CREATE SMART DAILY PLAN
  // =========================================================

  createDailyPlan(tasks: StudyTask[]): StudyTask[] {

    const maximumTasksPerDay = 3;

    const sortedTasks = [...tasks].sort((a, b) => {
      return (
        this.calculatePriorityScore(b) -
        this.calculatePriorityScore(a)
      );
    });

    return sortedTasks.slice(0, maximumTasksPerDay);

  }


  // =========================================================
  // ANALYZE OVERALL WORKLOAD
  // =========================================================

  calculateWorkloadLevel(tasks: StudyTask[]): string {

    const pendingCount = tasks.length;

    const urgentCount = tasks.filter(
      task => this.calculateUrgency(task) >= 70
    ).length;

    const overdueCount = tasks.filter(
      task => this.calculateDaysLeft(task) < 0
    ).length;

    if (pendingCount >= 7 || urgentCount >= 4 || overdueCount >= 2) {
      return 'Heavy';
    }

    if (pendingCount >= 4 || urgentCount >= 2 || overdueCount >= 1) {
      return 'Moderate';
    }

    return 'Light';

  }


  // =========================================================
  // CALCULATE PRIORITY SCORE
  // =========================================================

  calculatePriorityScore(task: StudyTask): number {

    let score = this.calculateUrgency(task);

    if (task.category === 'Exam') {
      score += 25;
    }

    if (task.category === 'Assignment') {
      score += 20;
    }

    if (task.category === 'Project') {
      score += 15;
    }

    if (task.category === 'Quiz') {
      score += 10;
    }

    return score;

  }


  // =========================================================
  // CALCULATE URGENCY SCORE
  // =========================================================

  calculateUrgency(task: StudyTask): number {

    const daysLeft = this.calculateDaysLeft(task);

    if (daysLeft < 0) {
      return 100;
    }

    if (daysLeft === 0) {
      return 90;
    }

    if (daysLeft === 1) {
      return 80;
    }

    if (daysLeft <= 3) {
      return 70;
    }

    if (daysLeft <= 7) {
      return 50;
    }

    return 20;

  }


  // =========================================================
  // CALCULATE DAYS LEFT
  // =========================================================

  calculateDaysLeft(task: StudyTask): number {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    const difference = deadline.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));

  }


  // =========================================================
  // CALCULATE PRIORITY LEVEL
  // =========================================================

  calculatePriority(task: StudyTask): string {

    const daysLeft = this.calculateDaysLeft(task);

    if (daysLeft < 0) {
      return 'HIGH';
    }

    if (task.category === 'Exam' && daysLeft <= 7) {
      return 'HIGH';
    }

    if (task.category === 'Assignment' && daysLeft <= 3) {
      return 'HIGH';
    }

    if (task.category === 'Quiz' && daysLeft <= 3) {
      return 'MEDIUM';
    }

    if (task.category === 'Project' && daysLeft <= 7) {
      return 'MEDIUM';
    }

    return 'LOW';

  }


  // =========================================================
  // EXPLAIN WHY A TASK IS IMPORTANT
  // =========================================================

  getTaskReason(task: StudyTask): string {

    const daysLeft = this.calculateDaysLeft(task);

    if (daysLeft < 0) {
      return 'This task is overdue and should be completed as soon as possible.';
    }

    if (daysLeft === 0) {
      return 'This task is due today, so it should be one of your first priorities.';
    }

    if (task.category === 'Exam' && daysLeft <= 7) {
      return 'This is an upcoming exam, so it requires early preparation and consistent study.';
    }

    if (task.category === 'Assignment' && daysLeft <= 3) {
      return 'This assignment is approaching quickly. Completing it early will reduce deadline pressure.';
    }

    if (task.category === 'Quiz' && daysLeft <= 3) {
      return 'This quiz is approaching soon. Review the relevant material before the deadline.';
    }

    if (task.category === 'Project' && daysLeft <= 7) {
      return 'This project requires more study time, so starting early is recommended.';
    }

    if (daysLeft <= 7) {
      return 'This task has an upcoming deadline and should be included in your study schedule.';
    }

    return 'This task has more time before its deadline, so you can work on it after urgent tasks.';

  }

}