import { expect } from './chai-setup'
import hre, { getNamedAccounts, getUnnamedAccounts, ethers } from 'hardhat'

import { time, duration } from '../src/time-utils'
import { BigNumber, Contract } from 'ethers'
import { Address } from 'hardhat-deploy/types'

import { Unfold } from '../typechain/Unfold'
import { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signer-with-address'

const EMISSION_BP = BigNumber.from('500')
const NEW_EMISSION_BP = BigNumber.from('100')
const INVALID_EMISSION_BP = BigNumber.from('1000')

const INITIAL_SUPPLY = ethers.utils.parseEther('1000000000')

context('UnfoldToken', () => {
  let deployer: Address
  let governance: Address
  let governanceSigner: SignerWithAddress

  let token: Unfold

  before(async () => {
    deployer = (await getNamedAccounts()).deployer
    const accounts = await getUnnamedAccounts()
    governance = accounts[0]
    governanceSigner = await ethers.getSigner(governance)

    hre.tracer.nameTags[ethers.constants.AddressZero] = 'Zero'
    hre.tracer.nameTags[deployer] = 'Deployer'
    hre.tracer.nameTags[governance] = 'Governance'
  })

  beforeEach(async () => {
    const TokenContract = await ethers.getContractFactory('Unfold')
    token = (await TokenContract.deploy(INITIAL_SUPPLY, governance)) as Unfold

    hre.tracer.nameTags[token.address] = 'Unfold'
  })

  describe('#contructor()', async () => {
    it('should set new owner, mint inital supply, and update next emission time', async () => {
      const latest = await time.latest(ethers.provider)
      expect(await token.balanceOf(governance)).to.be.equal(INITIAL_SUPPLY)
      expect(await token.owner()).to.be.equal(governance)
      expect(await token.nextEmissionTime()).to.be.equal(latest.add(duration.days(1095)))
      expect(await token.availableEmission()).to.be.equal(0)
    })
  })

  describe('#setEmissionPerYearBp()', async () => {
    it('admin can update emission bp', async () => {
      await token.connect(governanceSigner).setEmissionPerYearBp(NEW_EMISSION_BP)

      expect(await token.EMISSION_PER_YEAR_BP()).to.be.equal(NEW_EMISSION_BP)
    })

    it('emission bp should be less then max emission per year', async () => {
      await expect(token.connect(governanceSigner).setEmissionPerYearBp(INVALID_EMISSION_BP)).to.be.revertedWith(
        'Unfold: Emission per year gt MAX_EMISSION_PER_YEAR_BP'
      )
    })

    it('non-admin can not update emission bp', async () => {
      return await expect(token.setEmissionPerYearBp(EMISSION_BP)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  describe('#claimEmission()', async () => {
    it('Cannot claim before period', async () => {
      await expect(token.connect(governanceSigner).claimEmission()).to.be.revertedWith(
        'Unfold: Emission not available yet'
      )
    })

    it('non-admin cannot claim emission', async () => {
      const current = await time.latest(ethers.provider)
      await time.increaseTo(current.add(duration.days(1095)), ethers.provider)
      await expect(token.claimEmission()).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('admin can claim first emission', async () => {
      const current = await time.latest(ethers.provider)
      await time.increaseTo(current.add(duration.days(1096)), ethers.provider)

      const amount = await token.availableEmission()

      await token.connect(governanceSigner).claimEmission()
      expect(await token.balanceOf(governance)).to.be.equal(INITIAL_SUPPLY.add(amount))
    })

    it('admin can claim consecutive emission', async () => {
      let current = await time.latest(ethers.provider)
      await time.increaseTo(current.add(duration.days(1096)), ethers.provider)

      let amount = await token.availableEmission()

      await token.connect(governanceSigner).claimEmission()
      expect(await token.balanceOf(governance)).to.be.equal(INITIAL_SUPPLY.add(amount))

      current = await time.latest(ethers.provider)
      await time.increaseTo(current.add(duration.days(366)), ethers.provider)

      amount = await token.availableEmission()

      let totalSupply = await token.totalSupply()

      await token.connect(governanceSigner).claimEmission()
      expect(await token.balanceOf(governance)).to.be.equal(totalSupply.add(amount))

      current = await time.latest(ethers.provider)
      await time.increaseTo(current.add(duration.days(366)), ethers.provider)

      amount = await token.availableEmission()

      totalSupply = await token.totalSupply()

      await token.connect(governanceSigner).claimEmission()
      expect(await token.balanceOf(governance)).to.be.equal(totalSupply.add(amount))
    })
  })
})
