import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { DEFAULT_CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from "../contracts/config";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);

  const updateWalletState = useCallback(async (browserProvider, userAccount) => {
    try {
      const userSigner = await browserProvider.getSigner(userAccount);
      const network = await browserProvider.getNetwork();
      const userBalance = await browserProvider.getBalance(userAccount);

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(userAccount);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(userBalance));
    } catch (err) {
      console.error("Error updating wallet state:", err);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask to use Nexora.");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        await updateWalletState(browserProvider, accounts[0]);
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setBalance("0");
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;
    const hexChainId = "0x" + targetChainId.toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (err) {
      console.error("Network switch error:", err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);

      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          updateWalletState(browserProvider, accounts[0]);
        }
      });

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          updateWalletState(browserProvider, accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [updateWalletState]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        balance,
        isConnecting,
        contractAddress,
        setContractAddress,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
