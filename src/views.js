import { SKILLS } from "./questions.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);

export function homeView(progress) {
  const learned = progress.completedIds.length;
  const mistakes = progress.mistakeIds.length;
  return {
    type: "home",
    html: `
      <section class="hero">
        <div class="eyebrow">Inglês · Módulo I</div>
        <h1>Review 1, do seu jeito</h1>
        <p class="hero-copy">Treine Jessie, Kyle e as WH questions com explicações rápidas em português.</p>
        <div class="hero-people" aria-label="Personagens da revisão">
          <div class="person person-jessie"><span aria-hidden="true">J</span><p><strong>Jessie</strong><small>Japan · 26</small></p></div>
          <div class="connector" aria-hidden="true">hello!</div>
          <div class="person person-kyle"><span aria-hidden="true">K</span><p><strong>Kyle</strong><small>Colombia · 32</small></p></div>
        </div>
      </section>
      <section class="start-grid" aria-labelledby="choose-title">
        <div class="section-heading"><p class="kicker">Escolha seu treino</p><h2 id="choose-title">Como você quer estudar hoje?</h2></div>
        <button class="path-card featured" data-action="start-review" type="button">
          <span class="path-number">01</span><span><strong>Revisão guiada</strong><small>Aprenda com os 5 slides da revisão</small></span><span aria-hidden="true">→</span>
        </button>
        <button class="path-card" data-action="start-quiz" type="button">
          <span class="path-number">02</span><span><strong>Simulado AV1</strong><small>20 questões equilibradas</small></span><span aria-hidden="true">→</span>
        </button>
        <button class="path-card" data-action="start-mistakes" type="button" ${mistakes ? "" : "disabled"}>
          <span class="path-number">03</span><span><strong>Revisar meus erros</strong><small>${mistakes ? `${mistakes} ${mistakes === 1 ? "questão pendente" : "questões pendentes"}` : "Nenhum erro salvo ainda"}</small></span><span aria-hidden="true">→</span>
        </button>
      </section>
      <section class="home-stats" aria-label="Seu progresso">
        <div><strong>${learned}</strong><span>questões dominadas</span></div>
        <div><strong>${progress.bestScore ?? "—"}${progress.bestScore == null ? "" : "%"}</strong><span>melhor resultado</span></div>
      </section>`,
  };
}

export function notFoundView() {
  return { type: "not-found", html: `<section class="centered"><p class="kicker">Ops</p><h1>Página não encontrada</h1><p>Esse caminho não faz parte da revisão.</p><button class="button primary" data-action="go-home">Voltar ao início</button></section>` };
}

function optionButtons(question, answer) {
  return question.options.map((option, index) => {
    let state = "";
    let mark = String.fromCharCode(65 + index);
    if (answer != null) {
      if (index === question.correctIndex) { state = " correct"; mark = "✓"; }
      else if (index === answer) { state = " incorrect"; mark = "×"; }
    }
    return `<button class="answer${state}" type="button" data-choice="${index}" ${answer != null ? "disabled" : ""}><span aria-hidden="true">${mark}</span><strong lang="en">${escapeHtml(option)}</strong></button>`;
  }).join("");
}

function reviewContext(step) {
  if (step.id === "jessie" || step.id === "kyle") {
    const profile = step.content.profile;
    return `<div class="profile-sheet ${step.id}">
      <div class="profile-avatar" aria-hidden="true">${profile.name[0]}</div>
      <div><p class="kicker">People profile</p><h2>${profile.name}, ${profile.age}</h2><p lang="en">${profile.country} · ${profile.nationality}</p>${step.content.appearance ? `<p lang="en">${escapeHtml(step.content.appearance)}</p>` : ""}</div>
    </div><p class="teaching-note">${escapeHtml(step.content.notePt)}</p>`;
  }
  if (step.id === "dialogue") {
    return `<div class="dialogue" lang="en">${step.content.lines.map(([speaker, line]) => `<div class="dialogue-line ${speaker === "Jessie" ? "jessie" : "friend"}"><strong>${escapeHtml(speaker)}</strong><p>${escapeHtml(line)}</p></div>`).join("")}</div>`;
  }
  return "";
}

