const { ethers, network } = require("hardhat")
const fs = require("fs")
const { format } = require("path")

const frontEndContractsFile = "../dex-frontend/constants/networkMapping.json"
const frontEndAbiLocation = "../dex-frontend/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating frontend...")
        await updateContractAddresses()
        await updateAbi()
    }
}

async function updateAbi() {
    const dex = await ethers.getContract("DEX")
    fs.writeFileSync(
        `${frontEndAbiLocation}DEX.json`,
        dex.interface.format(ethers.utils.FormatTypes.json)
    )

    const token1 = await ethers.getContract("Token")
    fs.writeFileSync(
        `${frontEndAbiLocation}Token.json`,
        token1.interface.format(ethers.utils.FormatTypes.json)
    )

    const token2 = await ethers.getContract("Token2")
    fs.writeFileSync(
        `${frontEndAbiLocation}Token2.json`,
        token2.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const dex = await ethers.getContract("DEX")
    const token1 = await ethers.getContract("Token")
    const token2 = await ethers.getContract("Token2")
    const chainId = network.config.chainId.toString()

    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf-8"))

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["DEX"].includes(dex.address)) {
            contractAddresses[chainId]["DEX"].push(dex.address)
        }
        if (!contractAddresses[chainId]["Token1"].includes(token1.address)) {
            contractAddresses[chainId]["Token1"].push(token1.address)
        }
        if (!contractAddresses[chainId]["Token2"].includes(token2.address)) {
            contractAddresses[chainId]["Token2"].push(token2.address)
        }
    } else {
        contractAddresses[chainId] = {
            DEX: [dex.address],
            Token1: [token1.address],
            Token2: [token2.address],
        }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
