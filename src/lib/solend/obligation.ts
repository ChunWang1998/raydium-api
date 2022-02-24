// @ts-ignore
import BufferLayout from "buffer-layout";
import {publicKey, uint128, uint64} from "./layout";
import { LastUpdateLayout } from "./lastUpdate";

export const OBLIGATION_LEN = 1300;

export const ObligationLayout = BufferLayout.struct([
  BufferLayout.u8("version"),
  LastUpdateLayout,
  publicKey("lendingMarket"),
  publicKey("owner"),
  uint128("depositedValue"),
  uint128("borrowedValue"),
  uint128("allowedBorrowValue"),
  uint128("unhealthyBorrowValue"),
  BufferLayout.blob(64, "_padding"),
  BufferLayout.u8("depositsLen"),
  BufferLayout.u8("borrowsLen"),
  BufferLayout.blob(1096, "dataFlat"),
]);

const ObligationCollateralLayout = BufferLayout.struct([
  publicKey("depositReserve"),
  uint64("depositedAmount"),
  uint128("marketValue"),
  BufferLayout.blob(32, "padding"),
]);

const ObligationLiquidityLayout = BufferLayout.struct([
  publicKey("borrowReserve"),
  uint128("cumulativeBorrowRateWads"),
  uint128("borrowedAmountWads"),
  uint128("marketValue"),
  BufferLayout.blob(32, "padding"),
]);

// @ts-ignore
export const ObligationParser = (pubkey, info) => {
  const buffer = Buffer.from(info.data);
  const {
    version,
    lastUpdate,
    lendingMarket,
    owner,
    depositedValue,
    borrowedValue,
    allowedBorrowValue,
    unhealthyBorrowValue,
    depositsLen,
    borrowsLen,
    dataFlat,
  } = ObligationLayout.decode(buffer);

  if (lastUpdate.slot.isZero()) {
    return null;
  }

  const depositsBuffer = dataFlat.slice(
    0,
    depositsLen * ObligationCollateralLayout.span
  );
  const deposits = BufferLayout.seq(
    ObligationCollateralLayout,
    depositsLen
  ).decode(depositsBuffer);

  const borrowsBuffer = dataFlat.slice(
    depositsBuffer.length,
    depositsLen * ObligationCollateralLayout.span +
      borrowsLen * ObligationLiquidityLayout.span
  );
  const borrows = BufferLayout.seq(
    ObligationLiquidityLayout,
    borrowsLen
  ).decode(borrowsBuffer);

  const obligation = {
    version,
    lastUpdate,
    lendingMarket,
    owner,
    depositedValue,
    borrowedValue,
    allowedBorrowValue,
    unhealthyBorrowValue,
    deposits,
    borrows,
  };

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

// @ts-ignore
export const obligationToString = (obligation) => {
  return JSON.stringify(
    obligation,
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