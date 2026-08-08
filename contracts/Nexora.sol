// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Nexora - minimal wallet-based coordination groups and voting
contract Nexora {
    error GroupDoesNotExist(); error ProposalDoesNotExist(); error NotGroupMember(); error AlreadyMember(); error AlreadyVoted(); error VotingEnded(); error InvalidDuration(); error InvalidInput(); error StringTooLong();

    uint256 public constant MIN_VOTING_DURATION = 5 minutes;
    uint256 public constant MAX_VOTING_DURATION = 30 days;

    struct Group { uint256 id; string name; string description; address creator; uint256 createdAt; uint256 memberCount; }
    struct Proposal { uint256 id; uint256 groupId; address creator; string title; string description; uint256 createdAt; uint256 deadline; uint256 yesCount; uint256 noCount; }

    uint256 private groupCount; uint256 private proposalCount;
    mapping(uint256 => Group) private groups;
    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => address[]) private groupMembers;
    mapping(uint256 => mapping(address => bool)) private members;
    mapping(uint256 => uint256[]) private groupProposals;
    mapping(uint256 => mapping(address => bool)) private voted;

    event GroupCreated(uint256 indexed groupId, address indexed creator, string name, string description);
    event MemberJoined(uint256 indexed groupId, address indexed member);
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed groupId, address indexed creator, string title, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, uint256 indexed groupId, address indexed voter, bool support, uint256 yesCount, uint256 noCount);

    function createGroup(string calldata name, string calldata description) external {
        if (bytes(name).length == 0) revert InvalidInput();
        if (bytes(name).length > 64 || bytes(description).length > 512) revert StringTooLong();
        uint256 id = ++groupCount;
        groups[id] = Group(id, name, description, msg.sender, block.timestamp, 1);
        members[id][msg.sender] = true; groupMembers[id].push(msg.sender);
        emit GroupCreated(id, msg.sender, name, description); emit MemberJoined(id, msg.sender);
    }

    function joinGroup(uint256 groupId) external {
        _requireGroup(groupId); if (members[groupId][msg.sender]) revert AlreadyMember();
        members[groupId][msg.sender] = true; groupMembers[groupId].push(msg.sender); groups[groupId].memberCount++;
        emit MemberJoined(groupId, msg.sender);
    }

    function createProposal(uint256 groupId, string calldata title, string calldata description, uint256 durationInSeconds) external {
        _requireGroup(groupId); if (!members[groupId][msg.sender]) revert NotGroupMember();
        if (bytes(title).length == 0) revert InvalidInput();
        if (bytes(title).length > 128 || bytes(description).length > 2048) revert StringTooLong();
        if (durationInSeconds < MIN_VOTING_DURATION || durationInSeconds > MAX_VOTING_DURATION) revert InvalidDuration();
        uint256 id = ++proposalCount; uint256 deadline = block.timestamp + durationInSeconds;
        proposals[id] = Proposal(id, groupId, msg.sender, title, description, block.timestamp, deadline, 0, 0); groupProposals[groupId].push(id);
        emit ProposalCreated(id, groupId, msg.sender, title, description, deadline);
    }

    function vote(uint256 proposalId, bool support) external {
        _requireProposal(proposalId); Proposal storage proposal = proposals[proposalId];
        if (!members[proposal.groupId][msg.sender]) revert NotGroupMember(); if (block.timestamp > proposal.deadline) revert VotingEnded(); if (voted[proposalId][msg.sender]) revert AlreadyVoted();
        voted[proposalId][msg.sender] = true; if (support) proposal.yesCount++; else proposal.noCount++;
        emit VoteCast(proposalId, proposal.groupId, msg.sender, support, proposal.yesCount, proposal.noCount);
    }

    function getGroupCount() external view returns (uint256) { return groupCount; }
    function getGroup(uint256 groupId) external view returns (Group memory) { _requireGroup(groupId); return groups[groupId]; }
    function getGroupMembers(uint256 groupId) external view returns (address[] memory) { _requireGroup(groupId); return groupMembers[groupId]; }
    function isGroupMember(uint256 groupId, address account) external view returns (bool) { _requireGroup(groupId); return members[groupId][account]; }
    function getProposalCount() external view returns (uint256) { return proposalCount; }
    function getProposal(uint256 proposalId) external view returns (uint256 id,uint256 groupId,address creator,string memory title,string memory description,uint256 createdAt,uint256 deadline,uint256 yesCount,uint256 noCount,uint8 status) { _requireProposal(proposalId); Proposal memory p = proposals[proposalId]; return (p.id,p.groupId,p.creator,p.title,p.description,p.createdAt,p.deadline,p.yesCount,p.noCount,_status(p)); }
    function getGroupProposals(uint256 groupId) external view returns (uint256[] memory) { _requireGroup(groupId); return groupProposals[groupId]; }
    function getProposalStatus(uint256 proposalId) external view returns (uint8) { _requireProposal(proposalId); return _status(proposals[proposalId]); }
    function hasVoted(uint256 proposalId, address account) external view returns (bool) { _requireProposal(proposalId); return voted[proposalId][account]; }
    function _status(Proposal memory p) private view returns (uint8) { if (block.timestamp <= p.deadline) return 0; return p.yesCount > p.noCount ? 1 : 2; }
    function _requireGroup(uint256 id) private view { if (id == 0 || id > groupCount) revert GroupDoesNotExist(); }
    function _requireProposal(uint256 id) private view { if (id == 0 || id > proposalCount) revert ProposalDoesNotExist(); }
}
