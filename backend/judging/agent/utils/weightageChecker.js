function isWeightageValid(scoring) {
    if (!Array.isArray(scoring)) {
      throw new Error("Invalid scoring data. Expected an array.");
    }
  
    const totalWeightage = scoring.reduce((sum, criteria) => {
      if (typeof criteria.weightage !== "number" || isNaN(criteria.weightage) || criteria.weightage < 0) {
        throw new Error(`Invalid weightage value in scoring. Expected positive numbers.`);
      }
      return sum + criteria.weightage;
    }, 0);
  
    if (totalWeightage !== 100) {
      throw new Error(`Total weightage must be exactly 100%. Currently: ${totalWeightage}%`);
    }
  
    return true;
  }
  
  export default isWeightageValid;
  