export function reviewView(step, stepIndex, question, practiceIndex, answer) {
  const complete = !question;
  const feedback = answer == null || !question ? "" : `<div class="feedback ${answer === question.correctIndex ? "success" : "needs-work"}" role="status" tabindex="-1" data-feedback>
    <p class="feedback-title">${answer === question.correctIndex ? "Boa! Você acertou." : "Quase. Veja a resposta correta."}</p>
    <p lang="en"><strong>${escapeHtml(question.correctSentence)}</strong></p>
    <p>${escapeHtml(question.explanationPt)}</p>
    ${answer === question.correctIndex ? "" : `<p class="hint"><strong>Dica:</strong> ${escapeHtml(question.hintPt)}</p>`}
  </div>`;
  return {
    type: "review",
    html: `<section class="lesson">
      <button class="text-button" type="button" data-action="review-back">← Voltar</button>
      <div class="lesson-heading"><p class="kicker">Etapa ${stepIndex + 1} de 4 · Slide ${step.sourceSlide}</p><h1>${escapeHtml(step.title)}</h1><p>${escapeHtml(step.introPt)}</p></div>
      ${reviewContext(step)}
      ${complete ? `<div class="lesson-complete"><span aria-hidden="true">✓</span><h2>Etapa concluída</h2><p>Você praticou os pontos principais deste slide.</p><button class="button primary" type="button" data-action="next-review">${stepIndex === 2 ? "Ir para o role-play" : "Próxima etapa"}</button></div>` : `
        <section class="question-block" aria-labelledby="practice-title">
          <p class="question-count">Prática ${practiceIndex + 1} de ${step.practiceQuestionIds.length}</p>
          <h2 id="practice-title" lang="en">${escapeHtml(question.prompt)}</h2>
          <div class="answers">${optionButtons(question, answer)}</div>
          ${feedback}
          ${answer == null ? "" : `<button class="button primary next-question" type="button" data-action="next-practice">${practiceIndex + 1 === step.practiceQuestionIds.length ? "Concluir etapa" : "Próxima pergunta"}</button>`}
        </section>`}
    </section>`,
  };
}

export function roleplayView(step) {
  return {
    type: "roleplay",
    html: `<section class="lesson roleplay-page">
      <button class="text-button" type="button" data-action="review-back">← Voltar</button>
      <div class="lesson-heading"><p class="kicker">Etapa 4 de 4 · Slide 5</p><h1>${escapeHtml(step.title)}</h1><p>${escapeHtml(step.introPt)}</p></div>
      <div class="roleplay-grid">
        ${step.content.situations.map((situation, index) => `<article class="role-card"><span>0${index + 1}</span><h2 lang="en">${escapeHtml(situation)}</h2><p>${index === 0 ? "Conheça alguém e descubra nome, origem e interesses." : "Descreva a pessoa ideal e pergunte sobre preferências."}</p></article>`).join("")}
      </div>
      <section class="phrase-bank"><p class="kicker">Frases para começar</p><h2>Use estas perguntas</h2><div>${step.content.starters.map((starter) => `<span lang="en">${escapeHtml(starter)}</span>`).join("")}</div></section>
      <section class="self-check"><h2>Checklist da conversa</h2>${step.content.checklistPt.map((item, index) => `<label><input type="checkbox"><span>${escapeHtml(item)}</span></label>`).join("")}</section>
      <button class="button primary" type="button" data-action="finish-review">Concluir revisão guiada</button>
    </section>`,
  };
}

