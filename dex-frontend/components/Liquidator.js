import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import dexAbi from "../constants/DEX.json";
import token1Abi from "../constants/Token.json";
import token2Abi from "../constants/Token2.json";
import networkMapping from "../constants/networkMapping.json";
import { Form, useNotification, Button } from "web3uikit";
import { ethers } from "ethers";

export default function Liquidator(props) {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const dexAddress =
    chainId in networkMapping ? networkMapping[chainId]["DEX"][0] : null;
  const token1Address =
    chainId in networkMapping ? networkMapping[chainId]["Token1"][0] : null;

  const token2Address =
    chainId in networkMapping ? networkMapping[chainId]["Token2"][0] : null;
  const dispatch = useNotification();

  const { runContractFunction } = useWeb3Contract();
  async function approveAndAdd(data) {
    console.log("Approving...");
    const amount1 = ethers.utils
      .parseUnits(data.data[0].inputResult, "ether")
      .toString();
    const amount2 = ethers.utils
      .parseUnits(data.data[1].inputResult, "ether")
      .toString();

    const approveOptions1 = {
      abi: token1Abi,
      contractAddress: token1Address,
      functionName: "approve",
      params: {
        spender: dexAddress,
        amount: amount1,
      },
    };

    const approveOptions2 = {
      abi: token2Abi,
      contractAddress: token2Address,
      functionName: "approve",
      params: {
        spender: dexAddress,
        amount: amount2,
      },
    };

    await runContractFunction({
      params: approveOptions1,
      onError: (error) => {
        console.log(error);
      },
    });

    await runContractFunction({
      params: approveOptions2,
      onSuccess: () => handleApproveSuccess(amount1, amount2),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(amount1, amount2) {
    console.log("Now time to add liquidity");

    const addLiquidityOptions = {
      abi: dexAbi,
      contractAddress: dexAddress,
      functionName: "addLiquidity",
      params: {
        amount0: amount1,
        amount1: amount2,
      },
    };

    await runContractFunction({
      params: addLiquidityOptions,
      onSuccess: () => handleAddLiquiditySuccess(),
      onError: (error) => console.log(error),
    });
  }

  async function handleAddLiquiditySuccess() {
    dispatch({
      type: "success",
      message: "wait for transactions to complete",
      title: "Liquidity Added",
      position: "topR",
    });
  }
  async function Remove(data) {
    const shares = ethers.utils
      .parseUnits(data.data[0].inputResult, "ether")
      .toString();

    const removeLiquidityOptions = {
      abi: dexAbi,
      contractAddress: dexAddress,
      functionName: "removeLiquidity",
      params: {
        _shares: shares,
      },
    };

    await runContractFunction({
      params: removeLiquidityOptions,
      onSuccess: () => handleRemoveLiquiditySuccess(),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleRemoveLiquiditySuccess() {
    dispatch({
      type: "success",
      message: "wait for transactions to complete",
      title: "Liquidity Removed",
      position: "topR",
    });
  }

  async function mint1() {
    console.log("mint1()");
    const amount = ethers.utils.parseUnits("500", "ether").toString();
    const mint1Options = {
      abi: token1Abi,
      contractAddress: token1Address,
      functionName: "mint",
      params: {
        _amount: amount,
      },
    };

    await runContractFunction({
      params: mint1Options,
      onSuccess: () => console.log("Minting Token1 Success"),
      onError: (error) => {
        console.log(error);
      },
    });
  }
  async function mint2() {
    console.log("mint2()");
    const amount = ethers.utils.parseUnits("500", "ether").toString();
    const mint2Options = {
      abi: token2Abi,
      contractAddress: token2Address,
      functionName: "mint",
      params: {
        _amount: amount,
      },
    };

    await runContractFunction({
      params: mint2Options,
      onSuccess: () => console.log("Minting Token1 Success"),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  return (
    <div>
      <div className="w-100 m-10 p-4">
        <p>
          Total Supply of MTK token is{" "}
          <span className="text-lg font-bold text-red-600">
            {props.reserve1}
          </span>{" "}
          address is
          <span className="text-lg font-bold text-blue-600 m-2 select-all">
            {props.token1Address}
          </span>
          <Button onClick={mint1} text="Mint 500 to test" />
        </p>
        <br />
        <br />
        <p>
          Total Supply of MTK-2 token is{" "}
          <span className="text-lg font-bold text-red-600">
            {props.reserve2}
          </span>{" "}
          address is
          <span className="text-lg font-bold text-blue-600 m-2 select-all">
            {props.token2Address}
          </span>
          <Button onClick={mint2} text="Mint 500 to test" />
        </p>
        <p>
          Total shares in contract is{" "}
          <span className="text-lg font-bold text-red-600 ">
            {props.totalSupply}
          </span>
        </p>
        <br />
      </div>
      <div>
        <div className="flex justify-between p-8 ">
          <div className={styles.card}>
            <Form
              buttonConfig={{
                onClick: function noRefCheck() {},
                theme: "primary",
                text: "Add Liquidity",
              }}
              onSubmit={approveAndAdd}
              data={[
                {
                  name: "Token 1 Amount",
                  type: "number",
                  value: "",
                  key: "token1",
                },
                {
                  name: "Token 2 Amount",
                  type: "number",
                  value: "",
                  key: "token2",
                },
              ]}
              title="ADD LIQUIDITY AND GET SHARES"
              id="Main Form"
            />
          </div>

          <div className={styles.card}>
            <Form
              buttonConfig={{
                onClick: function noRefCheck() {},
                theme: "colored",
                color: "red",
                text: "Remove Liquidity",
              }}
              onSubmit={Remove}
              data={[
                {
                  name: "shares you want to liquidate",
                  type: "number",
                  value: "",
                  key: "token2",
                },
              ]}
              title="Remove Liquidity"
              id="Main Form"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
