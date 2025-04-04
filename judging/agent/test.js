import validateReferences from "./utils/referencesValidator.js";

// ✅ Valid references (should return true)
const validReferences = [
  "https://example.com/resource1",
  "https://example.com/resource2"
];

// ❌ Invalid references (should throw an error)
const invalidReferences = [
  "https://example.com/resource1",
  "", // ❌ Empty string
  123 // ❌ Not a string
];

try {
  console.log("Valid References Check:", validateReferences(validReferences)); // Expected: true
} catch (error) {
  console.error("Error:", error.message);
}

try {
  console.log("Invalid References Check:", validateReferences(invalidReferences)); // Expected: Error
} catch (error) {
  console.error("Error:", error.message);
}
