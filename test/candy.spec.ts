import { ethers, waffle } from "hardhat"
import { expect, use } from "chai"
import { BigNumberish, BigNumber } from "ethers"
import { solidity } from "ethereum-waffle"

import { Can } from "../types/Can"
import { MockAggregator } from "../types/MockAggregator"
import { DodoMock } from "../types/DODOMock"
import { ERC20PresetMinterPauser } from "../types/ERC20PresetMinterPauser"
import { IERC20 } from "../types/IERC20"

use(solidity)

function expandTo18Decimals(n: BigNumberish): BigNumber {
    const decimals = BigNumber.from(10).pow(18)
    return BigNumber.from(n).mul(decimals)
}

describe("Candy token", function () {

    const name = "CandyETH"
    const symbol = "CandyETH"

    const [wallet, bob, carol, alice, dev] = waffle.provider.getWallets()

    let Candy: any
    let candy: Can

    let Aggregator: any
    let aggregator: MockAggregator

    let DodoMock: any
    let dodoMock: DodoMock

    let Token: any
    let lp: ERC20PresetMinterPauser
    let base: ERC20PresetMinterPauser
    let quote: ERC20PresetMinterPauser

    before(async () => {

        Candy = await ethers.getContractFactory("Can");
        DodoMock = await ethers.getContractFactory("DodoMock");
        Token = await ethers.getContractFactory("ERC20PresetMinterPauser")
    })

    beforeEach(async () => {
        quote = await Token.deploy('WETH','WETH')
        base = await Token.deploy('USG','USG')
        lp = await Token.deploy('LpEthUsg','leu')
        dodoMock = await DodoMock.deploy(
            base.address,
            quote.address,
            lp.address,
        )
        candy = await Candy.deploy(
            dodoMock.address,
            lp.address,
            quote.address,
            base.address,
            lp.address, 
            name, 
            symbol
        )
        await lp.mint(dodoMock.address,expandTo18Decimals(1000000))
        await base.mint(candy.address,expandTo18Decimals(100000000))
    })

    it("Checks that mint issues nft token to user", async function () {
        await dodoMock.setProportions(1,100)
        await dodoMock.setLpAmount(expandTo18Decimals(100)) // 100.0
        await quote.mint(alice.address,expandTo18Decimals(100))
        await quote.connect(alice).approve(candy.address,expandTo18Decimals(10));
        console.log('aaaa')
        await candy.connect(alice).mint(alice.address,expandTo18Decimals(10)); 
        console.log('aaaa')
        console.log((await candy.balanceOf(alice.address)).toString());
    })
})
