export default class User {
    constructor(intro, started, percentage, answers, question, unAnsweredQuestions) {
        this.intro = intro;
        this.started = started;
        this.percentage = percentage;
        this.answers = answers;
        this.question = question;
        this.unAnsweredQuestions = unAnsweredQuestions;
    }
}