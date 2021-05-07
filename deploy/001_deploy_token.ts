import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { Constants } from '../src/constants'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const { Token } = Constants

  await deploy('Unfold', {
    from: deployer,
    args: [Token.initial],
    log: true,
  })
}
export default func
func.tags = ['Token']
