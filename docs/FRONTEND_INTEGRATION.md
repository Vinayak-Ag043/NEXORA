# Nexora Smart Contract - Complete Frontend Developer Guide

This document contains everything the frontend engineer needs to connect a Web3 frontend (Next.js, Vite + React, Wagmi/Viem, or Ethers.js) to the **Nexora** smart contract.

---

## 1. Project Folder Structure

### Current Backend Repository Structure (`NEXORA`)
```text
NEXORA/
├── contracts/
│   └── Nexora.sol                # Solidity Smart Contract (Source of truth)
├── test/
│   └── Nexora.test.js            # Hardhat test suite (16/16 passing)
├── scripts/
│   └── deploy.js                 # Deployment script for local node / testnets
├── docs/
│   └── FRONTEND_INTEGRATION.md   # This frontend guide
├── artifacts/
│   └── contracts/
│       └── Nexora.sol/
│           └── Nexora.json       # ABI & Bytecode compiled artifact
├── hardhat.config.js             # Hardhat network & compiler configuration
└── package.json                  # Dependencies & npm scripts
```

### Recommended Frontend Folder Structure (If integrated in app or monorepo)
```text
frontend/
├── src/
│   ├── config/
│   │   ├── wagmi.ts              # Wagmi / RainbowKit / Viem client config
│   │   └── contract.ts           # Contract address and imported Nexora ABI
│   ├── abi/
│   │   └── Nexora.json           # Copied from artifacts/contracts/Nexora.sol/Nexora.json
│   ├── hooks/
│   │   ├── useNexoraGroups.ts    # Custom hook: createGroup, joinGroup, fetch groups
│   │   ├── useNexoraProposals.ts # Custom hook: createProposal, fetch proposal, status
│   │   └── useNexoraVote.ts      # Custom hook: vote YES/NO, check hasVoted
│   ├── components/
│   │   ├── Navbar.tsx            # Connect Wallet button
│   │   ├── GroupCard.tsx         # Group list item with Join / View action
│   │   ├── CreateGroupModal.tsx  # Form modal for name & description
│   │   ├── ProposalCard.tsx      # Proposal card with countdown & vote counts
│   │   ├── CreateProposalModal.tsx # Form modal for title, desc, duration
│   │   └── VoteButtons.tsx       # YES / NO action buttons with state validation
│   └── types/
│       └── nexora.ts             # TypeScript interfaces for Group, Proposal, Status
```

---

## 2. Local Development & Testing Workflow

### Step 1: Start Local Ethereum Node
In the contract root directory, run:
```bash
npx hardhat node
```
*This starts a local JSON-RPC server at `http://127.0.0.1:8545/` with 20 pre-funded test accounts (10,000 ETH each).*

### Step 2: Deploy Contract to Local Node
In a second terminal window, run:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Output:
```text
Nexora smart contract successfully deployed!
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```
*Copy this Contract Address into your frontend configuration.*

---

## 3. ABI Location & Imports

The compiled ABI is located at:
`artifacts/contracts/Nexora.sol/Nexora.json`

Import it directly into your TypeScript / Web3 project:
```typescript
import NexoraABI from '../abi/Nexora.json';

export const NEXORA_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost deployment
export const NEXORA_ABI = NexoraABI.abi;
```

---

## 4. TypeScript Interfaces & Data Models

```typescript
// Proposal Status Enum
export enum ProposalStatus {
  Active = 0,   // Voting is ongoing (block.timestamp <= deadline)
  Passed = 1,   // Voting ended and YES votes > NO votes
  Defeated = 2  // Voting ended and NO votes >= YES votes (or tie)
}

// Group Details Struct
export interface GroupDetails {
  id: bigint;
  name: string;
  description: string;
  creator: string; // EVM Wallet Address (0x...)
  createdAt: bigint; // Unix timestamp in seconds
  memberCount: bigint;
}

// Proposal Details Struct
export interface ProposalDetails {
  id: bigint;
  groupId: bigint;
  creator: string; // EVM Wallet Address (0x...)
  title: string;
  description: string;
  createdAt: bigint; // Unix timestamp in seconds
  deadline: bigint; // Unix timestamp in seconds
  yesCount: bigint;
  noCount: bigint;
  status: ProposalStatus;
}
```

---

## 5. Contract API Functions

### Read Functions (Free / Non-transaction)

| Function | Parameters | Return Type | Description |
|---|---|---|---|
| `getGroupCount()` | None | `bigint` | Returns total number of groups created. |
| `getGroup(groupId)` | `groupId: bigint` | `GroupDetails` | Returns group metadata and member count. |
| `getGroupMembers(groupId)` | `groupId: bigint` | `string[]` | Returns array of all member wallet addresses. |
| `isGroupMember(groupId, account)` | `groupId: bigint, account: string` | `boolean` | Checks if account is a member of the group. |
| `getProposalCount()` | None | `bigint` | Returns total number of proposals created. |
| `getProposal(proposalId)` | `proposalId: bigint` | `ProposalDetails` | Returns proposal metadata, votes, and status. |
| `getGroupProposals(groupId)` | `groupId: bigint` | `bigint[]` | Returns list of proposal IDs belonging to group. |
| `getProposalStatus(proposalId)` | `proposalId: bigint` | `number` (0, 1, or 2) | Computes current live status. |
| `hasVoted(proposalId, account)` | `proposalId: bigint, account: string` | `boolean` | Checks if account has voted on proposal. |

