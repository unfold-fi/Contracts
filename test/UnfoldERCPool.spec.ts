import { expect } from './chai-setup'
import hre, { getNamedAccounts, getUnnamedAccounts, ethers } from 'hardhat'

import { time, duration } from '../src/time-utils'
import { BigNumber, Contract } from 'ethers'
import { Address } from 'hardhat-deploy/types'

import { TestERC20 } from '../typechain/TestERC20'
import { UnfoldERCPool } from '../typechain/UnfoldERCPool'

const FEE_BASE = BigNumber.from('10000')
const DURATION = BigNumber.from('8640000') // 100 days
const WEEK_DURATION = BigNumber.from('604800')

const MIN_STAKE = BigNumber.from('1')
const DEPOSIT_FEE = BigNumber.from('1000')
const NEW_DEPOSIT_FEE = BigNumber.from('1000')
const MIN_WITHDRAW_FEE = BigNumber.from('1000')
const NEW_MIN_WITHDRAW_FEE = BigNumber.from('1000')

const applyFee = (_feeInBips: BigNumber, _amount: BigNumber) => {
  return _amount.mul(FEE_BASE.sub(_feeInBips)).div(FEE_BASE)
}

const calculateFee = (_feeInBips: BigNumber, _amount: BigNumber) => {
  return _amount.mul(_feeInBips).div(FEE_BASE)
}

