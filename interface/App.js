import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import MyEpicNft from './assets/MyEpicNFT.json';

// Constants
const BS_TWITTER_HANDLE = '_buildspace';
const MY_TWITTER_HANDLE = 'matthewcpfeifer';
const BS_TWITTER_LINK = `https://twitter.com/${BS_TWITTER_HANDLE}`;
const MY_TWITTER_LINK = `https://twitter.com/${MY_TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/lopfeifnft-qdw3sxcrcp';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xAF63F7B276D73aE3256F9b477390963723f0269d";

const networks = {
  "0x1": "1",
  "0x3": "3",
  "0x2a": "2a",
  "0x4": "4",
  "0x5": "5",
  "0x61": "61",
  "0x38": "38",
  "0x89": "89",
  "0xa86a": "86a",
};

const App = () => {
  // state variable to store users wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [myNetwork, setMyNetwork] = useState("");
  const [myNFTCount, setMyNFTCount] = useState("");

  const { ethereum } = window;

  // async function
  const checkIfWalletIsConnected = async () => {
    // check for access to ethereum
    if (!ethereum) {
      console.log("Get MetaMask ya dummy!");
      return;
    } else {
      console.log("Connected!", ethereum);
      // Set current network 
      setMyNetwork(ethereum.networkVersion);
      // Set a chainChanged listener to update state variable when user changes chain
      ethereum.on('chainChanged', (chainId) => {
        setMyNetwork(networks[chainId]);
      });
      return;
    };

    // check for account authorization
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    const _network = window.ethereum.networkVersion;

    setMyNetwork(_network)

    // user can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)

        setupEventListener()   
    } else {
        console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getNFTCount = async () => {
    try {
        const { ethereum } = window;

        if (ethereum) {
          // Same stuff again
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNft.abi, signer);

          let nftCount = await connectedContract.getTotalNFTsMinted();
          setMyNFTCount(nftCount.toString());
        } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        let nftCount = await connectedContract.getTotalNFTsMinted();
        setMyNFTCount(nftCount.toString());
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  // run the function on page load
  useEffect(() => {
    checkIfWalletIsConnected();
    getNFTCount();
  }, [])
  
  // Render Methods - different renderings depending on the state of the page
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  );

  // conditional render logic: condition ? true : false
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">LoFi NFTs to Chill & Study to</p>
          <p className="sub-text">
            Each unique.  Each beautiful.  Discover and secure your NFT today.
          </p>
          <p className="sub-text">
            NFTs Minted: {myNFTCount}/{TOTAL_MINT_COUNT}
          </p>
          {myNetwork !== "4" &&
            <p className="sub-text">
              Oops! You need to connect your wallet to the Rinkeby network.
            </p>
          }
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div>
          <button target="_blank" className="cta-button connect-wallet-button" href={OPENSEA_LINK}>🌊 View Collection on OpenSea
          </button>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <span className="footer-text">Built by </span>
          {' '}
          <a
            className="footer-text"
            href={MY_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{` @${MY_TWITTER_HANDLE} `}</a>
          {' '}
          <span className="footer-text"> thanks to </span>
          {' '}
          <a
            className="footer-text"
            href={BS_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${BS_TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;