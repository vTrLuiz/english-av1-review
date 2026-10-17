# English AV1 Review

Uma revisão interativa de inglês A1 para estudar os conteúdos da AV1 no celular ou no computador.

O projeto usa como referência os cinco slides de **Review 1** e trabalha especialmente:

- Jessie e Kyle;
- WH questions: `What`, `Where`, `When`, `Why` e `How`;
- idade, origem, nacionalidade e aparência;
- o diálogo sobre o encontro de Jessie;
- preparação para role-play.

## Como estudar

### Revisão guiada

Percorra os slides em ordem, relembre a regra e responda exercícios curtos com explicações em português.

### Simulado AV1

Responda 20 questões equilibradas entre WH questions, perfis, diálogo e gramática. Ao final, veja o resultado por assunto e uma recomendação de estudo.

### Revisar meus erros

O navegador salva localmente as questões erradas. Quando você acertar uma delas na revisão, ela sai da lista de pendências.

## Abrir localmente

O site não precisa de instalação nem de build. Com Node.js 20 ou mais recente:

```bash
npm run serve
```

Abra `http://127.0.0.1:4173`.

Para conferir a estrutura do conteúdo:

```bash
npm run check
```

## Estrutura

```text
index.html              Estrutura principal
styles.css              Visual responsivo e acessível
src/questions.js        Banco de 40 questões
src/review-content.js   Revisão guiada dos slides
src/quiz-engine.js      Seleção, correção e resultados
src/storage.js          Progresso salvo no navegador
src/router.js           Navegação entre telas
src/views.js            Telas e componentes
src/app.js              Estado e interações
```

## Acessibilidade e privacidade

O quiz funciona com teclado, oferece foco visível, mensagens para leitores de tela, áreas de toque amplas e suporte a movimento reduzido. Nenhuma conta, analytics ou dado pessoal é coletado. O progresso fica somente no navegador.

## Publicação

O workflow em `.github/workflows/pages.yml` publica automaticamente o conteúdo da branch `main` no GitHub Pages.

## Aviso

Este é um material de estudo independente baseado na revisão fornecida pelo usuário. Não é uma publicação oficial do Sesc e não utiliza sua marca ou logotipo.

## Licença

MIT. Consulte [LICENSE](LICENSE).
