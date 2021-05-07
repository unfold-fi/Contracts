import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { Constants } from '../src/constants'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { WethPool } = Constants

  const chainId = await hre.getChainId()

  const tokenInstance = await deployments.get('Unfold')

  let wethAddress = WethPool.wethAddress

  // change dai address for kovan network
  if (chainId === '42') {
    wethAddress = '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
  }

  await deploy('UnfoldERCPool', {
    from: deployer,
    args: [wethAddress, tokenInstance.address, WethPool.duration, WethPool.feeBeneficiar],
    log: true,
  })
}
export default func
func.tags = ['WethPool']
