import {PublicKey, Connection, clusterApiUrl} from "@solana/web3.js"
import BN from "bn.js";
import {ObligationParser} from "./obligation"
import {SOLEND_PROGRAM_ID} from "../const"
import {ReserveParser} from './reserve'
import {calculateSupplyAPY, calculateBorrowAPY} from './utils'

/**
 * version: u8(1 byte)
 * Last_Update: {
 *  slot: u64(8 bytes)
 *  stale: bool(1 byte)
 * }
 * lending_market: PubKey(32 bytes)
 * owner: PubKey(32 bytes)
 * deposits:[ObligationCollateral]
 * ObligationCollateral: {
 *  deposit_reserve: PubKey(32 bytes)
 *  deposited_amount: u64
 *  market_value: Decimal(u64, u128, u192)
 * }
 * borrows: [ObligationLiquidity]
 * ObligationLiquidity: {
 *  borrow_reserve: PubKey(32 bytes)
 *  cumulative_borrow_rate_wads: Decimal(u64, u128, u192)
 *  borrowed_amount_wads: Decimal(u64, u128, u192)
 *  market_value: Decimal(u64, u128, u192)
 * }
 * deposited_value: u64, u128, u192
 * borrowed_value: u64, u128, u192
 * allowed_borrow_value: u64, u128, u192
 * unhealthy_borrow_value: u64, u128, u192
 * 1300-74=1226
 */
export const getSolendUserDepositBalance = async (connection: Connection, ownerAddress: string) => {
  const OBLIGATION_LEN = 1300
  type RerserveKey = {
    [key: string]: string;
  };
  const RESERVES_TO_ASSET_MAP: RerserveKey = {
    "8PbodeaosQP19SjYFx855UMqWxH2HynZLdBXmsrbac36": "SOL",
    "BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw": "USDC",
    "3PArRsZQ6SLkr1WERZWyC6AqsajtALMq4C66ZMYz4dKQ": "ETH",
    "GYzjMCXTDue12eUGKKWAqtF5jcBYNmewr6Db6LaguEaX": "BTC",
  };

  // // test obligation account
  // const obligationAccount = '6DqQ6mDaRrx9Wuwj3bkxJ8QNZxhzX1bKmXBswFYcCg4L'

  const accInfo = await connection.getProgramAccounts(
    SOLEND_PROGRAM_ID,
    {
      commitment: connection.commitment,
      filters: [
        // {
        //   memcmp: {
        //     offset: 10,
        //     bytes: MAIN_LENDING_MARKET,
        //   },
        // },
        {
          //compares a provided series of bytes with program account data at a particular offset
          memcmp: {
            offset: 42,// offset into program account data to start comparison
            bytes: ownerAddress,//data to match, as base-58 encoded string and limited to less than 129 bytes
          },
        },
        {
          dataSize: OBLIGATION_LEN,//compares the program account data length with the provided data size
        },
      ],
      encoding: "base64",
    }
  );
  console.log("Number of users:", accInfo.length);

  const obligations = accInfo.map((account) =>
    ObligationParser(account.pubkey, account.account)
  );

  console.log({obligationAccount: obligations[0]?.pubkey.toBase58()})
console.log(obligations[0]?.info);
  type UserDeposits = {
    [key: string]: number;
  };
  const userDeposits:UserDeposits = {}
  for (const deposit of obligations[0]?.info.deposits) {
    const reserve:string = deposit.depositReserve.toBase58();
    if (!(reserve in RESERVES_TO_ASSET_MAP)) {
      console.log(
        "WARNING: Unrecognized reserve. Update RESERVES_TO_ASSET_MAP."
      );
      continue;
    }
    // @ts-ignore
    const asset = RESERVES_TO_ASSET_MAP[reserve];
    if (!(asset in userDeposits)) {
      userDeposits[asset] = new BN(deposit.depositedAmount).toNumber();
    }
  }

  return userDeposits
}

export const getSolendUserBorrowBalance = async (connection: Connection, ownerAddress: string) => {
  const OBLIGATION_LEN = 1300
  type RerserveKey = {
    [key: string]: string;
  };
  const RESERVES_TO_ASSET_MAP: RerserveKey = {
    "8PbodeaosQP19SjYFx855UMqWxH2HynZLdBXmsrbac36": "SOL",
    "BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw": "USDC",
    "3PArRsZQ6SLkr1WERZWyC6AqsajtALMq4C66ZMYz4dKQ": "ETH",
    "GYzjMCXTDue12eUGKKWAqtF5jcBYNmewr6Db6LaguEaX": "BTC",
  };
  console.log({ownerAddress})

  const accInfo = await connection.getProgramAccounts(
    SOLEND_PROGRAM_ID,
    {
      commitment: connection.commitment,
      filters: [
        {
          memcmp: {
            offset: 42,
            bytes: ownerAddress,
          },
        },
        {
          dataSize: OBLIGATION_LEN,
        },
      ],
      encoding: "base64",
    }
  );
  console.log("Number of users:", accInfo.length);
  const obligations = accInfo.map((account) =>
    ObligationParser(account.pubkey, account.account)
  );
  console.log({obligations: obligations[0]})

  type UserDeposits = {
    [key: string]: number;
  };
  const userBorrows:UserDeposits = {}
  for (const borrow of obligations[0]?.info.borrows) {
    const reserve:string = borrow.borrowReserve.toBase58();
    if (!(reserve in RESERVES_TO_ASSET_MAP)) {
      console.log(
        "WARNING: Unrecognized reserve. Update RESERVES_TO_ASSET_MAP."
      );
      continue;
    }
    // @ts-ignore
    const asset = RESERVES_TO_ASSET_MAP[reserve];
    if (!(asset in userBorrows)) {
      const borrowedAmountBaseUnit = borrow.borrowedAmountWads.div(
        new BN("1" + "0".padEnd(18, "0"))
      );
      userBorrows[asset] = new BN(borrowedAmountBaseUnit).toNumber();
    }
  }

  return userBorrows
}

export const getMarketAPY = async (connection: Connection, lendingMarketAddress: string) => {
  const accInfo = await connection.getAccountInfo(new PublicKey(lendingMarketAddress));
  let supplyAPY;
  let borrowAPY;
  if (accInfo) {
    const reserve = ReserveParser(new PublicKey(lendingMarketAddress), accInfo)
    console.log({reserve})
    if (reserve) {
      supplyAPY = calculateSupplyAPY(reserve.info)
      borrowAPY = calculateBorrowAPY(reserve.info)
    }
  }
  return { supplyAPY, borrowAPY };
}
