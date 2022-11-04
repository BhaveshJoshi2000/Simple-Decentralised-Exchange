const { ethers, network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains } = require("../helper-hardhat-config")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const INITIAL_TOKEN_SUPPLY = ethers.utils.parseEther("1000")
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    log("-----------------------------------------------------------------------")
    const token2 = await deploy("Token2", {
        from: deployer,
        args: [INITIAL_TOKEN_SUPPLY],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-----------------------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(token2.address, [INITIAL_TOKEN_SUPPLY])
    }
}

module.exports.tags = ["all", "token"]
