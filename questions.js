export default {
    questionTime: 120000, //? The time for each question (Milliseconds)
    success: 80, //? The percentage of questions the user has to answer correctly to get access to the server
    again: 300000, //? The time a user has to wait until they can try to complete the test again
    roleID: "889108480496128020", //? The ID of the role the bot gives to a user that has successfully completed the test
    banTime: 1800000, //? The time a user is banned after failing the test [number] times
    banFail: 3, //? If a user has failed the test for the [number] time they get temporarily banned
    
    questions: [
        { question: "Are you 1?", answers: [ "Yes", "No" ], correct: 1 },
        { question: "Are you 2?", answers: [ "Oke", "No" ], correct: 2 },
        { question: "Are you 3?", answers: [ "Maybe", "Probably", "Definitely" ], correct: 3 }
    ]
}