
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';

interface StudyTask {
  id?: string;
  subject: string;
  task: string;
  category: string;
  deadline: string;
  completed: boolean;
  userId?: string;
}

interface Suggestion {
  text: string;
  level: 'info' | 'danger' | 'warning' | 'success';
}

@Component({
  selector: 'app-ai-suggestion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-suggestion.html',
  styleUrl: './ai-suggestion.css'
})
export class AiSuggestion implements OnInit, OnDestroy {
  suggestions: Suggestion[] = [];

  // Personalized study plan
  aiStudyPlan = '';
  aiStudyGoals =
    'Prepare for upcoming deadlines and improve understanding of difficult topics.';
  aiAvailableHours = 3;
  isGeneratingStudyPlan = false;
  studyPlanError = '';

  // Task and workload information
  pendingTasks: StudyTask[] = [];
  workloadLevel = '';
  estimatedStudyHours = 0;
  dailyPlan: StudyTask[] = [];

  // Study session information
  selectedStudyMinutes = 0;
  sessionTasks: StudyTask[] = [];
  sessionStudyMinutes = 0;

  private tasksSubscription?: Subscription;

  constructor(
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.tasksSubscription?.unsubscribe();
  }

  // Load the signed-in user's tasks from Firestore.
  private loadTasks(): void {
    try {
      this.tasksSubscription =
        this.firebaseService.getTasks().subscribe({
          next: (tasks: any[]) => {
            this.pendingTasks = (tasks as StudyTask[])
              .filter(task => !task.completed)
              .sort((a, b) =>
                this.calculatePriorityScore(b) -
                this.calculatePriorityScore(a)
              );

            this.workloadLevel =
              this.calculateWorkloadLevel(this.pendingTasks);

            this.estimatedStudyHours =
              this.calculateStudyTime(this.pendingTasks);

            this.dailyPlan =
              this.createDailyPlan(this.pendingTasks);

            this.generateSuggestions(this.pendingTasks);
          },
          error: error => {
            console.error('Failed to load tasks:', error);
            this.studyPlanError =
              'Unable to load your tasks. Please check your connection and sign in again.';
          }
        });
    } catch (error) {
      console.error('Unable to subscribe to Firestore tasks:', error);
      this.studyPlanError =
        'Please sign in before loading your study tasks.';
    }
  }

  // Select tasks that fit inside the chosen study session.
  createStudySession(minutes: number): void {
    this.selectedStudyMinutes = minutes;
    this.sessionTasks = [];
    this.sessionStudyMinutes = 0;

    for (const task of this.pendingTasks) {
      const taskMinutes = this.getTaskStudyMinutes(task);

      if (this.sessionStudyMinutes + taskMinutes <= minutes) {
        this.sessionTasks.push(task);
        this.sessionStudyMinutes += taskMinutes;
      }
    }
  }

  // Estimate time based on task category.
  getTaskStudyMinutes(task: StudyTask): number {
    const studyMinutes: Record<string, number> = {
      Exam: 120,
      Project: 180,
      Assignment: 90,
      Quiz: 45
    };

    return studyMinutes[task.category] ?? 60;
  }

  // Create helpful rule-based recommendations.
  private generateSuggestions(tasks: StudyTask[]): void {
    this.suggestions = [];

    if (tasks.length === 0) {
      this.suggestions.push({
        text: 'You have no pending tasks. Great job staying on track.',
        level: 'success'
      });
      return;
    }

    const topTask = tasks[0];

    this.suggestions.push({
      text:
        `Start with ${topTask.subject}: "${topTask.task}". ` +
        `It has the highest priority score of ${this.calculatePriorityScore(topTask)}.`,
      level: 'info'
    });

    if (this.workloadLevel === 'Heavy') {
      this.suggestions.push({
        text:
          `Your workload is heavy with ${tasks.length} pending tasks. ` +
          'Focus on the highest-priority tasks first.',
        level: 'danger'
      });
    } else if (this.workloadLevel === 'Moderate') {
      this.suggestions.push({
        text:
          `Your workload is moderate with ${tasks.length} pending tasks. ` +
          'Use focused study sessions.',
        level: 'warning'
      });
    } else {
      this.suggestions.push({
        text:
          `Your workload is light with ${tasks.length} pending tasks. ` +
          'Use the extra time to prepare for upcoming deadlines.',
        level: 'success'
      });
    }

    this.suggestions.push({
      text:
        `Your pending tasks require approximately ${this.estimatedStudyHours} hours of study time.`,
      level: 'info'
    });

    const overdueTasks = tasks.filter(
      task => this.calculateDaysLeft(task) < 0
    );

    if (overdueTasks.length > 0) {
      this.suggestions.push({
        text:
          `You have ${overdueTasks.length} overdue task(s). Prioritize these tasks.`,
        level: 'danger'
      });
    }

    const todayTasks = tasks.filter(
      task => this.calculateDaysLeft(task) === 0
    );

    if (todayTasks.length > 0) {
      this.suggestions.push({
        text: `${todayTasks.length} task(s) are due today.`,
        level: 'warning'
      });
    }

    const upcomingTasks = tasks.filter(task => {
      const days = this.calculateDaysLeft(task);
      return days > 0 && days <= 3;
    });

    if (upcomingTasks.length > 0) {
      this.suggestions.push({
        text: `${upcomingTasks.length} task(s) are due within three days.`,
        level: 'info'
      });
    }
  }

