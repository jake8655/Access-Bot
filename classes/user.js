export default class User {
    constructor(id, intro, started, percentage, answers, fail, timer, timeLeft) {
        this.id = id;
        this.intro = intro;
        this.started = started;
        this.percentage = percentage;
        this.answers = answers;
        this.fail = fail;
        this.timer = timer;
        this.timeLeft = timeLeft;
    }
}