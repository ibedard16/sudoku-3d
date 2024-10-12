import { IsValidGrid } from "./IsValidGrid";
import { GenerateAnswerKey } from "./GenerateAnswerKey";
import { GeneratePuzzleFromAnswerKey } from "./GeneratePuzzleFromAnswerKey";


const answerKey = GenerateAnswerKey();
postMessage(answerKey.clone().get());

const puzzle = GeneratePuzzleFromAnswerKey(answerKey);
setTimeout(() => postMessage(puzzle.clone().get()), 1000);

console.log('Answer key is valid?', IsValidGrid(answerKey));
