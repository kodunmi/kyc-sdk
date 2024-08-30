import { ArrowBigLeft, ArrowLeft, Languages, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Img from "../../assets/svgs/undraw_digital_currency_qpak.svg";
import Loader from "../../assets/svgs/Rolling@1x-0.4s-200px-200px.svg";
import { Button } from "../ui/button";
import {
  useWallet,
  useConnection,
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  AlphaWalletAdapter,
  AvanaWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  CoinhubWalletAdapter,
  FractalWalletAdapter,
  HuobiWalletAdapter,
  KeystoneWalletAdapter,
  KrystalWalletAdapter,
  NekoWalletAdapter,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OntoWalletAdapter,
  SaifuWalletAdapter,
  SalmonWalletAdapter,
  SkyWalletAdapter,
  SolongWalletAdapter,
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  TokenPocketWalletAdapter,
  TrezorWalletAdapter,
  TrustWalletAdapter,
  UnsafeBurnerWalletAdapter,
  WalletConnectWalletAdapter,
} from "@solana/wallet-adapter-wallets";

type WalletAdapter =
  | PhantomWalletAdapter
  | SolflareWalletAdapter
  | TorusWalletAdapter
  | LedgerWalletAdapter
  | AlphaWalletAdapter
  | AvanaWalletAdapter
  | BitpieWalletAdapter
  | CloverWalletAdapter
  | Coin98WalletAdapter
  | CoinbaseWalletAdapter
  | CoinhubWalletAdapter
  | FractalWalletAdapter
  | HuobiWalletAdapter
  | KeystoneWalletAdapter
  | KrystalWalletAdapter
  | NekoWalletAdapter
  | NightlyWalletAdapter
  | NufiWalletAdapter
  | OntoWalletAdapter
  | SaifuWalletAdapter
  | SalmonWalletAdapter
  | SkyWalletAdapter
  | SolongWalletAdapter
  | SpotWalletAdapter
  | TokenaryWalletAdapter
  | TokenPocketWalletAdapter
  | TrezorWalletAdapter
  | TrustWalletAdapter
  | UnsafeBurnerWalletAdapter
  | WalletConnectWalletAdapter;

import {
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  PublicKey,
  TransactionSignature,
} from "@solana/web3.js";
import dayjs from "dayjs";

const WalletConnectionComponent = () => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletAdapter[]>([]);

  const {
    wallet,
    connect,
    disconnect,
    select,
    publicKey,
    connecting,
    connected,
  } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingTransactions, setFetchingTransactions] = useState(false);
  const [sendingToBackend, setSendingToBackend] = useState(false);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new AlphaWalletAdapter(),
      new AvanaWalletAdapter(),
      new BitpieWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinbaseWalletAdapter(),
      new CoinhubWalletAdapter(),
      new FractalWalletAdapter(),
      new HuobiWalletAdapter(),
      new KeystoneWalletAdapter(),
      new KrystalWalletAdapter(),
      new NekoWalletAdapter(),
      new NightlyWalletAdapter(),
      new NufiWalletAdapter(),
      new OntoWalletAdapter(),
      new SaifuWalletAdapter(),
      new SalmonWalletAdapter(),
      new SkyWalletAdapter(),
      new SolongWalletAdapter(),
      new SpotWalletAdapter(),
      new TokenaryWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new TrezorWalletAdapter(),
      new TrustWalletAdapter(),
      new UnsafeBurnerWalletAdapter(),
    ],
    []
  );

  const walletsJSON = useMemo(
    () =>
      wallets.map((wallet) => ({
        name: wallet.name,
        icon: wallet.icon,
        url: wallet.url,
      })),
    [wallets]
  );

  useEffect(() => {
    const detectAvailableWallets = () => {
      const available = wallets.filter(
        (wallet) => wallet.readyState === WalletReadyState.Installed
      );

      // console.log(available);

      setAvailableWallets(available);
    };

    detectAvailableWallets();
    // Set up an interval to periodically check for newly available wallets
    const intervalId = setInterval(detectAvailableWallets, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [wallets]);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / 10 ** 9); // Convert lamports to SOL
      });
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  const handleWalletClick = async (walletName: WalletName) => {
    console.log(walletName);

    try {
      const selectedWallet = wallets.find((w) => w.name === walletName);

      console.log("selected wallet", selectedWallet);

      if (selectedWallet) {
        await select(walletName);
        await connect();
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError("Failed to connect to wallet. Please try again.");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setBalance(null);
    setError(null);
  };

  const handleSub = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("kkd");
  };

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (connected && publicKey) {
      handleFetchTransactions();
    }
  }, [connected, publicKey]);

  const fetchTransactions = async (
    publicKey: PublicKey,
    startDate: string,
    endDate: string
  ) => {
    if (!publicKey) return;

    setFetchingTransactions(true);
    setError(null);

    try {
      // Convert dates to Unix timestamps
      const startTimestamp = dayjs(startDate).unix();
      const endTimestamp = dayjs(endDate).unix();

      const signatures: TransactionSignature[] = [];
      let before: TransactionSignature | undefined;

      const confirmedSignatures = await connection.getSignaturesForAddress(
        publicKey,
        {
          before,
          limit: 1000,
        }
      );

      const transactionDetails = await Promise.all(
        confirmedSignatures.map((tx) => connection.getTransaction(tx.signature))
      );

      if (transactionDetails) {
        console.log(transactionDetails);

        setTransactions(transactionDetails);

        await sendTransactionsToBackend(transactionDetails);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions. Please try again.");
    } finally {
      setFetchingTransactions(false);
    }
  };

  const sendTransactionsToBackend = async (transactions: any[]) => {
    setSendingToBackend(true);
    setError(null);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions }),
      });

      if (!response.ok) {
        throw new Error("Failed to send transactions to backend");
      }

      const result = await response.json();
      console.log("Transactions sent successfully:", result);
    } catch (error) {
      console.error("Error sending transactions to backend:", error);
      setError("Failed to send transactions to backend. Please try again.");
    } finally {
      setSendingToBackend(false);
    }
  };

  const handleFetchTransactions = async () => {
    if (publicKey) {
      const startDate = "2024-08-01"; // Replace with your start date
      const endDate = "2024-08-30"; // Replace with your end date

      await fetchTransactions(publicKey, startDate, endDate);
    }
  };

  if (fetchingTransactions) {
    return (
      <div className="kyc-p-2 kyc-flex kyc-flex-col kyc-items-center kyc-h-full kyc-justify-center">
        <img width={200} src={Loader} alt="" />
      </div>
    );
  }
  return (
    <div className="kyc-p-2 kyc-flex kyc-flex-col kyc-h-full kyc-justify-center">
      <div>
        <div className="kyc-flex kyc-justify-between kyc-items-center">
          <div
            onClick={handleDisconnect}
            className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100"
          >
            <ArrowLeft />
          </div>
          <h2 className="kyc-text-2xl kyc-font-bold">Vesona</h2>
          <div
            onClick={() => {}}
            className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
          >
            <X />
          </div>
        </div>
        {acknowledged && !connected && (
          <div className="kyc-text-center">
            <h2 className="text-2xl font-bold mb-4">
              Solana Wallet Connection
            </h2>
            <p className="kyc-mb-2">Please select a wallet to connect:</p>
          </div>
        )}
        <div></div>
      </div>
      <div className="kyc-flex-1 kyc-overflow-y-auto">
        {!connected && !acknowledged ? (
          <div className="kyc-text-center">
            <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
              <img width={150} src={Img} alt="" />
            </div>

            <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">
              Account Analysis
            </p>
            <p>You will be required to connect your wallet</p>
          </div>
        ) : (
          <div className="kyc-text-center">
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {connected ? (
              <div>
                <p className="kyc-mb-2">
                  Connected to: {wallet?.adapter?.name}
                </p>
                <p className="kyc-mb-2">Public Key: {publicKey?.toBase58()}</p>
                <p className="kyc-mb-2">
                  Balance: {balance !== null ? `${balance} SOL` : "Loading..."}
                </p>
                <button
                  onClick={handleDisconnect}
                  className="kyc-bg-red-500 hover:kyc-bg-red-700 kyc-text-white kyc-font-bold py-2 kyc-px-4 kyc-rounded"
                >
                  Disconnect
                </button>
                <button
                  onClick={handleFetchTransactions}
                  className="kyc-bg-blue-500 hover:kyc-bg-blue-700 kyc-text-white kyc-font-bold py-2 kyc-px-4 kyc-rounded"
                >
                  Fetch Transactions
                </button>
              </div>
            ) : (
              <div>
                <div className="">
                  {availableWallets.map((wallet) => (
                    <div
                      key={wallet.name}
                      className="kyc-flex kyc-items-center  kyc-w-full kyc-justify-between  hover:kyc-bg-gray-100 kyc-mb-4 kyc-text-black kyc-font-bold kyc-py-2 kyc-px-4 kyc-rounded-md"
                    >
                      <div className="kyc-flex kyc-items-center">
                        {wallet.icon && (
                          <img
                            src={wallet.icon}
                            alt={`${wallet.name} icon`}
                            className="kyc-w-12 kyc-h-12 kyc-mr-2 kyc-bg-gray-100 kyc-p-2 kyc-rounded-xl"
                          />
                        )}
                        {wallet.name}
                      </div>
                      <button
                        onClick={() => handleWalletClick(wallet.name)}
                        className="kyc-text-white kyc-rounded-lg kyc-bg-black kyc-text-xs kyc-p-4 kyc-py-2"
                      >
                        {connecting ? "Connecting..." : "Connect"}
                      </button>
                    </div>
                  ))}
                  <hr />
                  {walletsJSON.map((wallet) => (
                    <div
                      key={wallet.name}
                      className="kyc-flex kyc-items-center  kyc-w-full kyc-justify-between  hover:kyc-bg-gray-100 kyc-mb-4 kyc-text-black kyc-font-bold kyc-py-2 kyc-px-4 kyc-rounded-md"
                    >
                      <div className="kyc-flex kyc-items-center">
                        {wallet.icon && (
                          <img
                            src={wallet.icon}
                            alt={`${wallet.name} icon`}
                            className="kyc-w-12 kyc-h-12 kyc-mr-2 kyc-bg-gray-100 kyc-p-2 kyc-rounded-xl"
                          />
                        )}
                        {wallet.name}
                      </div>
                      <button
                        onClick={() => handleWalletClick(wallet.name)}
                        className="kyc-text-white kyc-rounded-lg kyc-bg-black kyc-text-xs kyc-p-4 kyc-py-2"
                      >
                        {connecting ? "Connecting..." : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        {!acknowledged && !connected && (
          <button
            onClick={() => setAcknowledged(true)}
            className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
          >
            Agree and Continue
          </button>
        )}
      </div>
    </div>
  );
};

const SolanaWalletConnectorWithProvider = () => {
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new AlphaWalletAdapter(),
      new AvanaWalletAdapter(),
      new BitpieWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinbaseWalletAdapter(),
      new CoinhubWalletAdapter(),
      new FractalWalletAdapter(),
      new HuobiWalletAdapter(),
      new KeystoneWalletAdapter(),
      new KrystalWalletAdapter(),
      new NekoWalletAdapter(),
      new NightlyWalletAdapter(),
      new NufiWalletAdapter(),
      new OntoWalletAdapter(),
      new SaifuWalletAdapter(),
      new SalmonWalletAdapter(),
      new SkyWalletAdapter(),
      new SolongWalletAdapter(),
      new SpotWalletAdapter(),
      new TokenaryWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new TrezorWalletAdapter(),
      new TrustWalletAdapter(),
      new UnsafeBurnerWalletAdapter(),
    ],
    []
  );

  const handleNetworkChange = (event: any) => {
    setNetwork(event.target.value);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletConnectionComponent />
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletConnectorWithProvider;
