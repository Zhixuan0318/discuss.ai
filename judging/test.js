import 'dotenv/config';
import judge from "./judge.js"

const testAgentID = 'sample_agent'; 
const submissionURL = "https://medium.com/@meric.emmanuel/things-only-senior-react-engineers-know-618d81154cb6";
const numberOfQueries = 3;

(async () => {
  try {
    const response = await judge(testAgentID, submissionURL, numberOfQueries);
    console.log(response);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
})();
