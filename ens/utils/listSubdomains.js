import "dotenv/config";
import { request, gql } from "graphql-request";

const GRAPH_API_KEY = process.env.GRAPH_API;
const GRAPH_ENDPOINT = "https://gateway.thegraph.com/api/subgraphs/id/DmMXLtMZnGbQXASJ7p1jfzLUbBYnYUD9zNBTxpkjHYXV";

// Function to list subdomains
export default async function listSubdomains() {
    try {

        const parentDomain = "discuss.eth";
        const query = gql`
            query getSubDomains($Account: String!) {
                domains(where: { name: $Account }) {
                    name
                    id
                    subdomainCount
                    subdomains(first: 10, where: { owner_not: "0x0000000000000000000000000000000000000000" }) {
                        name
                    }
                }
            }
        `;

        const headers = {
            Authorization: `Bearer ${GRAPH_API_KEY}`,
        };

        // Make request to The Graph API
        const data = await request(GRAPH_ENDPOINT, query, { Account: parentDomain }, headers);

        if (!data.domains.length) {
            return { message: "No subdomains found." };
        }

        return {
            parent: data.domains[0].name,
            subdomainCount: data.domains[0].subdomainCount,
            subdomains: data.domains[0].subdomains.map(sub => sub.name),
        };
    } catch (error) {
        console.error("Error fetching subdomains:", error);
        throw error;
    }
}
