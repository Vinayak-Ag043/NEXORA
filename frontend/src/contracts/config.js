import { isAddress } from 'ethers';
const address = import.meta.env.VITE_NEXORA_CONTRACT_ADDRESS?.trim(); const configuredChain = import.meta.env.VITE_NEXORA_CHAIN_ID?.trim();
export const contractConfig = { address: isAddress(address ?? '') ? address : null, chainId: configuredChain ? BigInt(configuredChain) : null };
export function configurationError(chainId) { if (!contractConfig.address) return 'Nexora contract address is not configured.'; if (contractConfig.chainId && chainId && contractConfig.chainId !== chainId) return 'Your wallet is connected to the wrong network for this Nexora deployment.'; return null; }
