export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  availableTimeSlots: TimeSlot[];
  subjectPriorities: SubjectPriority[];
  preferredStudyHours: number;
  breakDuration: number;
  maxStudySession: number;
  studyStyle: 'focused' | 'mixed' | 'flexible';
  notifications: boolean;
  weeklyGoal: number;
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  priority: number;
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectPriority {
  subjectId: string;
  priority: number;
  allocatedHours: number;
}

export interface Schedule {
  id: string;
  userId: string;
  date: Date;
  sessions: StudySession[];
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  scheduleId: string;
  subjectId: string;
  subject: Subject;
  startTime: Date;
  endTime: Date;
  duration: number;
  priority: number;
  status: 'pending' | 'completed' | 'missed' | 'in-progress';
  actualDuration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  sessionId: string;
  stressLevel: number;
  completionStatus: 'completed' | 'partial' | 'not-started';
  difficultyRating: number;
  comments?: string;
  suggestions?: string;
  createdAt: Date;
}

export interface WeeklyReport {
  userId: string;
  week: string;
  totalStudyTime: number;
  completedSessions: number;
  missedSessions: number;
  averageStressLevel: number;
  subjectBreakdown: SubjectStats[];
  goals: WeeklyGoal[];
  createdAt: Date;
}

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  totalTime: number;
  completedSessions: number;
  averageStressLevel: number;
  averageDifficulty: number;
}

export interface WeeklyGoal {
  id: string;
  description: string;
  targetHours: number;
  actualHours: number;
  isCompleted: boolean;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'schedule' | 'break' | 'priority' | 'duration';
  message: string;
  confidence: number;
  createdAt: Date;
  isRead: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ScheduleState {
  currentSchedule: Schedule | null;
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
}