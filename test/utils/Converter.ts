import BigNumber from "bignumber.js";
import Big from "big.js";

export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

export function decimalStr(value: string): string {
  return Big(value).mul(1e18).toFixed()
}
 
export function gweiStr(gwei: string): string {
  return new BigNumber(gwei).multipliedBy(10 ** 9).toFixed(0, BigNumber.ROUND_DOWN)
}

export function mweiStr(gwei: string): string {
  return new BigNumber(gwei).multipliedBy(10 ** 6).toFixed(0, BigNumber.ROUND_DOWN)
}
