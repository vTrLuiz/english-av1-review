import { QUESTIONS } from "../src/questions.js";
import { GUIDED_REVIEW } from "../src/review-content.js";
import { validateGuidedReview, validateQuestions } from "../src/content-validation.js";

const errors = [...validateQuestions(QUESTIONS), ...validateGuidedReview(GUIDED_REVIEW)];
const counts = QUESTIONS.reduce((groups, question) => {
  (groups[question.skill] ||= []).push(question);
  return groups;
}, {});
for (const skill of ["wh", "profiles", "dialogue", "grammar"]) {
  if ((counts[skill]?.length ?? 0) !== 10) errors.push(`${skill}: expected 10 questions.`);
}

if (QUESTIONS.length !== 40) errors.push(`Expected 40 questions, found ${QUESTIONS.length}.`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Content check passed: 40 questions and 4 guided-review steps.");
}
