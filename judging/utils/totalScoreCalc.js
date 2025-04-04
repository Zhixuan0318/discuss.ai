export function totalScoreCalc(scores) {
    if (!Array.isArray(scores)) {
      throw new Error("Invalid input: scores should be an array.");
    }
  
    return scores.reduce((total, { score }) => {
      const [x] = score.split("/").map(Number);
      if (isNaN(x)) {
        throw new Error(`Invalid score format: ${score}`);
      }
      return total + x;
    }, 0);
  }
  