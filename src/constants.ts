import { BigNumber } from 'ethers'

const bits = BigNumber.from(10).pow(BigNumber.from(18))

export const Constants = {
  Token: {
    initial: BigNumber.from('1000000000').mul(bits),
  },
  DaiPool: {
    daiAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    duration: 8640000,
    feeBeneficiar: '0x232C4ad01e0AbAD40B98B39660b2EF7CeC964693',
  },
}
