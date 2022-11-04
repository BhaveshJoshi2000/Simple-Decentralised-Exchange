const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("DEX TEST", function () {
          let token1, token2, dexContract, dex, deployer, player

          const INITIAL_TOKEN_SUPPLY = ethers.utils.parseEther("500")
          const SWAP_AMOUNT = ethers.utils.parseEther("10")
          const LIQUIDITY_SUPPLY = ethers.utils.parseEther("50")
          beforeEach(async function () {
              const accounts = await ethers.getSigners()

              deployer = accounts[0]
              player = accounts[1]

              await deployments.fixture(["all"])

              token1 = await ethers.getContract("Token", deployer)
              token2 = await ethers.getContract("Token2", deployer)

              dexContract = await ethers.getContract("DEX")
              dex = dexContract.connect(deployer)

              await token1.approve(dex.address, INITIAL_TOKEN_SUPPLY)
              await token2.approve(dex.address, INITIAL_TOKEN_SUPPLY)

              await dex.addLiquidity(INITIAL_TOKEN_SUPPLY, INITIAL_TOKEN_SUPPLY)
          })

          describe("Constructor", function () {
              it("Initializes the variables correctly", async function () {
                  assert((await dexContract.token0()) != 0)
                  assert((await dexContract.token0()) != 0)
              })
          })

          describe("AddLiquidity First", function () {
              it("Successfully  Updates the Reserves of both tokens", async function () {
                  const reserve0 = await dex.reserve0()
                  const reserve1 = await dex.reserve1()
                  assert.equal(reserve0.toString(), INITIAL_TOKEN_SUPPLY.toString())
                  assert.equal(reserve1.toString(), INITIAL_TOKEN_SUPPLY.toString())
              })
              it("Correctly Updates the total supply of first time", async function () {
                  const totalSupply = await dex.totalSupply()
                  const expectedSupply = Math.sqrt(INITIAL_TOKEN_SUPPLY * INITIAL_TOKEN_SUPPLY)

                  assert.equal(totalSupply.toString(), expectedSupply.toString())
              })
              it("correctly assigns the shares to the first liquidator", async function () {
                  const shares = await dex.getBalanceOf(deployer.address)
                  const expectedShares = Math.sqrt(INITIAL_TOKEN_SUPPLY * INITIAL_TOKEN_SUPPLY)

                  assert.equal(shares.toString(), expectedShares.toString())
              })
          })

          describe("Swap", function () {
              it("Reverts when token provided is not valid", async function () {
                  await expect(dex.swap(deployer.address, SWAP_AMOUNT)).to.be.revertedWith(
                      "Invalid_Token"
                  )
              })
              it("Reverts when amount Entered is 0", async function () {
                  await expect(dex.swap(token1.address, 0)).to.be.revertedWith("Amount cannot be 0")
              })
              it("Successfully Adds the input amout after subtracting fees", async function () {
                  const initialSupply = await token1.balanceOf(dexContract.address)
                  await token1.approve(dex.address, SWAP_AMOUNT)
                  await dex.swap(token1.address, SWAP_AMOUNT)
                  const finalSupply = await token1.balanceOf(dexContract.address)
                  const addedSupply = finalSupply.sub(initialSupply)

                  assert.equal(addedSupply.toString(), SWAP_AMOUNT.toString())
              })

              it("Transfers the exchange tokens to swapper", async function () {
                  const initialBalance = await token2.balanceOf(deployer.address)
                  await token1.approve(dex.address, SWAP_AMOUNT)
                  await dex.swap(token1.address, SWAP_AMOUNT)
                  const finalBalance = await token2.balanceOf(deployer.address)
                  assert(finalBalance.toString() > initialBalance.toString())
              })

              it("Updates the reserve variables of the contract", async function () {
                  const initialReserve1 = await dex.reserve0()
                  const initialReserve2 = await dex.reserve1()
                  await token1.approve(dex.address, SWAP_AMOUNT)
                  await dex.swap(token1.address, SWAP_AMOUNT)
                  const finalReserve1 = await dex.reserve0()
                  const finalReserve2 = await dex.reserve1()
                  assert(initialReserve1.toString() < finalReserve1.toString())
                  assert(initialReserve2.toString() > finalReserve2.toString())
              })
          })

          describe("AddLiquidity", function () {
              it("Reverts when the amount is not in proportion", async function () {
                  await token1.approve(dex.address, LIQUIDITY_SUPPLY)
                  await token2.approve(dex.address, LIQUIDITY_SUPPLY)

                  await expect(
                      dex.addLiquidity(LIQUIDITY_SUPPLY, ethers.utils.parseEther("49"))
                  ).to.be.revertedWith("amount_not_balanced")
              })

              it("Mints correct shares to the liquidator", async function () {
                  await token1.approve(dex.address, LIQUIDITY_SUPPLY)
                  await token2.approve(dex.address, LIQUIDITY_SUPPLY)

                  const reserve0 = await dex.reserve0()
                  const totalSupply = await dex.totalSupply()
                  const initialShare = await dex.getBalanceOf(deployer.address)
                  dex.addLiquidity(LIQUIDITY_SUPPLY, LIQUIDITY_SUPPLY)
                  const finalShare = await dex.getBalanceOf(deployer.address)
                  const addedShare = finalShare.sub(initialShare)
                  const expectedShare = LIQUIDITY_SUPPLY.mul(totalSupply).div(reserve0)
                  assert.equal(addedShare.toString(), expectedShare.toString())
              })
          })

          describe("removeLiquidity", function () {
              it("Burns expected shares of the liquidator", async function () {
                  const initialShares = await dex.getBalanceOf(deployer.address)

                  await dex.removeLiquidity(initialShares)

                  const finalShares = await dex.getBalanceOf(deployer.address)

                  assert.equal(finalShares.toString(), "0")
              })
              it("Gives back expected amount of tokens to liquidator", async function () {
                  const initialShares = await dex.getBalanceOf(deployer.address)
                  const totalSupply = await dex.totalSupply()
                  const initialToken1 = await token1.balanceOf(deployer.address)
                  const initialToken2 = await token2.balanceOf(deployer.address)

                  const dexBalance1 = await token1.balanceOf(dex.address)
                  const dexBalance2 = await token2.balanceOf(dex.address)

                  await dex.removeLiquidity(initialShares)

                  const finalToken1 = await token1.balanceOf(deployer.address)
                  const finalToken2 = await token2.balanceOf(deployer.address)

                  const expectedToken1 = initialShares.mul(dexBalance1).div(totalSupply)
                  const expectedToken2 = initialShares.mul(dexBalance2).div(totalSupply)

                  const addedToken1 = finalToken1.sub(initialToken1)
                  const addedToken2 = finalToken2.sub(initialToken2)

                  assert.equal(expectedToken1.toString(), addedToken1.toString())
                  assert.equal(expectedToken2.toString(), addedToken2.toString())
              })
          })
      })
