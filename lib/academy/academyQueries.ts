import { defineQuery } from "next-sanity";

const courseCardProjection = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  difficulty,
  "durationMinutes": estimatedDurationMinutes,
  learningObjectives,
  targetAudience,
  tags,
  featured,
  "accessLevel": accessLevel,
  status,
  publishedAt,
  "updatedAt": coalesce(updatedAt, _updatedAt),
  version,
  legacySlug,
  certificateEnabled,
  instructor->{
    _id,
    name,
    professionalTitle,
    "slug": slug.current
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  "moduleIds": modules[]._ref,
  "prerequisiteCourseIds": prerequisiteCourses[]._ref,
  passingRequirements{
    requireAllRequiredLessons,
    requireAllRequiredModules,
    "finalAssessmentId": finalAssessment._ref,
    minimumAssessmentPercent
  }
`;

export const academyCoursesQuery = defineQuery(/* groq */ `
  *[
    _type == "academyCourse" &&
    status == "published" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] | order(featured desc, publishedAt desc, _id asc)[$start...$end] {
    ${courseCardProjection}
  }
`);

export const academyCourseBySlugQuery = defineQuery(/* groq */ `
  *[
    _type == "academyCourse" &&
    status == "published" &&
    slug.current == $slug &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0] {
    ${courseCardProjection},
    description,
    modules[]->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      "durationMinutes": estimatedDurationMinutes,
      learningObjectives,
      "lessonIds": lessons[]._ref,
      "prerequisiteModuleIds": prerequisiteModules[]._ref,
      requiredForCompletion,
      "accessLevel": accessLevel,
      status,
      version,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        lessonType,
        summary,
        durationMinutes,
        order,
        "prerequisiteLessonIds": prerequisiteLessons[]._ref,
        requiredForCompletion,
        completionMode,
        "accessLevel": accessLevel,
        status,
        version,
        aiTutorEnabled,
        "assessmentId": assessment._ref
      } | order(order asc)
    } | order(order asc)
  }
`);

export const academyLessonForTutorQuery = defineQuery(/* groq */ `
  *[
    _type == "academyLesson" &&
    _id == $lessonId &&
    status == "published" &&
    defined(publishedAt) &&
    publishedAt <= now() &&
    aiTutorEnabled == true
  ][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    body,
    learningObjectives,
    "accessLevel": accessLevel,
    "courseId": course._ref,
    "moduleId": module._ref,
    version
  }
`);

export const academyLessonStateQuery = defineQuery(/* groq */ `
  *[
    _type == "academyLesson" &&
    _id == $lessonId &&
    status == "published" &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0] {
    _id,
    "courseId": course._ref,
    "moduleId": module._ref,
    "modulePrerequisiteIds": module->prerequisiteModules[]._ref,
    completionMode,
    "prerequisiteLessonIds": prerequisiteLessons[]._ref,
    requiredForCompletion,
    durationMinutes,
    video{durationSeconds},
    "assessmentId": assessment._ref,
    version
  }
`);

// This query is server-only. Never use it in a route response or client module.
export const academyAssessmentForGradingQuery = defineQuery(/* groq */ `
  *[
    _type == "academyAssessment" &&
    _id == $assessmentId &&
    status == "published"
  ][0] {
    _id,
    title,
    "slug": slug.current,
    assessmentType,
    "courseId": course._ref,
    "moduleId": module._ref,
    "lessonId": lesson._ref,
    instructions,
    passingScore,
    maximumAttempts,
    timeLimitMinutes,
    randomizeQuestions,
    randomizeAnswers,
    showCorrectAnswers,
    showExplanations,
    availableFrom,
    availableUntil,
    "premium": accessLevel == "premium",
    status,
    version,
    questions[]{
      "id": questionId,
      prompt,
      questionType,
      "answers": answers[]{
        "id": optionId,
        label,
        matchKey
      },
      correctOptionIds,
      numericAnswer,
      numericTolerance,
      explanation,
      points,
      partialCredit,
      difficulty,
      tags
    }
  }
`);

export const academyLearningPathsQuery = defineQuery(/* groq */ `
  *[
    _type == "academyLearningPath" &&
    status == "published" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] | order(featured desc, publishedAt desc, _id asc)[$start...$end] {
    _id,
    title,
    "slug": slug.current,
    difficulty,
    "durationMinutes": estimatedDurationMinutes,
    "courseIds": courses[].course._ref,
    "requiredCourseIds": courses[required == true].course._ref,
    "prerequisitePathIds": prerequisiteLearningPaths[]._ref,
    "accessLevel": accessLevel,
    status,
    version
  }
`);
