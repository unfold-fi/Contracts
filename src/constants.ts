import { BigNumber } from 'ethers'

const bits = BigNumber.from(10).pow(BigNumber.from(18))

export const Constants = {
  Token: {
    initial: BigNumber.from('1000000000').mul(bits),
  },
  DaiPool: {
    daiAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    duration: 8640000,
    feeBeneficiar: '0xd5f42b2e244711e1DFD0AfD5B720B808d9eDebeB',
  },
  WethPool: {
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    duration: 8640000,
    feeBeneficiar: '0xd5f42b2e244711e1DFD0AfD5B720B808d9eDebeB',
  },
}
