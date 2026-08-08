import { BrowserProvider, Contract } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { configurationError, contractConfig } from '../contracts/config';
import { nexoraAbi } from '../contracts/nexoraAbi';

function errorMessage(error) {
  const text = [error?.shortMessage, error?.reason, error?.message, error?.data?.errorName].filter(Boolean).join(' ');
  if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') return 'Transaction was rejected in your wallet.';
  if (text.includes('NotGroupMember')) return 'Join this group before creating a proposal or voting.';
  if (text.includes('AlreadyMember')) return 'This wallet is already a member of the group.';
  if (text.includes('AlreadyVoted')) return 'This wallet has already voted on this proposal.';
  if (text.includes('VotingEnded')) return 'Voting has ended for this proposal.';
  if (text.includes('InvalidDuration')) return 'Voting duration must be between 5 minutes and 30 days.';
  if (text.includes('StringTooLong')) return 'One of the fields exceeds the contract limit.';
  if (text.includes('InvalidInput')) return 'Please provide the required information.';
  return error?.shortMessage || 'The contract transaction could not be completed.';
}

export function useNexora(account, chainId) {
  const [groups, setGroups] = useState([]); const [proposals, setProposals] = useState({}); const [loading, setLoading] = useState(false); const [transaction, setTransaction] = useState(null);
  const setupError = configurationError(chainId);
  const provider = useMemo(() => (!setupError && window.ethereum ? new BrowserProvider(window.ethereum) : null), [setupError]);
  const readContract = useCallback(() => { if (!provider) throw new Error('Connect a wallet on the configured network first.'); return new Contract(contractConfig.address, nexoraAbi, provider); }, [provider]);
  const write = useCallback(async (method, args) => {
    const signer = await provider.getSigner(); const contract = new Contract(contractConfig.address, nexoraAbi, signer);
    const tx = await contract[method](...args); setTransaction({ state: 'pending', hash: tx.hash, label: 'Transaction pending' });
    const receipt = await tx.wait(); setTransaction({ state: 'confirmed', hash: tx.hash, blockNumber: receipt.blockNumber, label: 'Transaction confirmed' }); return receipt;
  }, [provider]);
  const refreshGroups = useCallback(async () => {
    if (setupError || !account) return; setLoading(true);
    try { const contract = readContract(); const total = await contract.getGroupCount(); const items = await Promise.all(Array.from({ length: Number(total) }, async (_, index) => { const id = BigInt(index + 1); const group = await contract.getGroup(id); const isMember = await contract.isGroupMember(id, account); return { id, name: group.name, description: group.description, creator: group.creator, createdAt: group.createdAt, memberCount: group.memberCount, isMember }; })); setGroups(items); }
    finally { setLoading(false); }
  }, [account, readContract, setupError]);
  const refreshProposals = useCallback(async (groupId) => {
    const contract = readContract(); const ids = await contract.getGroupProposals(groupId); const items = await Promise.all(ids.map(async (id) => { const p = await contract.getProposal(id); const voted = account ? await contract.hasVoted(id, account) : false; const status = await contract.getProposalStatus(id); return { id, groupId: p.groupId, creator: p.creator, title: p.title, description: p.description, createdAt: p.createdAt, deadline: p.deadline, yesCount: p.yesCount, noCount: p.noCount, status, hasVoted: voted }; })); setProposals((current) => ({ ...current, [groupId.toString()]: items })); return items;
  }, [account, readContract]);
  const execute = useCallback(async (method, args, refresh) => { try { const receipt = await write(method, args); await refresh?.(); return receipt; } catch (error) { setTransaction({ state: 'failed', label: errorMessage(error) }); throw new Error(errorMessage(error)); } }, [write]);
  return { groups, proposals, loading, transaction, setupError, refreshGroups, refreshProposals, createGroup: (name, description) => execute('createGroup', [name, description], refreshGroups), joinGroup: (id) => execute('joinGroup', [id], refreshGroups), createProposal: (groupId, title, description, duration) => execute('createProposal', [groupId, title, description, BigInt(duration)], () => refreshProposals(groupId)), vote: (proposalId, support, groupId) => execute('vote', [proposalId, support], () => refreshProposals(groupId)) };
}
