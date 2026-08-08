// Derived from the Nexora frontend-integration handoff. Replace with artifact ABI when available.
export const nexoraAbi = [
  'function getGroupCount() view returns (uint256)',
  'function getGroup(uint256) view returns (uint256 id, string name, string description, address creator, uint256 createdAt, uint256 memberCount)',
  'function getGroupMembers(uint256) view returns (address[])',
  'function isGroupMember(uint256,address) view returns (bool)',
  'function getProposalCount() view returns (uint256)',
  'function getProposal(uint256) view returns (uint256 id, uint256 groupId, address creator, string title, string description, uint256 createdAt, uint256 deadline, uint256 yesCount, uint256 noCount, uint8 status)',
  'function getGroupProposals(uint256) view returns (uint256[])', 'function getProposalStatus(uint256) view returns (uint8)', 'function hasVoted(uint256,address) view returns (bool)',
  'function createGroup(string name,string description)', 'function joinGroup(uint256 groupId)', 'function createProposal(uint256 groupId,string title,string description,uint256 durationInSeconds)', 'function vote(uint256 proposalId,bool support)',
];
