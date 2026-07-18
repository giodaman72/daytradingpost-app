import { createHash } from "node:crypto";

function seeded(seed: string) {
  let state = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

export function deterministicShuffle<T>(values: readonly T[], seed: string) {
  const output = [...values];
  const random = seeded(seed);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
}

export function createAttemptOrdering(
  questionIds: string[],
  answerIds: Record<string, string[]>,
  seed: string,
  randomizeQuestions: boolean,
  randomizeAnswers: boolean,
) {
  const randomizedQuestionIds = randomizeQuestions
    ? deterministicShuffle(questionIds, `${seed}:questions`)
    : [...questionIds];
  const randomizedAnswerOrders = Object.fromEntries(
    Object.entries(answerIds).map(([questionId, ids]) => [
      questionId,
      randomizeAnswers
        ? deterministicShuffle(ids, `${seed}:answers:${questionId}`)
        : [...ids],
    ]),
  );
  return { randomizedAnswerOrders, randomizedQuestionIds };
}
