import { QUESTIONS } from "./questions.js";
import { GUIDED_REVIEW } from "./review-content.js";
import { createRouter } from "./router.js";
import { createProgressStore } from "./storage.js";
import { gradeQuestion, recommendWeakSkill, selectSimulation, summarizeResults } from "./quiz-engine.js";
import { emptyMistakesView, homeView, notFoundView, quizView, renderScreen, resultsView, reviewView, roleplayView } from "./views.js";

export function startApp({ window: browserWindow, document: browserDocument }) {
  const root = browserDocument.querySelector("#app");
  const header = browserDocument.querySelector("#activity-header");
  const store = createProgressStore(browserWindow.localStorage, QUESTIONS.map((question) => question.id));
  const router = createRouter(browserWindow);
  const state = { reviewAnswers: {}, reviewPosition: {}, reviewQuestions: {}, quiz: [], quizAnswers: {}, mistakeQuiz: [], mistakeAnswers: {}, results: null };

  const showHeader = (visible) => { header.hidden = !visible; };
  const render = (route = router.current()) => {
    browserDocument.title = "English AV1 Review";
    showHeader(false);
    let bindings;
    if (route.name === "home") {
      bindings = renderScreen(root, homeView(store.load()));
      bindings.on("start-review", () => router.go(`review/${GUIDED_REVIEW[0].id}`));
      bindings.on("start-quiz", () => { state.quiz = []; state.quizAnswers = {}; router.go("quiz/0"); });
      bindings.on("start-mistakes", () => { state.mistakeQuiz = []; state.mistakeAnswers = {}; router.go("mistakes/0"); });
    } else if (route.name === "review") {
      const stepIndex = GUIDED_REVIEW.findIndex((step) => step.id === route.step);
      if (stepIndex < 0) return render({ name: "not-found" });
      const step = GUIDED_REVIEW[stepIndex];
      showHeader(true);
      browserDocument.querySelector("#activity-label").textContent = "Revisão guiada";
      browserDocument.querySelector("#activity-count").textContent = `${stepIndex + 1}/4`;
      browserDocument.querySelector("#progress-bar").style.width = `${((stepIndex + 1) / 4) * 100}%`;
      if (step.id === "roleplay") {
        bindings = renderScreen(root, roleplayView(step));
        bindings.on("finish-review", () => router.go("home"));
      } else {
        const practiceIndex = state.reviewPosition[step.id] ?? 0;
        const questionId = step.practiceQuestionIds[practiceIndex];
        const originalQuestion = QUESTIONS.find((item) => item.id === questionId);
        if (originalQuestion && !state.reviewQuestions[questionId]) state.reviewQuestions[questionId] = selectSimulation([originalQuestion], { count: 1 })[0];
        const question = state.reviewQuestions[questionId];
        bindings = renderScreen(root, reviewView(step, stepIndex, question, practiceIndex, question ? state.reviewAnswers[question.id] : null));
        root.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => {
          if (state.reviewAnswers[question.id] != null) return;
          state.reviewAnswers[question.id] = Number(button.dataset.choice);
          render(route);
          const correct = state.reviewAnswers[question.id] === question.correctIndex;
          browserDocument.querySelector("#announcer").textContent = correct ? `Correto. ${question.correctSentence}` : `Resposta correta: ${question.correctSentence}`;
          root.querySelector("[data-feedback]")?.focus({ preventScroll: true });
        }));
        bindings.on("next-practice", () => {
          state.reviewPosition[step.id] = practiceIndex + 1;
          render(route);
          root.scrollIntoView({ block: "start" });
        });
        bindings.on("next-review", () => router.go(`review/${GUIDED_REVIEW[stepIndex + 1].id}`));
      }
      bindings.on("review-back", () => {
        const position = state.reviewPosition[step.id] ?? 0;
        if (step.id !== "roleplay" && position > 0) {
          state.reviewPosition[step.id] = position - 1;
          render(route);
        } else if (stepIndex > 0) router.go(`review/${GUIDED_REVIEW[stepIndex - 1].id}`);
        else router.go("home");
      });
    } else if (route.name === "quiz" || route.name === "mistakes") {
      const isMistakes = route.name === "mistakes";
      if (isMistakes && state.mistakeQuiz.length === 0) {
        const pending = new Set(store.load().mistakeIds);
        state.mistakeQuiz = selectSimulation(QUESTIONS.filter((question) => pending.has(question.id)), { count: pending.size });
      }
      if (!isMistakes && state.quiz.length === 0) state.quiz = selectSimulation(QUESTIONS, { count: 20 });
      const list = isMistakes ? state.mistakeQuiz : state.quiz;
      const answers = isMistakes ? state.mistakeAnswers : state.quizAnswers;
      if (list.length === 0) {
        bindings = renderScreen(root, emptyMistakesView());
        bindings.on("new-quiz", () => { state.quiz = []; state.quizAnswers = {}; router.go("quiz/0"); });
        bindings.on("go-home", () => router.go("home"));
      } else {
        const question = list[route.index];
        if (!question) { router.go("home"); return; }
        showHeader(true);
        browserDocument.querySelector("#activity-label").textContent = isMistakes ? "Revisão de erros" : "Simulado AV1";
        browserDocument.querySelector("#activity-count").textContent = `${route.index + 1}/${list.length}`;
        browserDocument.querySelector("#progress-bar").style.width = `${((route.index + 1) / list.length) * 100}%`;
        bindings = renderScreen(root, quizView(question, route.index, list.length, answers[question.id], route.name));
        root.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => {
          if (answers[question.id] != null) return;
          answers[question.id] = Number(button.dataset.choice);
          const grade = gradeQuestion(question, answers[question.id]);
          store.recordResult(question.id, grade.correct);
          render(route);
          browserDocument.querySelector("#announcer").textContent = grade.correct ? `Correto. ${grade.correctSentence}` : `Resposta correta: ${grade.correctSentence}`;
          root.querySelector("[data-feedback]")?.focus({ preventScroll: true });
        }));
        bindings.on("next-question", () => {
          if (route.index + 1 < list.length) router.go(`${route.name}/${route.index + 1}`);
          else {
            state.results = { ...summarizeResults(list, answers), mode: route.name, questions: list, answers };
            if (!isMistakes) {
              const finalQuestion = list[list.length - 1];
              store.recordResult(finalQuestion.id, answers[finalQuestion.id] === finalQuestion.correctIndex, state.results.percentage);
            }
            router.go("results");
          }
        });
      }
    } else if (route.name === "results" && state.results) {
      const recommendation = recommendWeakSkill(state.results.perSkill);
      bindings = renderScreen(root, resultsView(state.results, recommendation, new Map(state.results.questions.map((question) => [question.id, question])), state.results.answers, state.results.mode));
      bindings.on("retry-mistakes", () => { state.mistakeQuiz = []; state.mistakeAnswers = {}; router.go("mistakes/0"); });
      bindings.on("new-quiz", () => { state.quiz = []; state.quizAnswers = {}; router.go("quiz/0"); });
      bindings.on("go-home", () => router.go("home"));
    } else {
      bindings = renderScreen(root, notFoundView());
      bindings.on("go-home", () => router.go("home"));
    }
    root.focus({ preventScroll: true });
  };

  browserDocument.querySelector("#home-button").addEventListener("click", () => router.go("home"));
  browserDocument.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || /input|textarea/i.test(event.target?.tagName || "")) return;
    const index = "abcd".indexOf(event.key.toLowerCase());
    if (index >= 0) root.querySelector(`[data-choice="${index}"]:not(:disabled)`)?.click();
  });
  router.subscribe((route) => {
    browserWindow.scrollTo(0, 0);
    render(route);
  });
  if (!browserWindow.location.hash) router.go("home", { replace: true });
  else {
    browserWindow.scrollTo(0, 0);
    render();
  }
  return { router, state, store, render };
}

startApp({ window, document });

