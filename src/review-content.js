export const GUIDED_REVIEW = [
  {
    id: "jessie",
    title: "Jessie e as WH questions",
    introPt: "Complete perguntas sobre nome, idade, origem, nacionalidade e descrição.",
    sourceSlide: 2,
    practiceQuestionIds: ["wh-01", "wh-02", "wh-03", "wh-04", "wh-05"],
    content: {
      profile: { name: "Jessie", age: 26, country: "Japan", nationality: "Japanese" },
      notePt: "What pede informação, How old pede idade e Where pede lugar.",
    },
  },
  {
    id: "kyle",
    title: "Kyle e a ordem das perguntas",
    introPt: "Transforme as respostas de Kyle nas perguntas corretas.",
    sourceSlide: 3,
    practiceQuestionIds: ["profiles-05", "profiles-06", "profiles-07", "profiles-08", "profiles-09"],
    content: {
      profile: { name: "Kyle", age: 32, country: "Colombia", nationality: "Colombian" },
      appearance: "He is black. He has dark eyes, short afro-curly black hair and a beard.",
      notePt: "Em perguntas com o verbo to be, use WH word + is + subject.",
    },
  },
  {
    id: "dialogue",
    title: "O encontro de Jessie",
    introPt: "Use o contexto para escolher How, Why, Where, What e When.",
    sourceSlide: 4,
    practiceQuestionIds: ["wh-06", "wh-07", "wh-08", "dialogue-04", "wh-09", "wh-10"],
    content: {
      lines: [
        ["Friend", "Hi, Jessie. How are you?"],
        ["Jessie", "I am happy today."],
        ["Friend", "Why are you happy?"],
        ["Jessie", "Because I have a date!"],
        ["Friend", "Where is he from?"],
        ["Jessie", "I met him on Tinder. He’s from Colombia, but he lives here."],
        ["Friend", "What is his name?"],
        ["Jessie", "His name is Kyle. He is 32 years old."],
        ["Friend", "When is your date?"],
        ["Jessie", "It’s today, in the evening, at 7 p.m. at his favorite restaurant."],
        ["Friend", "What is his favorite type of food?"],
        ["Jessie", "It’s Italian food."],
      ],
    },
  },
  {
    id: "roleplay",
    title: "Role-play",
    introPt: "Escolha uma situação e pratique em voz alta com um colega.",
    sourceSlide: 5,
    practiceQuestionIds: [],
    content: {
      situations: ["Meeting a new friend online", "Talking to a friend about your perfect match"],
      starters: ["Hi! What’s your name?", "Where are you from?", "What are you like?", "What is your perfect match like?"],
      checklistPt: ["Cumprimente a pessoa", "Faça pelo menos três WH questions", "Dê respostas completas", "Encerre a conversa naturalmente"],
    },
  },
];