  // Estimate the total study time for all pending tasks.
  calculateStudyTime(tasks: StudyTask[]): number {
    const totalMinutes = tasks.reduce(
      (total, task) =>
        total + this.getTaskStudyMinutes(task),
      0
    );

    return Number((totalMinutes / 60).toFixed(1));
  }

  // Choose the three highest-priority tasks for the daily overview.
  createDailyPlan(tasks: StudyTask[]): StudyTask[] {
    return [...tasks]
      .sort((a, b) =>
        this.calculatePriorityScore(b) -
        this.calculatePriorityScore(a)
      )
      .slice(0, 3);
  }

  calculateWorkloadLevel(tasks: StudyTask[]): string {
    const pendingCount = tasks.length;

    const urgentCount = tasks.filter(
      task => this.calculateUrgency(task) >= 70
    ).length;

    const overdueCount = tasks.filter(
      task => this.calculateDaysLeft(task) < 0
    ).length;

    if (
      pendingCount >= 7 ||
      urgentCount >= 4 ||
      overdueCount >= 2
    ) {
      return 'Heavy';
    }

    if (
      pendingCount >= 4 ||
      urgentCount >= 2 ||
      overdueCount >= 1
    ) {
      return 'Moderate';
    }

    return 'Light';
  }

  calculatePriorityScore(task: StudyTask): number {
    let score = this.calculateUrgency(task);

    const categoryScores: Record<string, number> = {
      Exam: 25,
      Assignment: 20,
      Project: 15,
      Quiz: 10
    };

    score += categoryScores[task.category] ?? 0;

    return score;
  }

  calculateUrgency(task: StudyTask): number {
    const daysLeft = this.calculateDaysLeft(task);

    if (daysLeft < 0) return 100;
    if (daysLeft === 0) return 90;
    if (daysLeft === 1) return 80;
    if (daysLeft <= 3) return 70;
    if (daysLeft <= 7) return 50;

    return 20;
  }

  calculateDaysLeft(task: StudyTask): number {
    if (!task.deadline) {
      return Number.POSITIVE_INFINITY;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      task.deadline
    );

    if (!match) {
      return Number.POSITIVE_INFINITY;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const deadlineDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    if (
      deadlineDate.getUTCFullYear() !== year ||
      deadlineDate.getUTCMonth() !== month - 1 ||
      deadlineDate.getUTCDate() !== day
    ) {
      return Number.POSITIVE_INFINITY;
    }

    const now = new Date();
    const today = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return Math.round(
      (deadlineDate.getTime() - today) / 86400000
    );
  }

  calculatePriority(task: StudyTask): string {
    const daysLeft = this.calculateDaysLeft(task);

    if (daysLeft <= 0) {
      return 'HIGH';
    }

    if (task.category === 'Exam' && daysLeft <= 7) {
      return 'HIGH';
    }

    if (task.category === 'Assignment' && daysLeft <= 3) {
      return 'HIGH';
    }

    if (
      (task.category === 'Quiz' ||
        task.category === 'Project') &&
      daysLeft <= 7
    ) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  getTaskReason(task: StudyTask): string {
    const daysLeft = this.calculateDaysLeft(task);

    if (daysLeft < 0) {
      return 'This task is overdue and should be completed as soon as possible.';
    }

    if (daysLeft === 0) {
      return 'This task is due today and should be a top priority.';
    }

    if (task.category === 'Exam' && daysLeft <= 7) {
      return 'This upcoming exam needs consistent preparation.';
    }

    if (
      task.category === 'Assignment' &&
      daysLeft <= 3
    ) {
      return 'This assignment is approaching quickly. Start early to reduce deadline pressure.';
    }

    if (
      task.category === 'Quiz' &&
      daysLeft <= 3
    ) {
      return 'Review the relevant material before the quiz deadline.';
    }

    if (
      task.category === 'Project' &&
      daysLeft <= 7
    ) {
      return 'This project may require more time, so begin early.';
    }

    if (daysLeft <= 7) {
      return 'This task has an upcoming deadline and should be included in your schedule.';
    }

    return 'Work on this task after handling more urgent deadlines.';
  }

  // Generate a plan using actual pending Firestore tasks.
  async generateAIStudyPlan(): Promise<void> {
    this.studyPlanError = '';
    this.aiStudyPlan = '';

    if (this.pendingTasks.length === 0) {
      this.studyPlanError =
        'Add at least one pending task before generating a plan.';
      return;
    }

    if (
      !Number.isFinite(this.aiAvailableHours) ||
      this.aiAvailableHours <= 0 ||
      this.aiAvailableHours > 24
    ) {
      this.studyPlanError =
        'Enter study hours greater than 0 and no more than 24.';
      return;
    }

    if (!this.aiStudyGoals.trim()) {
      this.studyPlanError = 'Please enter your study goal.';
      return;
    }

    this.isGeneratingStudyPlan = true;

    try {
      const tasks = this.pendingTasks.map(task => ({
        subject: task.subject.trim(),
        task: task.task.trim(),
        category: task.category || 'General',
        deadline: task.deadline || '',
        completed: false
      }));

      this.aiStudyPlan =
        await this.firebaseService.generateStudyPlan({
          tasks,
          availableHours: Number(this.aiAvailableHours),
          goals: this.aiStudyGoals.trim()
        });
    } catch (error) {
      console.error(
        'Failed to generate study plan:',
        error
      );

      this.studyPlanError =
        error instanceof Error
          ? error.message
          : 'Unable to generate the study plan. Please try again.';
    } finally {
      this.isGeneratingStudyPlan = false;
    }
  }
}
