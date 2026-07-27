export function stripMarkup(value: string) {
  let result = "";
  let insideTag = false;

  for (const character of value) {
    if (character === "<") {
      insideTag = true;
      continue;
    }
    if (character === ">" && insideTag) {
      insideTag = false;
      continue;
    }
    if (!insideTag) result += character;
  }

  return result;
}
