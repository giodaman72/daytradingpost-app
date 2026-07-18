import {
  academyAnswerOptionType,
  academyPassingRequirementsType,
  academyQuestionType,
  academyResourceType,
  academyVideoType,
} from "./academyObjects";
import { academyAssessmentType } from "./academyAssessment";
import { academyCertificateTemplateType } from "./academyCertificateTemplate";
import { academyCourseType } from "./academyCourse";
import { academyLearningPathType } from "./academyLearningPath";
import { academyLessonType } from "./academyLesson";
import { academyModuleType } from "./academyModule";
import { articleType } from "./article";
import { authorType } from "./author";
import { categoryType } from "./category";
import { instructorType } from "./instructor";

export const schemaTypes = [
  articleType,
  authorType,
  categoryType,
  academyVideoType,
  academyResourceType,
  academyAnswerOptionType,
  academyQuestionType,
  academyPassingRequirementsType,
  instructorType,
  academyCertificateTemplateType,
  academyAssessmentType,
  academyLessonType,
  academyModuleType,
  academyCourseType,
  academyLearningPathType,
];
