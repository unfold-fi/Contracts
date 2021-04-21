import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { Constants } from '../src/constants'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { DaiPool } = Constants

  const chainId = await hre.getChainId()

  const tokenInstance = await deployments.get('UnfoldToken')

  let daiAddress = DaiPool.daiAddress

  // change dai address for kovan network
  if (chainId === '42') {
    daiAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa'
  }

  await deploy('UnfoldERCPool', {
    from: deployer,
    args: [daiAddress, tokenInstance.address, DaiPool.duration, DaiPool.feeBeneficiar],
    log: true,
  })
}
export default func
func.tags = ['DaiPool']
