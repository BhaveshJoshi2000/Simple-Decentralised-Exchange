import Head from "next/head";
import Header from "../components/Header";
import Liquidator from "../components/Liquidator";
import Swapper from "../components/Swapper";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import token1Abi from "../constants/Token.json";
import token2Abi from "../constants/Token2.json";
import dexAbi from "../constants/DEX.json";
import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
export default function Home() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const dexAddress =
    chainId in networkMapping ? networkMapping[chainId]["DEX"][0] : null;

  const token1Address =
    chainId in networkMapping ? networkMapping[chainId]["Token1"][0] : null;

  const token2Address =
    chainId in networkMapping ? networkMapping[chainId]["Token2"][0] : null;

  const [reserve1, setReserve1] = useState("0");
  const [reserve2, setReserve2] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");

  const { runContractFunction: getReserve1 } = useWeb3Contract({
    abi: dexAbi,
    contractAddress: dexAddress,
    functionName: "reserve0",
    params: {},
  });
  const { runContractFunction: getReserve2 } = useWeb3Contract({
    abi: dexAbi,
    contractAddress: dexAddress,
    functionName: "reserve1",
    params: {},
  });
  const { runContractFunction: getTotalSupply } = useWeb3Contract({
    abi: dexAbi,
    contractAddress: dexAddress,
    functionName: "totalSupply",
    params: {},
  });

  async function updateUI() {
    const reserve1 = await getReserve1();
    const reserve2 = await getReserve2();
    const totalSupply = await getTotalSupply();

    setReserve1(ethers.utils.formatEther(reserve1));
    setReserve2(ethers.utils.formatEther(reserve2));
    setTotalSupply(ethers.utils.formatEther(totalSupply));
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Decentralized Exchange</title>
        <meta
          name="description"
          content="Raffle smart contract by Bhavesh Joshi"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {dexAddress ? (
        <div className="flex flex-col items-center">
          <Liquidator
            reserve1={reserve1}
            reserve2={reserve2}
            totalSupply={totalSupply}
            dexAddress={dexAddress}
            token1Address={token1Address}
            token2Address={token2Address}
          />
          <Swapper
            dexAddress={dexAddress}
            token1Address={token1Address}
            token2Address={token2Address}
          />
        </div>
      ) : (
        <div> Connect to Goreli Testnet!</div>
      )}
    </div>
  );
}
