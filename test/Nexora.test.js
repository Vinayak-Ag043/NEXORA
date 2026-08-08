const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Nexora Smart Contract", function () {
  let nexora;
  let owner, addr1, addr2, addr3, nonMember;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, nonMember] = await ethers.getSigners();
    const NexoraFactory = await ethers.getContractFactory("Nexora");
    nexora = await NexoraFactory.deploy();
  });

  describe("Group Management", function () {
    it("Should create a group and emit events", async function () {
      const tx = await nexora.createGroup("Alpha Group", "First decentralized group");
      
      await expect(tx)
        .to.emit(nexora, "GroupCreated")
        .withArgs(1, "Alpha Group", owner.address, anyValue);

      await expect(tx)
        .to.emit(nexora, "MemberJoined")
        .withArgs(1, owner.address, anyValue);

      expect(await nexora.getGroupCount()).to.equal(1);
      expect(await nexora.isGroupMember(1, owner.address)).to.be.true;

      const group = await nexora.getGroup(1);
      expect(group.id).to.equal(1);
      expect(group.name).to.equal("Alpha Group");
      expect(group.description).to.equal("First decentralized group");
      expect(group.creator).to.equal(owner.address);
      expect(group.memberCount).to.equal(1);
    });

    it("Should revert createGroup with invalid inputs or long strings", async function () {
      await expect(nexora.createGroup("", "Desc"))
        .to.be.revertedWithCustomError(nexora, "InvalidInput");

      const longName = "A".repeat(65);
      await expect(nexora.createGroup(longName, "Desc"))
        .to.be.revertedWithCustomError(nexora, "StringTooLong");

      const longDesc = "D".repeat(513);
      await expect(nexora.createGroup("Name", longDesc))
        .to.be.revertedWithCustomError(nexora, "StringTooLong");
    });

    it("Should allow accounts to join a group", async function () {
      await nexora.createGroup("Beta Group", "Second group");

      await expect(nexora.connect(addr1).joinGroup(1))
        .to.emit(nexora, "MemberJoined")
        .withArgs(1, addr1.address, anyValue);

      expect(await nexora.isGroupMember(1, addr1.address)).to.be.true;

      const members = await nexora.getGroupMembers(1);
      expect(members).to.deep.equal([owner.address, addr1.address]);
    });

    it("Should revert joinGroup for invalid group or duplicate member", async function () {
      await expect(nexora.joinGroup(999))
        .to.be.revertedWithCustomError(nexora, "GroupDoesNotExist");

      await nexora.createGroup("Gamma Group", "Third group");
      await expect(nexora.joinGroup(1))
        .to.be.revertedWithCustomError(nexora, "AlreadyMember");
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await nexora.createGroup("Dev Guild", "Ethereum Builders");
      await nexora.connect(addr1).joinGroup(1);
    });

    it("Should allow group member to create a proposal", async function () {
      const duration = 3600; // 1 hour
      const tx = await nexora.createProposal(1, "Fund Hackathon", "Allocate 1 ETH for prizes", duration);

      await expect(tx)
        .to.emit(nexora, "ProposalCreated")
        .withArgs(1, 1, owner.address, "Fund Hackathon", "Allocate 1 ETH for prizes", anyValue);

      expect(await nexora.getProposalCount()).to.equal(1);

      const proposal = await nexora.getProposal(1);
      expect(proposal.id).to.equal(1);
      expect(proposal.groupId).to.equal(1);
      expect(proposal.creator).to.equal(owner.address);
      expect(proposal.title).to.equal("Fund Hackathon");
      expect(proposal.status).to.equal(0); // ProposalStatus.Active

      const groupProps = await nexora.getGroupProposals(1);
      expect(groupProps.map((id) => Number(id))).to.deep.equal([1]);
    });

    it("Should revert createProposal for non-members", async function () {
      await expect(
        nexora.connect(nonMember).createProposal(1, "Title", "Desc", 3600)
      ).to.be.revertedWithCustomError(nexora, "NotGroupMember");
    });

    it("Should revert createProposal for invalid duration (< 5 mins or > 30 days)", async function () {
      // Less than 5 mins (299s)
      await expect(
        nexora.createProposal(1, "Title", "Desc", 299)
      ).to.be.revertedWithCustomError(nexora, "InvalidDuration");

      // More than 30 days (2,592,001s)
      await expect(
        nexora.createProposal(1, "Title", "Desc", 30 * 24 * 3600 + 1)
      ).to.be.revertedWithCustomError(nexora, "InvalidDuration");
    });

    it("Should revert createProposal for empty title or string over limits", async function () {
      await expect(
        nexora.createProposal(1, "", "Desc", 3600)
      ).to.be.revertedWithCustomError(nexora, "InvalidInput");

      const longTitle = "T".repeat(129);
      await expect(
        nexora.createProposal(1, longTitle, "Desc", 3600)
      ).to.be.revertedWithCustomError(nexora, "StringTooLong");

      const longDesc = "D".repeat(2049);
      await expect(
        nexora.createProposal(1, "Title", longDesc, 3600)
      ).to.be.revertedWithCustomError(nexora, "StringTooLong");
    });
  });

  describe("Voting & Provenance", function () {
    beforeEach(async function () {
      await nexora.createGroup("DAO Alliance", "Cross-chain governance");
      await nexora.connect(addr1).joinGroup(1);
      await nexora.connect(addr2).joinGroup(1);
      await nexora.connect(addr3).joinGroup(1);

      // Create proposal with 1 hour duration
      await nexora.createProposal(1, "Grant Approval", "Approve developer grant", 3600);
    });

    it("Should cast YES and NO votes and update counts", async function () {
      await expect(nexora.vote(1, true))
        .to.emit(nexora, "VoteCast")
        .withArgs(1, 1, owner.address, true, 1, 0);

      await expect(nexora.connect(addr1).vote(1, true))
        .to.emit(nexora, "VoteCast")
        .withArgs(1, 1, addr1.address, true, 2, 0);

      await expect(nexora.connect(addr2).vote(1, false))
        .to.emit(nexora, "VoteCast")
        .withArgs(1, 1, addr2.address, false, 2, 1);

      expect(await nexora.hasVoted(1, owner.address)).to.be.true;
      expect(await nexora.hasVoted(1, addr3.address)).to.be.false;

      const prop = await nexora.getProposal(1);
      expect(prop.yesCount).to.equal(2);
      expect(prop.noCount).to.equal(1);
    });

    it("Should prevent duplicate voting", async function () {
      await nexora.vote(1, true);
      await expect(nexora.vote(1, true)).to.be.revertedWithCustomError(
        nexora,
        "AlreadyVoted"
      );
    });

    it("Should prevent non-group-members from voting", async function () {
      await expect(
        nexora.connect(nonMember).vote(1, true)
      ).to.be.revertedWithCustomError(nexora, "NotGroupMember");
    });

    it("Should reject votes cast after the deadline", async function () {
      // Advance time by 3601 seconds
      await time.increase(3601);

      await expect(nexora.vote(1, true)).to.be.revertedWithCustomError(
        nexora,
        "VotingEnded"
      );
    });
  });

  describe("Proposal Status Derivation", function () {
    beforeEach(async function () {
      await nexora.createGroup("Status Guild", "Testing proposal statuses");
      await nexora.connect(addr1).joinGroup(1);
      await nexora.connect(addr2).joinGroup(1);
      await nexora.connect(addr3).joinGroup(1);
    });

    it("Should evaluate status as Active before deadline", async function () {
      await nexora.createProposal(1, "Prop 1", "Desc", 3600);
      expect(await nexora.getProposalStatus(1)).to.equal(0); // Active
    });

    it("Should evaluate status as Passed when YES > NO after deadline", async function () {
      await nexora.createProposal(1, "Prop 2", "Desc", 3600);
      await nexora.vote(1, true);
      await nexora.connect(addr1).vote(1, true);
      await nexora.connect(addr2).vote(1, false);

      await time.increase(3601);
      expect(await nexora.getProposalStatus(1)).to.equal(1); // Passed
    });

    it("Should evaluate status as Defeated when NO >= YES after deadline", async function () {
      await nexora.createProposal(1, "Prop 3", "Desc", 3600);
      await nexora.vote(1, false);
      await nexora.connect(addr1).vote(1, false);
      await nexora.connect(addr2).vote(1, true);

      await time.increase(3601);
      expect(await nexora.getProposalStatus(1)).to.equal(2); // Defeated
    });

    it("Should evaluate status as Defeated when tie (YES == NO) after deadline", async function () {
      await nexora.createProposal(1, "Prop 4", "Desc", 3600);
      await nexora.vote(1, true);
      await nexora.connect(addr1).vote(1, false);

      await time.increase(3601);
      expect(await nexora.getProposalStatus(1)).to.equal(2); // Defeated
    });
  });
});
