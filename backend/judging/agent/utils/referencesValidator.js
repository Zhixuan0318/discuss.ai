function validateReferences(references) {
    if (!Array.isArray(references)) {
      throw new Error("Invalid references structure. Expected an array of URLs.");
    }
  
    const errors = [];
  
    references.forEach((ref, index) => {
      if (typeof ref !== "string" || ref.trim() === "") {
        errors.push(`Reference item ${index + 1} must be a non-empty string.`);
      }
    });
  
    if (errors.length > 0) {
      throw new Error(errors.join(" | ")); // Combine all errors into one message
    }
  
    return true; // Validation passed
  }
  
  export default validateReferences;
  