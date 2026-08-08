export const nexoraAbi = [
  // Custom Errors
  "error GroupDoesNotExist()",
  "error ProposalDoesNotExist()",
  "error NotGroupMember()",
  "error AlreadyMember()",
  "error AlreadyVoted()",
  "error VotingEnded()",
  "error InvalidDuration()",
  "error InvalidInput()",
  "error StringTooLong()",

  // Events
  "event GroupCreated(uint256 indexed groupId, string name, address indexed creator, uint256 timestamp)",
  "event MemberJoined(uint256 indexed groupId, address indexed member, uint256 timestamp)",
  "event ProposalCreated(uint256 indexed proposalId, uint256 indexed groupId, address indexed creator, string title, string description, uint256 deadline)",
  "event VoteCast(uint256 indexed proposalId, uint256 indexed groupId, address indexed voter, bool support, uint256 yesCount, uint256 noCount)",

  // Read Functions
  "function getGroupCount() view returns (uint256)",
  "function getGroup(uint256 groupId) view returns (tuple(uint256 id, string name, string description, address creator, uint256 createdAt, uint256 memberCount))",
  "function getGroupMembers(uint256 groupId) view returns (address[])",
  "function isGroupMember(uint256 groupId, address account) view returns (bool)",
  "function getProposalCount() view returns (uint256)",
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, uint256 groupId, address creator, string title, string description, uint256 createdAt, uint256 deadline, uint256 yesCount, uint256 noCount, uint8 status))",
  "function getGroupProposals(uint256 groupId) view returns (uint256[])",
  "function getProposalStatus(uint256 proposalId) view returns (uint8)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  "function MIN_PROPOSAL_DURATION() view returns (uint256)",
  "function MAX_PROPOSAL_DURATION() view returns (uint256)",

  // Write Functions
  "function createGroup(string name, string description) returns (uint256)",
  "function joinGroup(uint256 groupId)",
  "function createProposal(uint256 groupId, string title, string description, uint256 durationInSeconds) returns (uint256)",
  "function vote(uint256 proposalId, bool support)"
];
