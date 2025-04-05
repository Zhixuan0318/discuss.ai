<div align="center">
    <img src="https://github.com/user-attachments/assets/ce779596-3d29-4332-8276-96a76fab5b63" width=100>
    <h1>discuss.(a)nyth(i)ng</h1>
    <strong>The discussions for humans, led by intelligent AI agents.</strong>  
</div>

<br>

# TL;DR
Introducing “Agentic Discussions” - A novel gamified discussion-based content creation mode led by intelligent AI agents. A powerful way to amplify ideas across the multi-chain Web3 community.

# What is Discuss AI?
**Content creation is one of the most effective ways to “spread the words”**. In the Web3 space, we’ve witnessed the power of content firsthand—a content hackathon saw 2,700+ submissions, bringing massive exposure to the ecosystem. Imagine scaling that impact even further 🤯!

From project new features to industry developments, hot topics, and even Web3 memes—there’s always something to discuss. **But let’s be honest—traditional Web3 content hackathons can feel a bit boring.** We’re here to change that 💪!

We know agentic workflow is the latest trend (multiple AI agents collaborate to complete tasks). If they can work together, why not let a team of AI agents host a Web3 discussion? Inspired by most of the gamified on-chain AI agent experimental projects, we make it truly interactive and gamified: 

**“Let the AI Agents judge who wins🥇”** 

**Discuss.Anything is an AI-powered platform that allows anyone to effortlessly host multi-chain, discussion-based content hackathons or campaigns.** These discussions are led by a team of intelligent AI agents, and the best part—no technical skills or coding knowledge are required. We introduce a novel discussion mode called “Agentic Discussion” ****🤖, where AI agents take charge of hosting, judging, and rewarding participants.

Now, anyone can become a host and create their own team of AI agents, customizing them with unique lores, backgrounds, judging styles, expertise, and discussion topics. These AI agent teams are fully on-chain, meaning each one has an on-chain profile that is searchable and transparent. This allows anyone to view the agent team’s details, track their activity, and monitor the on-chain prize pools associated with each discussions.

When a discussion is created, a prize pool is automatically set up. The host only needs to fund the pool with USDC, and from there, the AI agents take over, ensuring a smooth and automated judging process. Each discussion is managed by a team of three AI agents, each with a specific role:

- **Judge Agent** 🤖🏆 – The main decision-maker, responsible for reviewing and scoring submissions based on predefined expectations, rules, and rubrics.
- **Planner Agent** 🤖📚 – Reads through submissions, finds relevant sources and knowledge, and assists the **Judge Agent** to ensure fair judgment without hallucination.
- **Rank & Reward Agent** 🤖💰 – Ranks all submissions and transfers the reward from the on-chain USDC prize pool to the winner’s wallet.

We design Discuss.Anything with multi-chain accessibility. Hosts can choose any blockchain to run their discussions, while participants from any chain can submit their content. The AI agents are equipped with cross-chain transfer capabilities, meaning they can automatically distribute rewards across different chains. For example, if a discussion is hosted on Ethereum Sepolia but the winner prefers their reward on Avalanche Fuji, the AI agents will handle the transfer seamlessly.

# How it's made?
1. **Circle’s CCTP V1, V2 (with hook), Basic Transfer:** This is the core of our application, enabling multi-chain functionality. The host selects the blockchain to connect to, and the agent team created by the host follows suit, setting up the prize pool on that blockchain (the source chain). Participants then choose their preferred blockchain for receiving rewards and submit their entries. During the reward distribution process, three scenarios are handled using different approaches: 
    - Chain A to Chain A – a basic transfer via the Circle API
    - Chain A to Chain B – a cross-chain transfer using Circle's CCTP V1
    - AVAX-FUJI to ETH-SEPOLIA – a cross-chain transfer utilizing CCTP V2 with hook data.
2. **Circle’s Developer Controlled Wallet:** Each agent team’s prize pool is essentially a Circle Developer Controlled Wallet, created during the host setup process. Agents can perform actions simply by using the wallet ID associated with the prize pool, allowing for seamless transactions. This approach provides greater control and simplifies the management of prize pools, ensuring efficiency and security (no private key handling).
3. **Circle’s Smart Contract Platform:** Since we are working with CCTP V2, which includes hook data during the burning process, we have implemented a simple NFT contract to demonstrate its functionality. This contract acts as the destination caller, triggering the `receiveMessage()` function on the destination chain. As part of this process, the winner is rewarded with a badge NFT. For convenience, we use the Circle Smart Contract platform to deploy and interact with the compiled contract. Currently, this setup only supports ETH-SEPOLIA as the destination chain.
4. **Circle’s SDK and API:** Our application is designed to utilize USDC as the prize pool reward, which is why we rely heavily on Circle’s stack. We use the Circle SDK to set up the client and extensively integrate Circle APIs to streamline development. These APIs power various functionalities, including wallet-related actions (primarily for developer-controlled wallets), account queries, transactions, and contract executions, enabling a seamless and efficient reward distribution process.
5. **Every agent deserves an ENS name (subdomain):** Our team has registered a parent ENS domain on Ethereum Sepolia, and during the creation of each agent team, we will create a subdomain under this parent domain. In our application, this subdomain serves as the agent team’s profile. After assigning a subdomain to an agent team, their background, lore, and avatar are used to set the text record of their profile. Additionally, the on-chain pool they access and control is set as the address record of their profile. By tapping into an agent team’s ENS profile, you can easily access all relevant information about the agent, including monitoring the funds in the prize pool. This creative setup adds an element of fun, as users interact with a digital character that has an on-chain identity.
6. **A discussion ONLY for human - with World ID:** For an AI-agent-led discussion, the main concern is the possibility of bot submissions—spamming multiple entries to increase the chances of winning or flooding the system. To prevent this, we require participants to verify themselves with World ID before their submissions are sent for evaluation by the agent team. As a result, World ID has become an easy-to-integrate yet efficient filter for ensuring legitimate human submissions.
7. **Special reward when submit via our World Mini App**: We built a simple portal on World Mini App, but it is limited to submissions only (you can’t create discussions here, at least for now). However, users can still participate in multichain discussions via World. Submissions from this Mini App will be marked as “World Submitted” and will receive a simple NFT badge on World Sepolia.
8. **Multi-agents pipeline with Langchain:** Our team chose Langchain as the framework to build the agentic workflow, which consists of four key processes: planning → judging → ranking → rewarding. Each process is seamlessly connected to create a smooth end-to-end discussion flow. We developed our own tools (utilizing Langchain's base tool) for all on-chain actions and integrated them into the relevant agents. Additionally, we use OpenAI’s GPT-3.5 Turbo, which supports function calling, making the entire system possible. To ensure deterministic outcomes, we implement structured outputs as a guardrail, along with condition checks.
9. **Embedding stored on Redis vector store:** A limitation of LLMs is that they sometimes lack knowledge of the latest topics in the Web3 space, leading to hallucinations (i.e., making wild guesses). To prevent this and maintain high-quality judgment, we allow hosts to submit references related to the discussion topic. These references are processed using OpenAI embedding models and sent to our backend system, where their embeddings are stored in a Redis vector store. This setup enables the planner agent to retrieve relevant content for the judge agent whenever needed, ensuring more accurate and informed decision-making.
