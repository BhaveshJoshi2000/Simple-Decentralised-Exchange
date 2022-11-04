const { ethers, network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains } = require("../helper-hardhat-config")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    const token0 = await ethers.getContract("Token")
    const token1 = await ethers.getContract("Token2")

    const token0Address = token0.address
    const token1Address = token1.address

    const args = [token0Address, token1Address]

    log("-----------------------------------------------------------------------")
    const dex = await deploy("DEX", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-----------------------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dex.address, args)
    }
}

module.exports.tags = ["all", "dex"]