---

### Write Functions (Transactions requiring gas)

#### 1. `createGroup(name: string, description: string)`
- **Validation Constraints**:
  - `name`: Non-empty string, maximum 64 characters.
  - `description`: Maximum 512 characters.
- **Behavior**: Creates group; caller (`msg.sender`) automatically becomes first member.
- **Emits**: `GroupCreated`, `MemberJoined`.

#### 2. `joinGroup(groupId: bigint)`
- **Validation Constraints**:
  - `groupId` must exist.
  - Caller must NOT already be a member (`AlreadyMember` custom error).
- **Behavior**: Adds caller address to group's member list.
- **Emits**: `MemberJoined`.

#### 3. `createProposal(groupId: bigint, title: string, description: string, durationInSeconds: bigint)`
- **Validation Constraints**:
  - Caller MUST be a group member (`NotGroupMember`).
  - `title`: Non-empty, maximum 128 characters.
  - `description`: Maximum 2048 characters.
  - `durationInSeconds`: **Minimum 300 seconds (5 mins)**, **Maximum 2,592,000 seconds (30 days)**.
- **Emits**: `ProposalCreated`.

#### 4. `vote(proposalId: bigint, support: boolean)`
- **Validation Constraints**:
  - Caller MUST be a group member (`NotGroupMember`).
  - Proposal deadline must not have passed (`VotingEnded`).
  - Caller must not have voted on this proposal before (`AlreadyVoted`).
- **Parameters**: `support = true` for YES, `support = false` for NO.
- **Emits**: `VoteCast`.

---

## 6. Custom Errors for Frontend UI Alerts

When a contract call fails, the RPC returns a custom error name. You can catch these in your frontend write handler:

```typescript
// Custom Errors
- GroupDoesNotExist()     // Invalid groupId
- ProposalDoesNotExist()  // Invalid proposalId
- NotGroupMember()        // User must join group first before creating proposal/voting
- AlreadyMember()         // User is already a member of this group
- AlreadyVoted()          // User already voted on this proposal
- VotingEnded()           // Voting deadline has passed
- InvalidDuration()       // Duration < 5 minutes or > 30 days
- InvalidInput()          // Title or Name is empty
- StringTooLong()         // Exceeded string length limits
```

---

## 7. Code Examples for Frontend (Ethers.js v6 / Wagmi)

### Example 1: Connecting to Contract (Ethers.js v6)
```typescript
import { ethers } from 'ethers';
import NexoraABI from './Nexora.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function getNexoraContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, NexoraABI.abi, signerOrProvider);
}
```

### Example 2: Fetching All Groups & Memberships
```typescript
export async function fetchAllGroups(provider, userAddress?: string) {
  const contract = await getNexoraContract(provider);
  const totalGroups = await contract.getGroupCount();
  
  const groups = [];
  for (let i = 1n; i <= totalGroups; i++) {
    const group = await contract.getGroup(i);
    let isMember = false;
    if (userAddress) {
      isMember = await contract.isGroupMember(i, userAddress);
    }
    groups.push({
      id: Number(group.id),
      name: group.name,
      description: group.description,
      creator: group.creator,
      createdAt: Number(group.createdAt),
      memberCount: Number(group.memberCount),
      isMember
    });
  }
  return groups;
}
```

### Example 3: Creating a Group
```typescript
export async function createGroup(signer, name: string, description: string) {
  const contract = await getNexoraContract(signer);
  const tx = await contract.createGroup(name, description);
  const receipt = await tx.wait();
  console.log("Group created in block:", receipt.blockNumber);
  return receipt;
}
```

### Example 4: Voting on a Proposal
```typescript
export async function voteOnProposal(signer, proposalId: number, support: boolean) {
  try {
    const contract = await getNexoraContract(signer);
    const tx = await contract.vote(proposalId, support);
    const receipt = await tx.wait();
    console.log("Vote submitted!", receipt);
    return receipt;
  } catch (error: any) {
    if (error.message.includes("NotGroupMember")) {
      alert("You must join this group before voting!");
    } else if (error.message.includes("AlreadyVoted")) {
      alert("You have already voted on this proposal.");
    } else if (error.message.includes("VotingEnded")) {
      alert("Voting deadline has passed.");
    } else {
      alert("Transaction failed: " + error.message);
    }
  }
}
```

### Example 5: Real-time Event Provenance Listening
```typescript
export function subscribeToNexoraEvents(provider, onVoteCast, onProposalCreated) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, NexoraABI.abi, provider);

  // Listen for VoteCast events
  contract.on("VoteCast", (proposalId, groupId, voter, support, yesCount, noCount, event) => {
    onVoteCast({
      proposalId: Number(proposalId),
      groupId: Number(groupId),
      voter,
      support,
      yesCount: Number(yesCount),
      noCount: Number(noCount)
    });
  });

  // Listen for ProposalCreated events
  contract.on("ProposalCreated", (proposalId, groupId, creator, title, description, deadline) => {
    onProposalCreated({
      proposalId: Number(proposalId),
      groupId: Number(groupId),
      creator,
      title,
      description,
      deadline: Number(deadline)
    });
  });
}
```
