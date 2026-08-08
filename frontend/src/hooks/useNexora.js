import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { nexoraAbi } from "../contracts/nexoraAbi";

export function useNexora() {
  const { account, provider, signer, contractAddress } = useWallet();

  const [groups, setGroups] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get contract instance
  const getContract = useCallback((withSigner = false) => {
    if (!contractAddress) return null;
    if (withSigner && signer) {
      return new ethers.Contract(contractAddress, nexoraAbi, signer);
    }
    if (provider) {
      return new ethers.Contract(contractAddress, nexoraAbi, provider);
    }
    // Fallback to default RPC if no provider connected
    const defaultRpc = "https://ethereum-sepolia-rpc.publicnode.com";
    const readProvider = new ethers.JsonRpcProvider(defaultRpc);
    return new ethers.Contract(contractAddress, nexoraAbi, readProvider);
  }, [contractAddress, provider, signer]);

  // Fetch all groups and membership details
  const fetchGroups = useCallback(async () => {
    try {
      const contract = getContract();
      if (!contract) return;

      const groupCount = await contract.getGroupCount();
      const count = Number(groupCount);

      const fetchedGroups = [];
      for (let i = 1; i <= count; i++) {
        const groupData = await contract.getGroup(i);
        const members = await contract.getGroupMembers(i);

        let isMember = false;
        if (account) {
          isMember = await contract.isGroupMember(i, account);
        }

        fetchedGroups.push({
          id: Number(groupData.id),
          name: groupData.name,
          description: groupData.description,
          creator: groupData.creator,
          createdAt: Number(groupData.createdAt),
          memberCount: Number(groupData.memberCount),
          members: members,
          isMember: isMember,
        });
      }

      setGroups(fetchedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  }, [getContract, account]);

  // Fetch all proposals
  const fetchProposals = useCallback(async () => {
    try {
      const contract = getContract();
      if (!contract) return;

      const proposalCount = await contract.getProposalCount();
      const count = Number(proposalCount);

      const fetchedProposals = [];
      for (let i = 1; i <= count; i++) {
        const p = await contract.getProposal(i);

        let userHasVoted = false;
        if (account) {
          userHasVoted = await contract.hasVoted(i, account);
        }

        fetchedProposals.push({
          id: Number(p.id),
          groupId: Number(p.groupId),
          creator: p.creator,
          title: p.title,
          description: p.description,
          createdAt: Number(p.createdAt),
          deadline: Number(p.deadline),
          yesCount: Number(p.yesCount),
          noCount: Number(p.noCount),
          status: Number(p.status), // 0: Active, 1: Passed, 2: Defeated
          userHasVoted,
        });
      }

      setProposals(fetchedProposals);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  }, [getContract, account]);

  // Fetch historical events for verifiable provenance
  const fetchEvents = useCallback(async () => {
    try {
      const contract = getContract();
      if (!contract) return;

      const filterGroupCreated = contract.filters.GroupCreated();
      const filterMemberJoined = contract.filters.MemberJoined();
      const filterProposalCreated = contract.filters.ProposalCreated();
      const filterVoteCast = contract.filters.VoteCast();

      const [groupEvents, memberEvents, proposalEvents, voteEvents] = await Promise.all([
        contract.queryFilter(filterGroupCreated, -5000),
        contract.queryFilter(filterMemberJoined, -5000),
        contract.queryFilter(filterProposalCreated, -5000),
        contract.queryFilter(filterVoteCast, -5000),
      ]);

      const formattedEvents = [];

      groupEvents.forEach((e) => {
        formattedEvents.push({
          type: "GroupCreated",
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          groupId: Number(e.args[0]),
          name: e.args[1],
          creator: e.args[2],
          timestamp: Number(e.args[3] || 0),
        });
      });

      memberEvents.forEach((e) => {
        formattedEvents.push({
          type: "MemberJoined",
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          groupId: Number(e.args[0]),
          member: e.args[1],
          timestamp: Number(e.args[2] || 0),
        });
      });

      proposalEvents.forEach((e) => {
        formattedEvents.push({
          type: "ProposalCreated",
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          proposalId: Number(e.args[0]),
          groupId: Number(e.args[1]),
          creator: e.args[2],
          title: e.args[3],
          deadline: Number(e.args[5]),
        });
      });

      voteEvents.forEach((e) => {
        formattedEvents.push({
          type: "VoteCast",
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          proposalId: Number(e.args[0]),
          groupId: Number(e.args[1]),
          voter: e.args[2],
          support: e.args[3],
          yesCount: Number(e.args[4]),
          noCount: Number(e.args[5]),
        });
      });

      formattedEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching event provenance:", err);
    }
  }, [getContract]);

  // Load all contract data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchGroups(), fetchProposals(), fetchEvents()]);
    setLoading(false);
  }, [fetchGroups, fetchProposals, fetchEvents]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Write actions
  const createGroup = async (name, description) => {
    setActionLoading(true);
    setError(null);
    try {
      const contract = getContract(true);
      if (!contract) throw new Error("Wallet not connected");

      const tx = await contract.createGroup(name, description);
      await tx.wait();
      await refreshAll();
      return true;
    } catch (err) {
      console.error("createGroup failed:", err);
      setError(parseContractError(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const joinGroup = async (groupId) => {
    setActionLoading(true);
    setError(null);
    try {
      const contract = getContract(true);
      if (!contract) throw new Error("Wallet not connected");

      // Prevent redundant transaction if wallet is already a member
      const targetGroup = groups.find((g) => g.id === Number(groupId));
      if (targetGroup?.isMember) {
        setError("You are already a member of this group.");
        return false;
      }

      const tx = await contract.joinGroup(groupId);
      await tx.wait();

      // Optimistically update group state for immediate UI feedback
      setGroups((prevGroups) =>
        prevGroups.map((g) =>
          g.id === Number(groupId)
            ? {
                ...g,
                isMember: true,
                memberCount: g.memberCount + 1,
                members: account ? [...g.members, account] : g.members,
              }
            : g
        )
      );

      await refreshAll();
      return true;
    } catch (err) {
      console.error("joinGroup failed:", err);
      setError(parseContractError(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const createProposal = async (groupId, title, description, durationInSeconds) => {
    setActionLoading(true);
    setError(null);
    try {
      const contract = getContract(true);
      if (!contract) throw new Error("Wallet not connected");

      const tx = await contract.createProposal(groupId, title, description, durationInSeconds);
      await tx.wait();
      await refreshAll();
      return true;
    } catch (err) {
      console.error("createProposal failed:", err);
      setError(parseContractError(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const voteOnProposal = async (proposalId, support) => {
    setActionLoading(true);
    setError(null);
    try {
      const contract = getContract(true);
      if (!contract) throw new Error("Wallet not connected");

      const tx = await contract.vote(proposalId, support);
      await tx.wait();
      await refreshAll();
      return true;
    } catch (err) {
      console.error("vote failed:", err);
      setError(parseContractError(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    groups,
    proposals,
    events,
    loading,
    actionLoading,
    error,
    refreshAll,
    createGroup,
    joinGroup,
    createProposal,
    voteOnProposal,
  };
}

function parseContractError(err) {
  const msg = err?.message || err?.reason || "";
  if (msg.includes("NotGroupMember")) return "You must join this group before performing this action.";
  if (msg.includes("AlreadyMember")) return "You are already a member of this group.";
  if (msg.includes("AlreadyVoted")) return "You have already cast your vote on this proposal.";
  if (msg.includes("VotingEnded")) return "Voting deadline has already passed.";
  if (msg.includes("InvalidDuration")) return "Proposal duration must be between 5 minutes and 30 days.";
  if (msg.includes("InvalidInput")) return "Input title or name cannot be empty.";
  if (msg.includes("StringTooLong")) return "Entered text exceeds maximum length limits.";
  if (msg.includes("user rejected") || err?.code === 4001) return "Transaction signature rejected in wallet.";
  return msg || "Transaction failed. Please try again.";
}
