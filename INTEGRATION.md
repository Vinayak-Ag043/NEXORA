# Nexora Frontend Integration

## Network

Ethereum Sepolia

Chain ID:
11155111

## Contract

Address:

0x1FCa8Bf17249aBd53672F6D0544bAE2dD1D3B75F

## ABI

Use:

NexoraABI.json

## Core Write Functions

createGroup(name, description)

joinGroup(groupId)

createProposal(
  groupId,
  title,
  description,
  durationInSeconds
)

vote(proposalId, support)

## Core Read Functions

getGroup(groupId)

getGroupMembers(groupId)

getGroupCount()

getProposal(proposalId)

getProposalStatus(proposalId)

getGroupProposals(groupId)

getProposalCount()

isGroupMember(groupId, account)

hasVoted(proposalId, account)

## Events

GroupCreated

MemberJoined

ProposalCreated

VoteCast