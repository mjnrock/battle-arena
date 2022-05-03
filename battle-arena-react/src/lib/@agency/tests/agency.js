import Agency from "../core/Agency";
import Agent from "../core/Agent";

const agency = new Agency();
console.log(agency.id);

const agent = new Agent();	// Create a shallow copy when an Agent is passed
console.log(agent.id);

console.log(agency === agent);