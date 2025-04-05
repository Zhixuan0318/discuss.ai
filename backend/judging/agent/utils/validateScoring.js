function validateScoring(scoring) {
    if (!Array.isArray(scoring)) {
      throw new Error("Invalid scoring data. Expected an array.");
    }
  
    const errors = []; // Collect all errors
  
    scoring.forEach((criteria, index) => {
      if (typeof criteria.criteria !== "string" || criteria.criteria.trim() === "") {
        errors.push(`Scoring item ${index + 1}: 'criteria' must be a non-empty string.`);
      }
  
      if (typeof criteria.criteriaDescription !== "string" || criteria.criteriaDescription.trim() === "") {
        errors.push(`Scoring item ${index + 1}: 'criteriaDescription' must be a non-empty string.`);
      }
  
      if (typeof criteria.weightage !== "number" || isNaN(criteria.weightage) || criteria.weightage < 0) {
        errors.push(`Scoring item ${index + 1}: 'weightage' must be a positive number.`);
      }
    });
  
    if (errors.length > 0) {
      throw new Error(errors.join(" | ")); // Combine errors into one message
    }
  
    return true; // Validation passed
  }
  
  export default validateScoring;
  