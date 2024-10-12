import { IsValidGrid } from "./IsValidGrid";
import { GenerateAnswerKey } from "./GenerateAnswerKey";


const answerKey = GenerateAnswerKey();

for (let shuffleStep = 0; shuffleStep < 100; ++shuffleStep) {
  answerKey.shuffle();
}

postMessage(answerKey.clone().get());

console.log('Answer key is valid?', IsValidGrid(answerKey));
