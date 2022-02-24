// @ts-ignore
import BufferLayout from "buffer-layout";
import Layout from "./layout";
import { LastUpdateLayout } from "./lastUpdate";

export const RESERVE_LEN = 619;

export const ReserveLayout = BufferLayout.struct([
  BufferLayout.u8("version"),
  LastUpdateLayout,
  Layout.publicKey("lendingMarket"),
  BufferLayout.struct(
    [
      Layout.publicKey("mintPubkey"),
      BufferLayout.u8("mintDecimals"),
      Layout.publicKey("supplyPubkey"),
      Layout.publicKey("pythOracle"),
      Layout.publicKey("switchboardOracle"),
      Layout.uint64("availableAmount"),
      Layout.uint128("borrowedAmountWads"),
      Layout.uint128("cumulativeBorrowRateWads"),
      Layout.uint128("marketPrice"),
    ],
    "liquidity"
  ),

  BufferLayout.struct(
    [
      Layout.publicKey("mintPubkey"),
      Layout.uint64("mintTotalSupply"),
      Layout.publicKey("supplyPubkey"),
    ],
    "collateral"
  ),

  BufferLayout.struct(
    [
      BufferLayout.u8("optimalUtilizationRate"),
      BufferLayout.u8("loanToValueRatio"),
      BufferLayout.u8("liquidationBonus"),
      BufferLayout.u8("liquidationThreshold"),
      BufferLayout.u8("minBorrowRate"),
      BufferLayout.u8("optimalBorrowRate"),
      BufferLayout.u8("maxBorrowRate"),
      BufferLayout.struct(
        [
          Layout.uint64("borrowFeeWad"),
          Layout.uint64("flashLoanFeeWad"),
          BufferLayout.u8("hostFeePercentage"),
        ],
        "fees"
      ),
      Layout.uint64("depositLimit"),
      Layout.uint64("borrowLimit"),
      Layout.publicKey("feeReceiver"),
    ],
    "config"
  ),

  BufferLayout.blob(256, "padding"),
]);

// need to add type for pubkey and info params
// @ts-ignore
export const ReserveParser = (pubkey, info) => {
  const buffer = Buffer.from(info.data);
  const reserve = ReserveLayout.decode(buffer);

  if (reserve.lastUpdate.slot.isZero()) {
    return null;
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: reserve,
  };

  return details;
};

// @ts-ignore
export function reserveToString(reserve) {
  return JSON.stringify(
    reserve,
    (key, value) => {
      // Skip padding
      if (key === "padding") {
        return null;
      }
      switch (value.constructor.name) {
        case "PublicKey":
          return value.toBase58();
        case "BN":
          return value.toString();
        default:
          return value;
      }
    },
    2
  );
}

export default {
  ReserveLayout,
  ReserveParser,
  RESERVE_LEN,
  reserveToString,
};