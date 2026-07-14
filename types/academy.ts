export type AcademyLesson = {
  completed: boolean;
  id: string;
  slug: string;
  title: string;
};

export type AcademyProgress = {
  completedLessons: number;
  lessons: AcademyLesson[];
  percentage: number;
  totalLessons: number;
  userId: string;
};
