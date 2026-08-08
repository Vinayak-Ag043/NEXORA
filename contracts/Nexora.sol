// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Nexora
 * @dev Decentralized coordination layer for groups to manage proposals and votes on-chain.
 */
contract Nexora {
    // ==========================================
    // CONSTANTS & BOUNDS
    // ==========================================
    uint256 public constant MIN_PROPOSAL_DURATION = 5 minutes;
    uint256 public constant MAX_PROPOSAL_DURATION = 30 days;

    uint256 public constant MAX_NAME_LENGTH = 64;
    uint256 public constant MAX_GROUP_DESC_LENGTH = 512;
    uint256 public constant MAX_TITLE_LENGTH = 128;
    uint256 public constant MAX_PROP_DESC_LENGTH = 2048;

    // ==========================================
    // ENUMS & STRUCTS
    // ==========================================
    enum ProposalStatus {
        Active,
        Passed,
        Defeated
    }

    struct Group {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 createdAt;
        address[] members;
        mapping(address => bool) isMember;
    }

    struct Proposal {
        uint256 id;
        uint256 groupId;
        address creator;
        string title;
        string description;
        uint256 createdAt;
        uint256 deadline;
        uint256 yesCount;
        uint256 noCount;
        mapping(address => bool) hasVoted;
    }

    // View structs for external callers
    struct GroupDetails {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 createdAt;
        uint256 memberCount;
    }

    struct ProposalDetails {
        uint256 id;
        uint256 groupId;
        address creator;
        string title;
        string description;
        uint256 createdAt;
        uint256 deadline;
        uint256 yesCount;
        uint256 noCount;
        ProposalStatus status;
    }

    // ==========================================
    // CUSTOM ERRORS
    // ==========================================
    error GroupDoesNotExist();
    error ProposalDoesNotExist();
    error NotGroupMember();
    error AlreadyMember();
    error AlreadyVoted();
    error VotingEnded();
    error InvalidDuration();
    error InvalidInput();
    error StringTooLong();

    // ==========================================
    // STATE VARIABLES
    // ==========================================
    uint256 private _nextGroupId = 1;
    uint256 private _nextProposalId = 1;

    mapping(uint256 => Group) private _groups;
    mapping(uint256 => Proposal) private _proposals;
    mapping(uint256 => uint256[]) private _groupProposals;

    // ==========================================
    // EVENTS
    // ==========================================
    event GroupCreated(
        uint256 indexed groupId,
        string name,
        address indexed creator,
        uint256 timestamp
    );

    event MemberJoined(
        uint256 indexed groupId,
        address indexed member,
        uint256 timestamp
    );

    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed groupId,
        address indexed creator,
        string title,
        string description,
        uint256 deadline
    );

    event VoteCast(
        uint256 indexed proposalId,
        uint256 indexed groupId,
        address indexed voter,
        bool support,
        uint256 yesCount,
        uint256 noCount
    );

    // ==========================================
    // GROUP FUNCTIONS
    // ==========================================

    /**
     * @notice Creates a new coordination group.
     * @param name The name of the group.
     * @param description A brief overview of the group's purpose.
     * @return groupId The unique identifier of the newly created group.
     */
    function createGroup(
        string calldata name,
        string calldata description
    ) external returns (uint256 groupId) {
        if (bytes(name).length == 0) revert InvalidInput();
        if (bytes(name).length > MAX_NAME_LENGTH) revert StringTooLong();
        if (bytes(description).length > MAX_GROUP_DESC_LENGTH) revert StringTooLong();

        groupId = _nextGroupId++;

        Group storage newGroup = _groups[groupId];
        newGroup.id = groupId;
        newGroup.name = name;
        newGroup.description = description;
        newGroup.creator = msg.sender;
        newGroup.createdAt = block.timestamp;
        newGroup.members.push(msg.sender);
        newGroup.isMember[msg.sender] = true;

        emit GroupCreated(groupId, name, msg.sender, block.timestamp);
        emit MemberJoined(groupId, msg.sender, block.timestamp);
    }

    /**
     * @notice Allows an address to join an existing group.
     * @param groupId The ID of the group to join.
     */
    function joinGroup(uint256 groupId) external {
        if (groupId == 0 || groupId >= _nextGroupId) revert GroupDoesNotExist();

        Group storage group = _groups[groupId];
        if (group.isMember[msg.sender]) revert AlreadyMember();

        group.isMember[msg.sender] = true;
        group.members.push(msg.sender);

        emit MemberJoined(groupId, msg.sender, block.timestamp);
    }

    // ==========================================
    // PROPOSAL FUNCTIONS
    // ==========================================

    /**
     * @notice Creates a proposal within a group. Only group members can create proposals.
     * @param groupId The group where the proposal belongs.
     * @param title Proposal title.
     * @param description Proposal description or reference.
     * @param durationInSeconds Duration until voting deadline (5 min to 30 days).
     * @return proposalId The unique identifier of the newly created proposal.
     */
    function createProposal(
        uint256 groupId,
        string calldata title,
        string calldata description,
        uint256 durationInSeconds
    ) external returns (uint256 proposalId) {
        if (groupId == 0 || groupId >= _nextGroupId) revert GroupDoesNotExist();

        Group storage group = _groups[groupId];
        if (!group.isMember[msg.sender]) revert NotGroupMember();

        if (bytes(title).length == 0) revert InvalidInput();
        if (bytes(title).length > MAX_TITLE_LENGTH) revert StringTooLong();
        if (bytes(description).length > MAX_PROP_DESC_LENGTH) revert StringTooLong();

        if (durationInSeconds < MIN_PROPOSAL_DURATION || durationInSeconds > MAX_PROPOSAL_DURATION) {
            revert InvalidDuration();
        }

        proposalId = _nextProposalId++;
        uint256 deadline = block.timestamp + durationInSeconds;

        Proposal storage prop = _proposals[proposalId];
        prop.id = proposalId;
        prop.groupId = groupId;
        prop.creator = msg.sender;
        prop.title = title;
        prop.description = description;
        prop.createdAt = block.timestamp;
        prop.deadline = deadline;

        _groupProposals[groupId].push(proposalId);

        emit ProposalCreated(
            proposalId,
            groupId,
            msg.sender,
            title,
            description,
            deadline
        );
    }

    // ==========================================
    // VOTING FUNCTIONS
    // ==========================================

    /**
     * @notice Casts a vote on an active proposal.
     * @param proposalId The ID of the proposal.
     * @param support True for YES, False for NO.
     */
    function vote(uint256 proposalId, bool support) external {
        if (proposalId == 0 || proposalId >= _nextProposalId) revert ProposalDoesNotExist();

        Proposal storage prop = _proposals[proposalId];
        
        Group storage group = _groups[prop.groupId];
        if (!group.isMember[msg.sender]) revert NotGroupMember();

        if (block.timestamp > prop.deadline) revert VotingEnded();
        if (prop.hasVoted[msg.sender]) revert AlreadyVoted();

        prop.hasVoted[msg.sender] = true;

        if (support) {
            prop.yesCount++;
        } else {
            prop.noCount++;
        }

        emit VoteCast(
            proposalId,
            prop.groupId,
            msg.sender,
            support,
            prop.yesCount,
            prop.noCount
        );
    }

    // ==========================================
    // VIEW / READ-ONLY FUNCTIONS
    // ==========================================

    /**
     * @notice Checks if an address is a member of a group.
     */
    function isGroupMember(uint256 groupId, address account) external view returns (bool) {
        if (groupId == 0 || groupId >= _nextGroupId) revert GroupDoesNotExist();
        return _groups[groupId].isMember[account];
    }

    /**
     * @notice Gets details of a group.
     */
    function getGroup(uint256 groupId) external view returns (GroupDetails memory) {
        if (groupId == 0 || groupId >= _nextGroupId) revert GroupDoesNotExist();
        Group storage g = _groups[groupId];
        return GroupDetails({
            id: g.id,
            name: g.name,
            description: g.description,
            creator: g.creator,
            createdAt: g.createdAt,
            memberCount: g.members.length
        });
    }

    /**
     * @notice Returns list of all member addresses for a group.
     */
    function getGroupMembers(uint256 groupId) external view returns (address[] memory) {
        if (groupId == 0 || groupId >= _nextGroupId) revert GroupDoesNotExist();
        return _groups[groupId].members;
    }

    /**
     * @notice Returns total number of groups created.
     */
    function getGroupCount() external view returns (uint256) {
        return _nextGroupId - 1;
    }

    /**
     * @notice Gets details of a proposal.
     */
    function getProposal(uint256 proposalId) external view returns (ProposalDetails memory) {
        if (proposalId == 0 || proposalId >= _nextProposalId) revert ProposalDoesNotExist();
        Proposal storage p = _proposals[proposalId];
        return ProposalDetails({
            id: p.id,
            groupId: p.groupId,
            creator: p.creator,
            title: p.title,
            description: p.description,
            createdAt: p.createdAt,
            deadline: p.deadline,
            yesCount: p.yesCount,
            noCount: p.noCount,
            status: getProposalStatus(proposalId)
        });
    }

    /**
     * @notice Computes the current status of a proposal.
     */
    function getProposalStatus(uint256 proposalId) public view returns (ProposalStatus) {
        if (proposalId == 0 || proposalId >= _nextProposalId) revert ProposalDoesNotExist();
        Proposal storage p = _proposals[proposalId];

        if (block.timestamp <= p.deadline) {
            return ProposalStatus.Active;
        } else if (p.yesCount > p.noCount) {
            return ProposalStatus.Passed;
        } else {
            return ProposalStatus.Defeated;
        }
    }

    /**
     * @notice Checks whether an address has voted on a proposal.
     */
    function hasVoted(uint256 proposalId, address account) external view returns (bool) {
        if (proposalId == 0 || proposalId >= _nextProposalId) revert ProposalDoesNotExist();
        return _proposals[proposalId].hasVoted[account];
    }

    /**
     * @notice Returns all proposal IDs associated with a group.
     */
    function getGroupProposals(uint256 groupId) external view returns (uint256[] memory) {
        if (groupId == 0 || groupId >= _nextGroupId) revert GroupDoesNotExist();
        return _groupProposals[groupId];
    }

    /**
     * @notice Returns total number of proposals created across all groups.
     */
    function getProposalCount() external view returns (uint256) {
        return _nextProposalId - 1;
    }
}
