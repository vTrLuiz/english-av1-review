const normalized = (value) => String(value ?? "").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");

export function validateQuestions(questions) {
  const errors = [];
  const ids = new Set();
  const pairs = new Set();
  const skills = new Set(["wh", "profiles", "dialogue", "grammar"]);

  if (!Array.isArray(questions)) return ["Question bank must be an array."];
  questions.forEach((item, index) => {
    const label = item?.id || `question ${index + 1}`;
    if (!item?.id || ids.has(item.id)) errors.push(`${label}: id must be unique.`);
    ids.add(item?.id);
    if (!skills.has(item?.skill)) errors.push(`${label}: unknown skill.`);
    if (!normalized(item?.prompt)) errors.push(`${label}: prompt is required.`);
    if (!Array.isArray(item?.options) || item.options.length !== 4 || new Set(item.options.map(normalized)).size !== 4) errors.push(`${label}: four unique options are required.`);
    if (!Number.isInteger(item?.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3) errors.push(`${label}: correctIndex must be 0–3.`);
    if (![2, 3, 4].includes(item?.sourceSlide)) errors.push(`${label}: sourceSlide must be 2, 3, or 4.`);
    for (const key of ["correctSentence", "explanationPt", "hintPt"]) if (!normalized(item?.[key])) errors.push(`${label}: ${key} is required.`);
    const answer = item?.options?.[item?.correctIndex];
    const pair = `${normalized(item?.prompt)}|${normalized(answer)}`;
    if (pairs.has(pair)) errors.push(`${label}: duplicate prompt and answer.`);
    pairs.add(pair);
  });
  return errors;
}

export function validateGuidedReview(steps) {
  const errors = [];
  const expected = ["jessie", "kyle", "dialogue", "roleplay"];
  if (!Array.isArray(steps)) return ["Guided review must be an array."];
  if (steps.map((step) => step?.id).join(",") !== expected.join(",")) errors.push("Guided review order is invalid.");
  steps.forEach((step, index) => {
    const label = step?.id || `step ${index + 1}`;
    if (!normalized(step?.title) || !normalized(step?.introPt)) errors.push(`${label}: title and intro are required.`);
    if (!Array.isArray(step?.practiceQuestionIds)) errors.push(`${label}: practiceQuestionIds must be an array.`);
    if (![2, 3, 4, 5].includes(step?.sourceSlide)) errors.push(`${label}: sourceSlide must be 2–5.`);
    if (!step?.content || typeof step.content !== "object") errors.push(`${label}: content is required.`);
  });
  return errors;
}
