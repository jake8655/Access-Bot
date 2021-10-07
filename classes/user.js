export default class User {
    constructor(intro, started, percentage, answers, question, unAnsweredQuestions) {
        this.intro = intro;
        this.started = started;
        this.percentage = percentage;
        this.answers = answers;
        this.timer = timer;
        this.timeLeft = timeLeft;
        this.question = question;
        this.unAnsweredQuestions = unAnsweredQuestions;
    }
}