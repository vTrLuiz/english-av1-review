import { SKILLS } from "./questions.js";

const SKILL_ORDER = ["wh", "profiles", "dialogue", "grammar"];

function shuffled(values, random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function shuffleOptions(question, random) {
  const correct = question.options[question.correctIndex];
  const options = shuffled(question.options, random);
  return { ...question, options, correctIndex: options.indexOf(correct) };
}

export function selectSimulation(questions, { count = 20, random = Math.random } = {}) {
  const requested = Math.max(0, Math.min(Math.floor(count), questions.length));
  const groups = Object.fromEntries(SKILL_ORDER.map((skill) => [skill, shuffled(questions.filter((question) => question.skill === skill), random)]));
  const selected = [];

  while (selected.length < requested) {
    let added = false;
    for (const skill of SKILL_ORDER) {
      const next = groups[skill].shift();
      if (next && selected.length < requested) {
        selected.push(shuffleOptions(next, random));
        added = true;
      }
    }
    if (!added) break;
  }

  return shuffled(selected, random);
}

export function gradeQuestion(question, selectedIndex) {
  return {
    correct: selectedIndex === question.correctIndex,
    correctIndex: question.correctIndex,
    correctSentence: question.correctSentence,
    explanationPt: question.explanationPt,
    hintPt: question.hintPt,
  };
}

export function summarizeResults(questions, answers = {}) {
  const perSkill = Object.fromEntries(SKILL_ORDER.map((skill) => [skill, { correct: 0, total: 0, percentage: 0 }]));
  const mistakeIds = [];
  let correct = 0;
  let answered = 0;

  for (const question of questions) {
    if (!Object.hasOwn(answers, question.id)) continue;
    answered += 1;
    perSkill[question.skill].total += 1;
    if (answers[question.id] === question.correctIndex) {
      correct += 1;
      perSkill[question.skill].correct += 1;
    } else {
      mistakeIds.push(question.id);
    }
  }

  for (const score of Object.values(perSkill)) score.percentage = score.total ? Math.round((score.correct / score.total) * 100) : 0;
  return { answered, correct, percentage: answered ? Math.round((correct / answered) * 100) : 0, perSkill, mistakeIds };
}

export function recommendWeakSkill(perSkill) {
  const eligible = SKILL_ORDER.filter((candidate) => (perSkill[candidate]?.total ?? 0) > 0);
  const pool = eligible.length ? eligible : SKILL_ORDER;
  const skill = pool.reduce((weakest, candidate) => {
    const candidateScore = perSkill[candidate]?.percentage ?? 0;
    const weakestScore = perSkill[weakest]?.percentage ?? 0;
    return candidateScore < weakestScore ? candidate : weakest;
  }, pool[0]);

  const messages = {
    wh: "Revise quando usar What, Where, When, Why e How.",
    profiles: "Pratique perguntas sobre idade, origem, nacionalidade e aparência.",
    dialogue: "Leia o diálogo novamente e use a resposta como pista.",
    grammar: "Revise am, is, are, have e has antes de tentar novamente.",
  };
  return { skill, label: SKILLS[skill], messagePt: messages[skill] };
}