context('UnfoldERCPool', () => {
  let deployer: Address
  let feeBeneficiar: Address
  let wallet1: Address
  let wallet2: Address
  let wallet3: Address
  let wallet4: Address
  let started: BigNumber

  let pool: UnfoldERCPool
  let poolTokenInstance: TestERC20
  let rewardTokenInstance: TestERC20

  before(async () => {
    deployer = (await getNamedAccounts()).deployer
    const accounts = await getUnnamedAccounts()
    feeBeneficiar = accounts[0]
    wallet1 = accounts[1]
    wallet2 = accounts[2]
    wallet3 = accounts[3]
    wallet4 = accounts[4]
    hre.tracer.nameTags[ethers.constants.AddressZero] = 'Zero'
    hre.tracer.nameTags[deployer] = 'Deployer'
    hre.tracer.nameTags[feeBeneficiar] = 'FeePool'
    hre.tracer.nameTags[wallet1] = 'Wallet1'
    hre.tracer.nameTags[wallet2] = 'Wallet2'
    hre.tracer.nameTags[wallet3] = 'Wallet3'
    hre.tracer.nameTags[wallet4] = 'Wallet4'
  })

  beforeEach(async () => {
    const TokenContract = await ethers.getContractFactory('TestERC20')
    poolTokenInstance = (await TokenContract.deploy('poolToken', 'POOL', 0)) as TestERC20
    rewardTokenInstance = (await TokenContract.deploy('rewardToken', 'REWARD', 0)) as TestERC20

    const PoolContract = await ethers.getContractFactory('UnfoldERCPool')
    pool = (await PoolContract.deploy(
      poolTokenInstance.address,
      rewardTokenInstance.address,
      DURATION,
      feeBeneficiar
    )) as UnfoldERCPool

    hre.tracer.nameTags[poolTokenInstance.address] = 'PoolToken'
    hre.tracer.nameTags[rewardTokenInstance.address] = 'RewardToken'
    hre.tracer.nameTags[pool.address] = 'PoolContract'

    await rewardTokenInstance.setBalance(pool.address, ethers.utils.parseUnits('1000000'))
    await poolTokenInstance.setBalance(wallet1, ethers.utils.parseUnits('1000'))
    await poolTokenInstance.setBalance(wallet2, ethers.utils.parseUnits('1000'))
    await poolTokenInstance.setBalance(wallet3, ethers.utils.parseUnits('1000'))
    await poolTokenInstance.setBalance(wallet4, ethers.utils.parseUnits('1000'))

    await poolTokenInstance
      .connect(await ethers.getSigner(wallet1))
      .approve(pool.address, BigNumber.from(2).pow(BigNumber.from(255)))
    await poolTokenInstance
      .connect(await ethers.getSigner(wallet2))
      .approve(pool.address, BigNumber.from(2).pow(BigNumber.from(255)))
    await poolTokenInstance
      .connect(await ethers.getSigner(wallet3))
      .approve(pool.address, BigNumber.from(2).pow(BigNumber.from(255)))
    await poolTokenInstance
      .connect(await ethers.getSigner(wallet4))
      .approve(pool.address, BigNumber.from(2).pow(BigNumber.from(255)))

    started = (await time.latest(ethers.provider)).add(10)

    await time.increaseTo(started, ethers.provider)
  })

  describe('#contructor()', async () => {
    it('should set pool token, reward token, duration and fee beneficiar', async () => {
      expect(await pool.poolToken()).to.be.equal(poolTokenInstance.address)
      expect(await pool.rewardToken()).to.be.equal(rewardTokenInstance.address)
      expect(await pool.duration()).to.be.equal(DURATION)
      expect(await pool.feeBeneficiar()).to.be.equal(feeBeneficiar)
    })
  })

  describe('#updateFeeBeneficiar()', async () => {
    it('admin can update fee beneficiar', async () => {
      await expect(pool.updateFeeBeneficiar(wallet1)).to.emit(pool, 'FeeBeneficiarUpdated').withArgs(wallet1)

      expect(await pool.feeBeneficiar()).to.be.equal(wallet1)
    })

    it('fee beneficiar can not be zero address', async () => {
      await expect(pool.updateFeeBeneficiar(ethers.constants.AddressZero)).to.be.revertedWith(
        'UnfoldPool: fee beneficiar is 0x0'
      )
    })

    it('non-admin can not update fee beneficiar', async () => {
      return await expect(
        pool.connect(await ethers.getSigner(wallet1)).updateFeeBeneficiar(wallet2)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('#stake()', async () => {
    it('Check stake and fee amount', async () => {
      const amount = ethers.utils.parseUnits('1')

      await expect(pool.connect(await ethers.getSigner(wallet1)).stake(amount))
        .to.emit(pool, 'Staked')
        .withArgs(wallet1, amount)

      const latest = await time.latest(ethers.provider)

      expect(await pool.balanceOf(wallet1)).to.be.eq(amount)
      expect(await pool.lastDepositTime(wallet1)).to.be.eq(latest)
    })
  })

  describe('#withdraw(), #exit() with min stake', async () => {
    beforeEach(async () => {
      const balance = await pool.balanceOf(wallet1)
      if (balance.gt(0)) {
        await pool.connect(await ethers.getSigner(wallet1)).exit()
      }
      await pool.connect(await ethers.getSigner(wallet1)).stake(MIN_STAKE)
    })

    it('Check withdraw next block', async () => {
      const balance = await pool.balanceOf(wallet1)
      const feeBalance = await poolTokenInstance.balanceOf(feeBeneficiar)
      const depositTime = await pool.lastDepositTime(wallet1)

      const withdrawFeeBp = await pool.calculateWithdrawalFeeBp(depositTime)
      const feeAmount = calculateFee(withdrawFeeBp, balance)
      const withdrawAmount = balance.sub(feeAmount)

      // console.log('b', balance.toString())
      // console.log('t', depositTime.toString())
      // console.log('fb', withdrawFeeBp.toString())
      // console.log('fa', feeAmount.toString())
      // console.log('wa', withdrawAmount.toString())

      await expect(pool.connect(await ethers.getSigner(wallet1)).withdraw(balance, balance))
        .to.emit(pool, 'Withdrawn')
        .withArgs(wallet1, withdrawAmount)

      expect(await pool.balanceOf(wallet1)).to.be.eq(0)
      expect(await poolTokenInstance.balanceOf(feeBeneficiar)).to.be.eq(feeBalance.add(feeAmount))
    })
  })
  describe('#withdraw(), #exit()', async () => {
    beforeEach(async () => {
      const balance = await pool.balanceOf(wallet1)
      if (balance.gt(0)) {
        await pool.connect(await ethers.getSigner(wallet1)).exit()
      }
      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))
    })

    it('Check withdraw next block', async () => {
      const balance = await pool.balanceOf(wallet1)
      const feeBalance = await poolTokenInstance.balanceOf(feeBeneficiar)
      const depositTime = await pool.lastDepositTime(wallet1)

      const withdrawFeeBp = await pool.calculateWithdrawalFeeBp(depositTime)
      const feeAmount = calculateFee(withdrawFeeBp, balance)
      const withdrawAmount = balance.sub(feeAmount)

      // console.log('b', balance.toString())
      // console.log('t', depositTime.toString())
      // console.log('fb', withdrawFeeBp.toString())
      // console.log('fa', feeAmount.toString())
      // console.log('wa', withdrawAmount.toString())

      await expect(pool.connect(await ethers.getSigner(wallet1)).withdraw(balance, balance))
        .to.emit(pool, 'Withdrawn')
        .withArgs(wallet1, withdrawAmount)

      expect(await pool.balanceOf(wallet1)).to.be.eq(0)
      expect(await poolTokenInstance.balanceOf(feeBeneficiar)).to.be.eq(feeBalance.add(feeAmount))
    })

    it('Check withdraw after one week', async () => {
      const balance = await pool.balanceOf(wallet1)
      const feeBalance = await poolTokenInstance.balanceOf(feeBeneficiar)
      const depositTime = await pool.lastDepositTime(wallet1)

      const latest = await time.latest(ethers.provider)
      await time.increaseTo(latest.add(duration.weeks(1)), ethers.provider)

      const withdrawFeeBp = await pool.calculateWithdrawalFeeBp(depositTime)
      const feeAmount = calculateFee(withdrawFeeBp, balance)
      const withdrawAmount = balance.sub(feeAmount)

      await expect(pool.connect(await ethers.getSigner(wallet1)).withdraw(balance, balance))
        .to.emit(pool, 'Withdrawn')
        .withArgs(wallet1, withdrawAmount)

      expect(await pool.balanceOf(wallet1)).to.be.eq(0)
      expect(await poolTokenInstance.balanceOf(feeBeneficiar)).to.be.eq(feeBalance.add(feeAmount))
    })

    it('Check withdraw after two weeks', async () => {
      const balance = await pool.balanceOf(wallet1)
      const feeBalance = await poolTokenInstance.balanceOf(feeBeneficiar)
      const depositTime = await pool.lastDepositTime(wallet1)

      const latest = await time.latest(ethers.provider)
      await time.increaseTo(latest.add(duration.weeks(2)), ethers.provider)

      const withdrawFeeBp = await pool.calculateWithdrawalFeeBp(depositTime)
      const feeAmount = calculateFee(withdrawFeeBp, balance)
      const withdrawAmount = balance.sub(feeAmount)

      await expect(pool.connect(await ethers.getSigner(wallet1)).withdraw(balance, balance))
        .to.emit(pool, 'Withdrawn')
        .withArgs(wallet1, withdrawAmount)

      expect(await pool.balanceOf(wallet1)).to.be.eq(0)
      expect(await poolTokenInstance.balanceOf(feeBeneficiar)).to.be.eq(feeBalance.add(feeAmount))
    })

    it('Check withdraw after three weeks', async () => {
      const balance = await pool.balanceOf(wallet1)
      const feeBalance = await poolTokenInstance.balanceOf(feeBeneficiar)
      const depositTime = await pool.lastDepositTime(wallet1)

      const latest = await time.latest(ethers.provider)
      await time.increaseTo(latest.add(duration.weeks(3)), ethers.provider)

      const withdrawFeeBp = await pool.calculateWithdrawalFeeBp(depositTime)
      const feeAmount = calculateFee(withdrawFeeBp, balance)
      const withdrawAmount = balance.sub(feeAmount)

      await expect(pool.connect(await ethers.getSigner(wallet1)).withdraw(balance, balance))
        .to.emit(pool, 'Withdrawn')
        .withArgs(wallet1, withdrawAmount)

      expect(await pool.balanceOf(wallet1)).to.be.eq(0)
      expect(await poolTokenInstance.balanceOf(feeBeneficiar)).to.be.eq(feeBalance.add(feeAmount))
    })

    it('Check withdraw after four weeks', async () => {
      const balance = await pool.balanceOf(wallet1)
      const feeBalance = await poolTokenInstance.balanceOf(feeBeneficiar)
      const depositTime = await pool.lastDepositTime(wallet1)

      const latest = await time.latest(ethers.provider)
      await time.increaseTo(latest.add(duration.weeks(4)), ethers.provider)

      const withdrawFeeBp = await pool.calculateWithdrawalFeeBp(depositTime)
      const feeAmount = calculateFee(withdrawFeeBp, balance)
      const withdrawAmount = balance.sub(feeAmount)

      await expect(pool.connect(await ethers.getSigner(wallet1)).withdraw(balance, balance))
        .to.emit(pool, 'Withdrawn')
        .withArgs(wallet1, withdrawAmount)

      expect(await pool.balanceOf(wallet1)).to.be.eq(0)
      expect(await poolTokenInstance.balanceOf(feeBeneficiar)).to.be.eq(feeBalance.add(feeAmount))
    })
  })

  describe('#earned()', async () => {
    it('One staker', async () => {
      const latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('72000'))

      expect(await pool.rewardPerToken()).to.be.equal('0')
      expect(await pool.balanceOf(wallet1)).to.be.equal('0')
      expect(await pool.earned(wallet1)).to.be.equal('0')

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))

      // const b1 = await pool.balanceOf(wallet1)
      // let e1 = await pool.earned(wallet1)

      // console.log('b1', b1.toString())
      // console.log('e1', e1.toString())

      await time.increaseTo(latest.add(DURATION), ethers.provider)

      // e1 = await pool.earned(wallet1)
      // console.log('e1', e1.toString())

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('72000'))
    })

    it('Two stakers with the same stakes', async () => {
      const latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('72000'))

      expect(await pool.rewardPerToken()).to.be.equal('0')
      expect(await pool.balanceOf(wallet1)).to.be.equal('0')
      expect(await pool.balanceOf(wallet2)).to.be.equal('0')
      expect(await pool.earned(wallet1)).to.be.equal('0')
      expect(await pool.earned(wallet2)).to.be.equal('0')

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))
      await pool.connect(await ethers.getSigner(wallet2)).stake(ethers.utils.parseUnits('1'))

      // const b1 = await pool.balanceOf(wallet1)
      // const b2 = await pool.balanceOf(wallet2)
      // let e1 = await pool.earned(wallet1)
      // let e2 = await pool.earned(wallet2)

      // console.log('b1', b1.toString())
      // console.log('b2', b2.toString())
      // console.log('e1', e1.toString())
      // console.log('e2', e2.toString())

      await time.increaseTo(latest.add(DURATION), ethers.provider)

      // e1 = await pool.earned(wallet1)
      // e2 = await pool.earned(wallet2)
      // console.log('e1', e1.toString())
      // console.log('e2', e2.toString())

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('36000'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('36000'))
    })

    it('Two stakers with the different (1:3) stakes', async () => {
      const latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('72000'))

      expect(await pool.rewardPerToken()).to.be.equal('0')
      expect(await pool.balanceOf(wallet1)).to.be.equal('0')
      expect(await pool.balanceOf(wallet2)).to.be.equal('0')
      expect(await pool.earned(wallet1)).to.be.equal('0')
      expect(await pool.earned(wallet2)).to.be.equal('0')

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))
      await pool.connect(await ethers.getSigner(wallet2)).stake(ethers.utils.parseUnits('3'))

      // const b1 = await pool.balanceOf(wallet1)
      // const b2 = await pool.balanceOf(wallet2)
      // let e1 = await pool.earned(wallet1)
      // let e2 = await pool.earned(wallet2)

      // console.log('b1', b1.toString())
      // console.log('b2', b2.toString())
      // console.log('e1', e1.toString())
      // console.log('e2', e2.toString())

      await time.increaseTo(latest.add(DURATION), ethers.provider)

      // e1 = await pool.earned(wallet1)
      // e2 = await pool.earned(wallet2)
      // console.log('e1', e1.toString())
      // console.log('e2', e2.toString())

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('18000'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('54000'))
    })

    it('Two stakers with the different (1:3) stakes with delayed second stake', async () => {
      //
      // 1x: +----------------+ = 36k for 50d + 9k for 100d
      // 3x:         +--------+ =  0k for 50d + 27k for 100d
      //

      let latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('72000'))

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))

      await time.increaseTo(latest.add(DURATION.div(2)), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('36000'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('0'))

      await pool.connect(await ethers.getSigner(wallet2)).stake(ethers.utils.parseUnits('3'))

      latest = await time.latest(ethers.provider)

      await time.increaseTo(latest.add(DURATION.div(2)), ethers.provider)

      // const b1 = await pool.balanceOf(wallet1)
      // const b2 = await pool.balanceOf(wallet2)
      // let e1 = await pool.earned(wallet1)
      // let e2 = await pool.earned(wallet2)

      // console.log('b1', b1.toString())
      // console.log('b2', b2.toString())
      // console.log('e1', e1.toString())
      // console.log('e2', e2.toString())

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('45000'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('27000'))
    })

    it('Three stakers with the different (1:3:5) stakes see timeline', async () => {
      //
      // 1x: +-------+--------+--------+ =  6k for 1st 33d + 2666 for 2nd 33d + 4k for 3nd 33d = 12666 for 100d
      // 3x: +-------+--------+          = 18k for 1st 33d + 8000 for 2nd 33d +  0k for 3nd 33d = 26000 for 100d
      // 5x:         +--------+--------+ =  0k for 1st 33d + 13,333 for 2nd 33d + 20k for 3nd 33d = 33333 for 100d
      //

      let latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('72000'))

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))
      await pool.connect(await ethers.getSigner(wallet2)).stake(ethers.utils.parseUnits('3'))

      await time.increaseTo(latest.add(DURATION.div(3)), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('6000'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('18000'))
      expect(await pool.earned(wallet3)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('0'))

      await pool.connect(await ethers.getSigner(wallet3)).stake(ethers.utils.parseUnits('5'))

      latest = await time.latest(ethers.provider)

      await time.increaseTo(latest.add(DURATION.div(3)), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('8666'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('26000'))
      expect(await pool.earned(wallet3)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('13333'))

      await pool.connect(await ethers.getSigner(wallet2)).exit()

      latest = await time.latest(ethers.provider)

      await time.increaseTo(latest.add(DURATION.div(3)), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('12666'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('0'))
      expect(await pool.earned(wallet3)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('33333'))
    })

    it('One staker with gap', async () => {
      //
      // 1x: +-------+        +--------+ =  24k for 1st 33d + 0 for 2nd 33d + 24k for 3nd 33d = 48k for 100d
      //
      let latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('72000'))

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))

      await time.increaseTo(latest.add(DURATION.div(3)), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('24000'))

      await pool.connect(await ethers.getSigner(wallet1)).exit()

      latest = await time.latest(ethers.provider)

      await time.increaseTo(latest.add(DURATION.div(3)), ethers.provider)

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))

      latest = await time.latest(ethers.provider)

      await time.increaseTo(latest.add(DURATION.div(3)), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('24000'))
    })

    it('Notify Reward Amount from mocked distribution to 10,000', async () => {
      let latest = await time.latest(ethers.provider)

      await pool.addReward(ethers.utils.parseUnits('10000'))

      expect(await pool.balanceOf(wallet1)).to.be.equal('0')
      expect(await pool.balanceOf(wallet2)).to.be.equal('0')
      expect(await pool.earned(wallet1)).to.be.equal('0')
      expect(await pool.earned(wallet2)).to.be.equal('0')

      await pool.connect(await ethers.getSigner(wallet1)).stake(ethers.utils.parseUnits('1'))
      await pool.connect(await ethers.getSigner(wallet2)).stake(ethers.utils.parseUnits('3'))

      await time.increaseTo(latest.add(DURATION), ethers.provider)

      expect(await pool.earned(wallet1)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('2500'))
      expect(await pool.earned(wallet2)).to.be.almostEqualDiv1e18(ethers.utils.parseUnits('7500'))
    })
  })
})