export function quizView(question, index, total, answer, mode = "quiz") {
  const answered = answer != null;
  const correct = answered && answer === question.correctIndex;
  const label = mode === "mistakes" ? "Revisão de erros" : SKILLS[question.skill];
  return {
    type: mode,
    html: `<section class="quiz-page">
      <div class="question-meta"><span>${escapeHtml(label)}</span><span>${index + 1} de ${total}</span></div>
      <div class="question-card"><p class="kicker">Escolha a melhor resposta</p><h1 lang="en">${escapeHtml(question.prompt)}</h1></div>
      <div class="answers">${optionButtons(question, answer)}</div>
      ${answered ? `<div class="feedback ${correct ? "success" : "needs-work"}" role="status" tabindex="-1" data-feedback>
        <p class="feedback-title">${correct ? "Certo!" : "Ainda não. Vamos entender."}</p>
        <p lang="en"><strong>${escapeHtml(question.correctSentence)}</strong></p>
        <p>${escapeHtml(question.explanationPt)}</p>
        ${correct ? "" : `<p class="hint"><strong>Dica:</strong> ${escapeHtml(question.hintPt)}</p>`}
      </div><button class="button primary next-question" type="button" data-action="next-question">${index + 1 === total ? "Ver resultado" : "Próxima pergunta"}</button>` : `<p class="keyboard-tip">Dica: no teclado, use A, B, C ou D.</p>`}
    </section>`,
  };
}

export function emptyMistakesView() {
  return { type: "empty-mistakes", html: `<section class="centered celebration"><span class="celebration-mark" aria-hidden="true">✓</span><p class="kicker">Tudo certo</p><h1>Nenhum erro para revisar</h1><p>Você pode começar um novo simulado e continuar praticando.</p><button class="button primary" type="button" data-action="new-quiz">Começar simulado</button><button class="button ghost" type="button" data-action="go-home">Voltar ao início</button></section>` };
}

export function resultsView(results, recommendation, questionMap, answers, mode = "quiz") {
  const circumference = 289;
  const offset = circumference - (circumference * results.percentage) / 100;
  const mistakes = results.mistakeIds.map((id) => {
    const question = questionMap.get(id);
    return question ? `<article class="mistake-item"><p lang="en">${escapeHtml(question.prompt)}</p><small>Resposta correta</small><strong lang="en">${escapeHtml(question.correctSentence)}</strong><span>${escapeHtml(question.explanationPt)}</span></article>` : "";
  }).join("");
  return {
    type: "results",
    html: `<section class="results-page">
      <p class="kicker">${mode === "mistakes" ? "Revisão concluída" : "Seu resultado"}</p><h1>${results.percentage >= 80 ? "Mandou muito bem!" : results.percentage >= 60 ? "Bom caminho." : "Vamos reforçar a base."}</h1>
      <div class="score-layout">
        <div class="score-ring" style="--score-offset:${offset}"><svg viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="46"></circle><circle class="score-value" cx="55" cy="55" r="46"></circle></svg><div><strong>${results.percentage}%</strong><span>${results.correct}/${results.answered}</span></div></div>
        <div class="recommendation"><p class="kicker">Próximo foco</p><h2>${escapeHtml(recommendation.label)}</h2><p>${escapeHtml(recommendation.messagePt)}</p></div>
      </div>
      <section class="skill-results" aria-labelledby="skill-title"><h2 id="skill-title">Resultado por assunto</h2>${Object.entries(results.perSkill).map(([skill, score]) => `<div class="skill-row"><span>${escapeHtml(SKILLS[skill])}</span><div><i style="width:${score.percentage}%"></i></div><strong>${score.correct}/${score.total}</strong></div>`).join("")}</section>
      <div class="result-actions">${results.mistakeIds.length ? `<button class="button primary" type="button" data-action="retry-mistakes">Revisar ${results.mistakeIds.length} ${results.mistakeIds.length === 1 ? "erro" : "erros"}</button>` : ""}<button class="button secondary" type="button" data-action="new-quiz">Novo simulado</button><button class="button ghost" type="button" data-action="go-home">Voltar ao início</button></div>
      ${mistakes ? `<section class="mistakes-list"><p class="kicker">Revise com calma</p><h2>O que você errou</h2>${mistakes}</section>` : `<div class="perfect-note">Nenhum erro desta vez. Good luck on your test!</div>`}
    </section>`,
  };
}

export function renderScreen(root, viewModel) {
  root.innerHTML = viewModel.html;
  const on = (action, handler) => root.querySelector(`[data-action="${action}"]`)?.addEventListener("click", handler);
  return { on, focus: (selector = "h1") => root.querySelector(selector)?.focus?.() };
}

export { escapeHtml, SKILLS };

