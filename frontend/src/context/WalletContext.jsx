import { BrowserProvider } from 'ethers';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WalletContext = createContext(null);
function provider() { if (!window.ethereum) throw new Error('No Ethereum wallet found. Install a browser wallet such as MetaMask to continue.'); return window.ethereum; }
function readableError(error) { if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') return new Error('Wallet connection was rejected.'); return new Error(error?.shortMessage || error?.message || 'Unable to connect wallet.'); }
export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null); const [chainId, setChainId] = useState(null); const [connecting, setConnecting] = useState(false);
  const refresh = useCallback(async (requestAccess = false) => { const injected = provider(); const accounts = await injected.request({ method: requestAccess ? 'eth_requestAccounts' : 'eth_accounts' }); const network = await new BrowserProvider(injected).getNetwork(); setAccount(accounts[0] ?? null); setChainId(network.chainId); return { account: accounts[0] ?? null, chainId: network.chainId }; }, []);
  const connect = useCallback(async () => { if (connecting) return; setConnecting(true); try { return await refresh(true); } catch (error) { throw readableError(error); } finally { setConnecting(false); } }, [connecting, refresh]);
  const disconnect = useCallback(() => { setAccount(null); setChainId(null); }, []);
  useEffect(() => { if (!window.ethereum) return undefined; refresh().catch(() => {}); const accounts = (next) => setAccount(next[0] ?? null); const chain = () => refresh().catch(() => {}); window.ethereum.on?.('accountsChanged', accounts); window.ethereum.on?.('chainChanged', chain); return () => { window.ethereum.removeListener?.('accountsChanged', accounts); window.ethereum.removeListener?.('chainChanged', chain); }; }, [refresh]);
  const value = useMemo(() => ({ account, chainId, connecting, connect, disconnect }), [account, chainId, connecting, connect, disconnect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
export function useWallet() { const context = useContext(WalletContext); if (!context) throw new Error('useWallet must be used inside WalletProvider'); return context; }
