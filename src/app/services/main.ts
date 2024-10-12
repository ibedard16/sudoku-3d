import { IsValidGrid } from "./IsValidGrid";
import { GenerateAnswerKey } from "./GenerateAnswerKey";


const answerKey = GenerateAnswerKey();

postMessage(answerKey.clone().get());

console.log('Answer key is valid?', IsValidGrid(answerKey));
