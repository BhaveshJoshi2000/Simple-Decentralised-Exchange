import { ethers } from "ethers";
import dexAbi from "../constants/DEX.json";
import token1Abi from "../constants/Token.json";
import token2Abi from "../constants/Token2.json";
import styles from "../styles/Home.module.css";
import { Form, useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
export default function Swapper(props) {
  const dispatch = useNotification();

  const { runContractFunction } = useWeb3Contract();

  async function approveAndSwap(data) {
    const inputTokenAddress = data.data[0].inputResult;
    const inputTokenAmount = ethers.utils
      .parseUnits(data.data[1].inputResult, "ether")
      .toString();
    const isToken1 = inputTokenAddress == props.token1Address;
    const isToken2 = inputTokenAddress == props.token2Address;
    let inputAddress, inputAbi;
    if (isToken1) {
      inputAddress = props.token1Address;
      inputAbi = token1Abi;
    } else if (isToken2) {
      inputAddress = props.token2Address;
      inputAbi = token2Abi;
    } else {
      dispatch({
        type: "success",
        message: "select one of two token address in this DEX",
        title: "Wrong Token address",
        position: "topR",
      });
      return;
    }
    const approveOptions = {
      abi: inputAbi,
      contractAddress: inputAddress,
      functionName: "approve",
      params: {
        spender: props.dexAddress,
        amount: inputTokenAmount,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () =>
        handleApproveSuccess(inputTokenAddress, inputTokenAmount),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(inputTokenAddress, inputTokenAmount) {
    console.log("swapping...");

    const swapOptions = {
      abi: dexAbi,
      contractAddress: props.dexAddress,
      functionName: "swap",
      params: {
        _inputToken: inputTokenAddress,
        _inputAmount: inputTokenAmount,
      },
    };

    await runContractFunction({
      params: swapOptions,
      onSuccess: () => handleSwapSuccess(),
      onError: (error) => console.log(error),
    });
  }

  async function handleSwapSuccess() {
    dispatch({
      type: "success",
      message: "wait for transaction to complete",
      title: "Swapped",
      position: "topR",
    });
  }
  return (
    <div className={styles.card}>
      <Form
        buttonConfig={{
          onClick: function noRefCheck() {},
          theme: "colored",
          color: "blue",
          text: "SWAP!!",
        }}
        onSubmit={approveAndSwap}
        data={[
          {
            name: "Token Address",
            type: "text",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Amount",
            type: "number",
            value: "",
            key: "Amount",
          },
        ]}
        title="SWAP YOUR TOKENS"
        id="Main Form"
      />
    </div>
  );
}
