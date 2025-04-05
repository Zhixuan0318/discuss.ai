// import createSubdomain from "./utils/createSubdomain.js";
// import setRecord from "./utils/setRecord.js";

// await createSubdomain("sarah-x", "agent_0d035ed9-f1d7-4763-b766-787c185b25d8");
// await setRecord("agent_0d035ed9-f1d7-4763-b766-787c185b25d8");

import listSubdomains from "./utils/listSubdomains.js";

const res = await listSubdomains();

console.log(res);