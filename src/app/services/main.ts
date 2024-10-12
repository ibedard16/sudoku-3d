import { IsValidGrid } from "./IsValidGrid";
import { GenerateAnswerKey } from "./GenerateAnswerKey";


const answerKey = GenerateAnswerKey();

for (let shuffleStep = 0; shuffleStep < 100; ++shuffleStep) {
  answerKey.shuffle();
}

answerKey.swapColumnPlane(0, 1);
setTimeout(() => postMessage(answerKey.clone().get()), 1000);

console.log('Answer key is valid?', IsValidGrid(answerKey));
