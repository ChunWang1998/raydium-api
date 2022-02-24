import { PublicKey, Connection } from "@solana/web3.js"
import { MAINNET_OFFICIAL_LIQUIDITY_POOLS } from '@raydium-io/raydium-sdk';
import { getBigNumber, ACCOUNT_LAYOUT, AMM_INFO_LAYOUT_V4, USER_STAKE_INFO_ACCOUNT_LAYOUT_V3_1, FARM_STATE_LAYOUT_V3, FARM_STATE_LAYOUT_V5 } from "./layout"
import BN, { min } from "bn.js";
import { FarmStateObligationParserV5, FarmStateObligationParserV3, AmmInfoObligationParser, StakeObligationParserV3, StakeObligationParserV4, StakeObligationParserV5 } from "./obligation"
import { FARMS, getFarmByPoolId } from "./farms"
import { LIQUIDITY_POOL_PROGRAM_ID_V4, STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4, TOKEN_PROGRAM_ID, STAKE_PROGRAM_ID_V5 } from './ids'
import { LP_TOKENS, TOKENS, NATIVE_SOL } from "./tokens";
import { getPoolByLpMintAddress } from "./pools"
import axios from 'axios'
import { TokenAmount } from './safe-math'
export { LP_TOKENS, TOKENS, NATIVE_SOL };

interface UserLiquidityBalance {
    type: string;
    mintAddress: string;
    poolToken: string;
    poolBaseValue: string;
    poolQuoteValue: string;
    apy: string;
}

export const getRaydiumUserLiquidityBalance = async (connection: Connection, ownerAddress: string) => {
    let liquidityMintAddresses: any = [];
    let liquidityAmounts: any = [];//token account balance
    let liquidityMintAddressNum: any;
    let datas = await getRaydiumPairAPIData();
    let res: any = [];

    let tokenAccounts: any = await connection.getTokenAccountsByOwner(new PublicKey(ownerAddress), { programId: new PublicKey(TOKEN_PROGRAM_ID) })

    for (var tokenAccount of tokenAccounts.value) {
        let { mint, amount } = ACCOUNT_LAYOUT.decode(Buffer.from(tokenAccount.account.data))

        let pool: any = getPoolByLpMintAddress(mint.toString())
        if (MAINNET_OFFICIAL_LIQUIDITY_POOLS.includes(pool?.ammId) && amount.toString() != "0") {// delete empty and tokenAccount mint address is liquidity
            let token = Object.values(LP_TOKENS).find((item) => item.mintAddress === mint.toString())
            liquidityMintAddresses.push(mint.toString())
            liquidityAmounts.push(amount.toNumber() / (10 ** token?.decimals))
        }
    }
    liquidityMintAddressNum = liquidityMintAddresses.length;

    for (let i = 0; i < liquidityMintAddressNum; i++) {
        let APIdata: any = Object.values(datas).find((item: any) => item.lp_mint === liquidityMintAddresses[i])

        let userPoolBaseValue = liquidityAmounts[i] * Number(APIdata.token_amount_coin) / Number(APIdata.token_amount_lp);

        let userPoolQuoteValue = liquidityAmounts[i] * Number(APIdata.token_amount_pc) / Number(APIdata.token_amount_lp);

        let liquidityItem: UserLiquidityBalance = {
            type: "liquidity",
            mintAddress: liquidityMintAddresses[i],
            poolToken: liquidityAmounts[i].toString(),
            poolBaseValue: userPoolBaseValue.toString(),
            poolQuoteValue: userPoolQuoteValue.toString(),
            apy: APIdata.apy.toString(),
        }

        res.push(liquidityItem)
    }
    return res;
}

interface UserFarmBalance {
    type: string;
    mintAddress: string;
    poolToken: string;
    poolBaseRewardMintAddress: string;
    poolQuoteRewardMintAddress: string;
    poolBaseReward: string;
    poolQuoteReward: string;
    poolBaseValue: string;
    poolQuoteValue: string;
    apy: string;
}

// in the farm pool, since every farm pool has diff program id, so deal with separately. V5 includes 
// STAKE_PROGRAM_ID_V4 and STAKE_PROGRAM_ID_V5, which are dual yield
export const getRaydiumUserFarmBalance = async (connection: Connection, ownerAddress: string) => {
    let farmLpMintAddress: any = [];
    let farmLpMintAddressV5: any = [];
    let farmAmounts: any = [];
    let farmAmountsV5: any = [];
    let farmMintAddressNum: any;
    let farmMintAddressV5Num: any;
    let datas = await getRaydiumPairAPIData();
    let datasForAPY = await getRaydiumPoolsAPIData();
    let APY: any = [];
    let APYV5: any = [];
    let res: any = [];
    let farmDepositBalance: any = [];
    let farmDepositBalanceV5: any = [];
    let poolBaseRewardMintAddress: any = [];
    let poolBaseReward: any = [];
    //let poolQuoteRewardMintAddress: any = [];
    let poolBaseRewardMintAddressV5: any = [];
    let poolQuoteRewardMintAddressV5: any = [];
    let userPoolBaseValues: any = [];
    let userPoolQuoteValues: any = [];
    let userPoolBaseValuesV5: any = [];
    let userPoolQuoteValuesV5: any = [];
    let farmBaseRewardDebt: any = [];
    let farmBaseRewardDebtV5: any = [];
    let farmQuoteRewardDebtV5: any = [];
    let farmPendingReward: any = [];
    let farmPendingRewardBaseV5: any = [];
    let farmPendingRewardQuoteV5: any = [];
    let TEN = new BN(10);

    //STAKE_PROGRAM_ID
    let userPools = await connection.getProgramAccounts(
        new PublicKey(STAKE_PROGRAM_ID),
        {
            commitment: connection.commitment,
            filters: [
                {
                    memcmp: {
                        offset: 40,//USER_STAKE_INFO_ACCOUNT_LAYOUT_V3_1.offsetOf('stakerOwner'),
                        bytes: ownerAddress,
                    },
                },
                {
                    dataSize: USER_STAKE_INFO_ACCOUNT_LAYOUT_V3_1.span,
                },

            ],
            encoding: "base64",
        }
    );
    let tmpPoolIds = userPools.map((account) =>
        StakeObligationParserV3(account.pubkey, account.account)
    );

    //STAKE_PROGRAM_ID_V4
    userPools = await connection.getProgramAccounts(
        new PublicKey(STAKE_PROGRAM_ID_V4),
        {
            commitment: connection.commitment,
            filters: [
                {
                    memcmp: {
                        offset: 40,//USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.offsetOf('stakerOwner'),
                        bytes: ownerAddress,
                    },
                },
            ],
            encoding: "base64",
        }
    );
    let tmpPoolIdsV4 = userPools.map((account) =>
        StakeObligationParserV4(account.pubkey, account.account)
    );

    //STAKE_PROGRAM_ID_V5
    userPools = await connection.getProgramAccounts(
        new PublicKey(STAKE_PROGRAM_ID_V5),
        {
            commitment: connection.commitment,
            filters: [
                {
                    memcmp: {
                        offset: 40,//USER_STAKE_INFO_ACCOUNT_LAYOUT_V5.offsetOf('stakerOwner'),
                        bytes: ownerAddress,
                    },
                },
            ],
            encoding: "base64",
        }
    );
    let tmpPoolIdsV5 = userPools.map((account) =>
        StakeObligationParserV5(account.pubkey, account.account)
    );

    let allPoolIds = tmpPoolIds;
    let allPoolIdsV4V5 = tmpPoolIdsV4.concat(tmpPoolIdsV5);
    let poolIds = [];
    let poolIdsV4V5 = [];// dual reward

    for (var poolId of allPoolIds) {
        let farm = getFarmByPoolId(poolId.info.poolId.toString())
        if (!farm) console.log("can't find farm " + poolId.info.poolId.toString() + "  ,please add it to farm.ts")

        if (farm && poolId.info.depositBalance.toNumber() && !farm?.isStake) {//有lp token stake進去而且屬於farming 而非staking

            let mint = farm?.lp.mintAddress.toString()
            let token = Object.values(LP_TOKENS).find((item) => item.mintAddress === mint)
            if (!token) console.log("can't find token from mint address: " + mint + " , please renew LP_TOKENS")
            else {
                poolIds.push(poolId);
                farmAmounts.push(poolId.info.depositBalance.toNumber() / (10 ** token?.decimals))
                farmLpMintAddress.push(mint);
                farmDepositBalance.push(poolId.info.depositBalance.toNumber())
            }
        }
    }

    for (var poolIdV4V5 of allPoolIdsV4V5) {
        let farm = getFarmByPoolId(poolIdV4V5.info.poolId.toString())
        if (!farm) console.log("can't find farm " + poolIdV4V5.info.poolId.toString() + "  ,please add it to farm.ts")
        if (farm && poolIdV4V5.info.depositBalance.toNumber() && !farm?.isStake) {//有lp token stake進去而且屬於farming 而非staking

            let mint = farm?.lp.mintAddress.toString()
            let token = Object.values(LP_TOKENS).find((item) => item.mintAddress === mint)
            if (!token) console.log("can't find token from mint address: " + mint + " , please renew LP_TOKENS")
            else {
                poolIdsV4V5.push(poolIdV4V5);
                farmAmountsV5.push(poolIdV4V5.info.depositBalance.toNumber() / (10 ** token?.decimals))
                farmLpMintAddressV5.push(mint);
                farmDepositBalanceV5.push(poolIdV4V5.info.depositBalance.toNumber())
            }
        }
    }

    //reward debt
    for (var poolId of poolIds) {
        farmBaseRewardDebt.push(poolId.info.rewardDebt.toString())
    }

    for (var poolIdV4V5 of poolIdsV4V5) {
        farmBaseRewardDebtV5.push(poolIdV4V5.info.rewardDebt.toString())
        farmQuoteRewardDebtV5.push(poolIdV4V5.info.rewardDebtB.toString())
    }

    // pending reward
    let userPoolLpTokenAccounts: string[] = [];
    let userPoolLpTokenAccountsV5: string[] = [];

    poolIds.map((poolId) => {
        if (getFarmByPoolId(poolId.info.poolId.toString())?.poolLpTokenAccount)
            userPoolLpTokenAccounts.push(<string>(getFarmByPoolId(poolId.info.poolId.toString())?.poolLpTokenAccount))
        else console.log("can't find poolLpTokenAccount in Farm from " + poolId.info.poolId.toString() + " , please renew Farm")
    });

    poolIdsV4V5.map((poolId) => {
        if (getFarmByPoolId(poolId.info.poolId.toString())?.poolLpTokenAccount)
            userPoolLpTokenAccountsV5.push(<string>(getFarmByPoolId(poolId.info.poolId.toString())?.poolLpTokenAccount))
        else console.log("can't find poolLpTokenAccount in Farm from " + poolId.info.poolId.toString() + " , please renew Farm")
    });

    //FARM_STATE_LAYOUT_V3
    let farmStateLayouts: any = [];
    for (let i = 0; i < userPoolLpTokenAccounts.length; i++) {
        await farmStateLayouts.push(await connection.getProgramAccounts(
            new PublicKey(STAKE_PROGRAM_ID),
            {
                commitment: connection.commitment,
                filters: [
                    {
                        memcmp: {
                            offset: FARM_STATE_LAYOUT_V3.offsetOf('lpVault'),
                            bytes: userPoolLpTokenAccounts[i],
                        },

                    },
                    {
                        dataSize: FARM_STATE_LAYOUT_V3.span,
                    },
                ],
                encoding: "base64",
            })
        )
    }
    let tmpFarmObligationsV3: any = [];
    for (var farmStateLayout of farmStateLayouts) {
        tmpFarmObligationsV3.push(farmStateLayout.map((account: any) =>
            FarmStateObligationParserV3(account.pubkey, account.account)
        ));
    }

    //FARM_STATE_LAYOUT_V5
    farmStateLayouts = [];
    for (let i = 0; i < userPoolLpTokenAccountsV5.length; i++) {
        await farmStateLayouts.push(await connection.getProgramAccounts(
            new PublicKey(STAKE_PROGRAM_ID_V5),
            {
                commitment: connection.commitment,
                filters: [
                    {
                        memcmp: {
                            offset: FARM_STATE_LAYOUT_V5.offsetOf('lpVault'),
                            bytes: userPoolLpTokenAccountsV5[i],
                        },

                    },
                    {
                        dataSize: FARM_STATE_LAYOUT_V5.span,
                    },
                ],
                encoding: "base64",
            })
        )
    }
    let tmpFarmObligationsV5 = [];
    for (var farmStateLayout of farmStateLayouts) {
        tmpFarmObligationsV5.push(farmStateLayout.map((account: any) =>
            FarmStateObligationParserV5(account.pubkey, account.account)
        ));
    }

    let farmObligationsV3 = [];
    let farmObligationsV5 = [];

    for (var tmpFarmObligation of tmpFarmObligationsV3)
        if (tmpFarmObligation.length != 0)
            farmObligationsV3.push(tmpFarmObligation)

    for (var tmpFarmObligation of tmpFarmObligationsV5)
        if (tmpFarmObligation.length != 0)
            farmObligationsV5.push(tmpFarmObligation)

    //get apy from token mint address
    for (let i = 0; i < poolIds.length; i++) {
        let coin = (getFarmByPoolId(poolIds[i].info.poolId.toString())?.lp.coin.mintAddress.toString())
        let pc = (getFarmByPoolId(poolIds[i].info.poolId.toString())?.lp.pc.mintAddress.toString())
        let find = false;
        for (var data of datasForAPY) {
            let tokenid = data['token-id']
            if (tokenid.includes(coin) && tokenid.includes(pc)) {
                APY.push(data['apy'].toString())
                find = true;
            }
        }
        if (!find) APY.push("")
    }

    for (let i = 0; i < poolIdsV4V5.length; i++) {
        let coin = (getFarmByPoolId(poolIdsV4V5[i].info.poolId.toString())?.lp.coin.mintAddress.toString())
        let pc = (getFarmByPoolId(poolIdsV4V5[i].info.poolId.toString())?.lp.pc.mintAddress.toString())
        let find = false;
        for (var data of datasForAPY) {
            let tokenid = data['token-id']
            if (tokenid.includes(coin) && tokenid.includes(pc)) {
                APYV5.push(data['apy'].toString())
                find = true;
            }
        }
        if (!find) APYV5.push("")
    }

    //get rewardMintAddress
    for (let i = 0; i < poolIds.length; i++) {
        let rewardMintAddress = (getFarmByPoolId(poolIds[i].info.poolId.toString())?.reward?.mintAddress.toString())
        poolBaseRewardMintAddress.push(rewardMintAddress);
        poolBaseReward.push(getFarmByPoolId(poolIds[i].info.poolId.toString())?.reward)
    }

    for (let i = 0; i < poolIdsV4V5.length; i++) {
        let rewardMintAddress = (getFarmByPoolId(poolIdsV4V5[i].info.poolId.toString())?.reward?.mintAddress.toString())
        poolBaseRewardMintAddressV5.push(rewardMintAddress);
        rewardMintAddress = (getFarmByPoolId(poolIdsV4V5[i].info.poolId.toString())?.rewardB?.mintAddress.toString())
        poolQuoteRewardMintAddressV5.push(rewardMintAddress);
    }

    // pending reward = deposited * PerShareReward / multiplier - rewardDebt
    // from sdk/src/farm/farm.ts :
    // ->const rewardDebt = ledger.rewardDebts[index];
    // ->const pendingReward = ledger.deposited.mul(perShareReward).div(multiplier).sub(rewardDebt);

    for (let i = 0; i < poolIds.length; i++) {
        let multiplier = TEN.pow(new BN(9));
        let pendingRewardWithoutDecimal = (farmDepositBalance[i] * farmObligationsV3[i][0].info.perShareRewards / Number(multiplier)) - farmBaseRewardDebt[i];

        let pendingRewardDecimal = <number>(getFarmByPoolId(poolIds[i].info.poolId.toString())?.reward?.decimals)
        let pendingReward = pendingRewardWithoutDecimal / (10 ** pendingRewardDecimal)
        farmPendingReward.push(pendingReward.toString())
    }

    // STAKE_PROGRAM_ID_V5 farm, use FARM_STATE_LAYOUT_V5 structure
    for (let i = 0; i < poolIdsV4V5.length; i++) {

        let multiplier = TEN.pow(new BN(15));

        let pendingRewardAWithoutDecimal = (farmDepositBalanceV5[i] * farmObligationsV5[i][0].info.perShareRewards[0] / Number(multiplier)) - farmBaseRewardDebtV5[i];
        let pendingRewardADecimal = <number>(getFarmByPoolId(poolIdsV4V5[i].info.poolId.toString())?.reward?.decimals)
        let pendingRewardA = pendingRewardAWithoutDecimal / (10 ** pendingRewardADecimal)
        farmPendingRewardBaseV5.push(pendingRewardA.toString())

        let pendingRewardBWithoutDecimal = (farmDepositBalanceV5[i] * farmObligationsV5[i][0].info.perShareRewards[1] / Number(multiplier)) - farmQuoteRewardDebtV5[i];
        let pendingRewardBDecimal = <number>(getFarmByPoolId(poolIdsV4V5[i].info.poolId.toString())?.rewardB?.decimals)
        let pendingRewardB = pendingRewardBWithoutDecimal / (10 ** pendingRewardBDecimal)
        farmPendingRewardQuoteV5.push(pendingRewardB.toString())
    }

    farmMintAddressNum = farmAmounts.length
    farmMintAddressV5Num = farmAmountsV5.length

    //pool value
    for (let i = 0; i < farmMintAddressNum; i++) {
        let APIdata: any = Object.values(datas).find((item: any) => item.lp_mint === farmLpMintAddress[i])
        if (!APIdata) console.log("can't find mint in APIdata: " + farmLpMintAddress[i]);
        let userPoolBaseValue = farmAmounts[i] * Number(APIdata.token_amount_coin) / Number(APIdata.token_amount_lp);
        userPoolBaseValues.push(userPoolBaseValue.toString());
        let userPoolQuoteValue = farmAmounts[i] * Number(APIdata.token_amount_pc) / Number(APIdata.token_amount_lp);
        userPoolQuoteValues.push(userPoolQuoteValue.toString());
    }

    for (let i = 0; i < farmMintAddressV5Num; i++) {
        let APIdata: any = Object.values(datas).find((item: any) => item.lp_mint === farmLpMintAddressV5[i])
        if (!APIdata) console.log("can't find mint in APIdata: " + farmLpMintAddressV5[i]);
        let userPoolBaseValue = farmAmountsV5[i] * Number(APIdata.token_amount_coin) / Number(APIdata.token_amount_lp);
        userPoolBaseValuesV5.push(userPoolBaseValue.toString());
        let userPoolQuoteValue = farmAmountsV5[i] * Number(APIdata.token_amount_pc) / Number(APIdata.token_amount_lp);
        userPoolQuoteValuesV5.push(userPoolQuoteValue.toString());
    }

    for (let i = 0; i < farmMintAddressNum; i++) {
        let farmItem: UserFarmBalance = {
            type: "farm",
            mintAddress: farmLpMintAddress[i],
            poolToken: farmAmounts[i].toString(),
            poolBaseRewardMintAddress: poolBaseRewardMintAddress[i],
            poolQuoteRewardMintAddress: "",
            poolBaseValue: userPoolBaseValues[i],
            poolQuoteValue: userPoolQuoteValues[i],
            poolBaseReward: farmPendingReward[i],
            poolQuoteReward: "",
            apy: APY[i],
        }
        res.push(farmItem)
    }

    for (let i = 0; i < farmMintAddressV5Num; i++) {
        let farmItem: UserFarmBalance = {
            type: "farm - dual yield",
            mintAddress: farmLpMintAddressV5[i],
            poolToken: farmAmountsV5[i].toString(),
            poolBaseRewardMintAddress: poolBaseRewardMintAddressV5[i],
            poolQuoteRewardMintAddress: poolQuoteRewardMintAddressV5[i],
            poolBaseValue: userPoolBaseValuesV5[i],
            poolQuoteValue: userPoolQuoteValuesV5[i],
            poolBaseReward: farmPendingRewardBaseV5[i],
            poolQuoteReward: farmPendingRewardQuoteV5[i],
            apy: APYV5[i]
        }
        res.push(farmItem)
    }

    return res;
}

interface UserStakeBalance {
    type: string;
    mintAddress: string;
    poolToken: string;
    poolReward: string;
    apy: string;
}

export const getRaydiumUserStakeBalance = async (connection: Connection, ownerAddress: string) => {
    let stakeLpMintAddress: any = [];
    let stakeAmounts: any = [];
    let stakeMintAddressNum: any;
    let res: any = [];
    let stakeDepositBalance: any = [];
    let stakeBaseRewardDebt: any = [];
    let stakePendingReward: any = [];
    let TEN = new BN(10);
    let datasForAPY = await getRaydiumPoolsAPIData();
    let APY: any = [];

    //STAKE_PROGRAM_ID(only consider ray)
    let userPools = await connection.getProgramAccounts(
        new PublicKey(STAKE_PROGRAM_ID),
        {
            commitment: connection.commitment,
            filters: [
                {
                    memcmp: {
                        offset: 40,//USER_STAKE_INFO_ACCOUNT_LAYOUT_V3_1.offsetOf('stakerOwner'),
                        bytes: ownerAddress,
                    },
                },

            ],
            encoding: "base64",
        }
    );
    let tmpPoolIds = userPools.map((account) =>
        StakeObligationParserV3(account.pubkey, account.account)
    );

    let poolIds = [];

    for (var poolId of tmpPoolIds) {
        let stake = getFarmByPoolId(poolId.info.poolId.toString())
        if (!stake) console.log("can't find stake " + poolId.info.poolId.toString() + "  ,please add it to stake.ts")

        if (poolId.info.depositBalance.toNumber() && stake?.isStake) {//有lp token stake進去而且屬於staking

            poolIds.push(poolId);

            let mint = stake?.lp.mintAddress.toString()
            let token = Object.values(TOKENS).find((item) => item.mintAddress === mint)
            stakeAmounts.push(poolId.info.depositBalance.toNumber() / (10 ** token?.decimals))

            stakeLpMintAddress.push(mint);
            stakeDepositBalance.push(poolId.info.depositBalance.toNumber())
        }
    }

    //reward debt
    for (var poolId of poolIds) {
        stakeBaseRewardDebt.push(poolId.info.rewardDebt.toString())
    }

    // pending reward
    let userPoolLpTokenAccounts: string[] = [];

    poolIds.map((poolId) => {
        if (getFarmByPoolId(poolId.info.poolId.toString())?.poolLpTokenAccount)
            userPoolLpTokenAccounts.push(<string>(getFarmByPoolId(poolId.info.poolId.toString())?.poolLpTokenAccount))
    });

    //get apy 
    for (let i = 0; i < poolIds.length; i++) {
        let lp = poolIds[i].info.poolId.toString()
        for (var data of datasForAPY) {
            let tokenid = data['token-id']
            if (tokenid == lp)
                APY.push(data['apy'].toString())
        }
    }

    //stake_STATE_LAYOUT_V3
    let farmStateLayouts: any = [];
    for (let i = 0; i < userPoolLpTokenAccounts.length; i++) {
        await farmStateLayouts.push(await connection.getProgramAccounts(
            new PublicKey(STAKE_PROGRAM_ID),
            {
                commitment: connection.commitment,
                filters: [
                    {
                        memcmp: {
                            offset: FARM_STATE_LAYOUT_V3.offsetOf('lpVault'),
                            bytes: userPoolLpTokenAccounts[i],
                        },

                    },
                    {
                        dataSize: FARM_STATE_LAYOUT_V3.span,
                    },
                ],
                encoding: "base64",
            })
        )
    }
    let tmpfarmStateLayoutObligationsV3: any = [];
    for (var farmStateLayout of farmStateLayouts) {
        tmpfarmStateLayoutObligationsV3.push(farmStateLayout.map((account: any) =>
            FarmStateObligationParserV3(account.pubkey, account.account)
        ));
    }
    let farmObligationsV3 = [];

    for (var tmpFarmObligation of tmpfarmStateLayoutObligationsV3)
        if (tmpFarmObligation.length != 0)
            farmObligationsV3.push(tmpFarmObligation)

    for (let i = 0; i < poolIds.length; i++) {
        let multiplier = TEN.pow(new BN(9));
        let pendingRewardWithoutDecimal = (stakeDepositBalance[i] * farmObligationsV3[i][0].info.perShareRewards / Number(multiplier)) - stakeBaseRewardDebt[i];
        let pendingRewardDecimal = <number>(getFarmByPoolId(poolIds[i].info.poolId.toString())?.reward?.decimals)
        let pendingReward = pendingRewardWithoutDecimal / (10 ** pendingRewardDecimal)
        stakePendingReward.push(pendingReward.toString())
    }

    stakeMintAddressNum = stakeAmounts.length

    //console.log("total stakeing pool can find:" + stakeMintAddressNum)

    for (let i = 0; i < stakeMintAddressNum; i++) {
        let stakeItem: UserStakeBalance = {
            type: "stake",
            mintAddress: stakeLpMintAddress[i],
            poolToken: stakeAmounts[i].toString(),
            poolReward: stakePendingReward[i],
            apy: APY[i]
        }
        res.push(stakeItem)
    }

    return res;
}

interface FindRaydiumPairTokenInPoolInterface {
    tokenMintAddr: string,
    data: any
}

export const findRaydiumPairTokenInPool = async ({
    tokenMintAddr: mintAddress,
    data: APIdata
}: FindRaydiumPairTokenInPoolInterface) => {
    let lpMintAddr: string[] = [];
    let anotherTokenMintAddr: string[] = [];
    let ammId: string[] = [];
    let liquidity: string[] = [];
    let res: any[] = [];

    for (var aPairData of APIdata) {
        let coinMintAddr = aPairData.pair_id.split("-")[0];
        let pcMintAddr = aPairData.pair_id.split("-")[1];

        //find the match token in api
        if (mintAddress == coinMintAddr) {
            if (aPairData.name.split("-")[0] != "unknown" && aPairData.name.split("-")[1] != "unknown" && (aPairData.token_amount_coin != "0") && (aPairData.token_amount_pc != "0"))
                if (mintAddress != pcMintAddr) {
                    lpMintAddr.push(aPairData.lp_mint);
                    anotherTokenMintAddr.push(pcMintAddr);
                    ammId.push(aPairData.amm_id);
                    liquidity.push(aPairData.liquidity)
                }
        }
        if (mintAddress == pcMintAddr) {
            if (aPairData.name.split("-")[0] != "unknown" && aPairData.name.split("-")[1] != "unknown" && (aPairData.token_amount_coin != "0") && (aPairData.token_amount_pc != "0"))
                if (mintAddress != coinMintAddr) {
                    lpMintAddr.push(aPairData.lp_mint);
                    anotherTokenMintAddr.push(coinMintAddr);
                    ammId.push(aPairData.amm_id);
                    liquidity.push(aPairData.liquidity)
                }
        }
    }

    for (let i = 0; i < lpMintAddr.length; i++) {
        res.push({
            anotherTokenMintAddr: anotherTokenMintAddr[i],
            lpMintAddr: lpMintAddr[i],
            ammId: ammId[i],
            liquidity: liquidity[i]
        })
    }

    let len = res.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (res[j] != null)
                if (res[j].anotherTokenMintAddr == anotherTokenMintAddr[i] && res[j].liquidity < liquidity[i]) {
                    delete res[j];
                }
        }
    }
    let filterRes = res.filter((a) => a);//delete empty element
    return filterRes;
}

export const getRaydiumPairAPIData = async () => {
    let url = "https://api.raydium.io/pairs";
    let response = await axios.get(url);
    let datas = response.data;
    for (let datasIndex = 0; datasIndex < datas.length; datasIndex++) {
        if (datas[datasIndex].name.includes("unknown") || datas[datasIndex].liquidity == "0")
            delete datas[datasIndex]
    }
    var usefulData = datas.filter((el: any) => el);
    return usefulData;
}

export const getRaydiumPoolsAPIData = async () => {
    let url = "https://api.raydium.io/pools";
    let response = await axios.get(url);
    let datas = response.data;
    for (let datasIndex = 0; datasIndex < datas.length; datasIndex++) {
        if (datas[datasIndex].identifier.includes("unknown") || datas[datasIndex].apy == null || datas[datasIndex].apy == 0)
            delete datas[datasIndex]
    }
    var usefulData = datas.filter((el: any) => el);
    return usefulData;
}

function throwIfNull<T>(value: T | null, message = 'account not found'): T {
    if (value === null) {
        throw new Error(message)
    }
    return value
}

export interface GetRaydiumPoolInfoInterface {
    connection: Connection,
    lpMintAddress: string
}

export async function getRaydiumPoolInfo({
    connection: connection,
    lpMintAddress: lpMintAddress
}: GetRaydiumPoolInfoInterface) {

    const amminfo = await connection.getProgramAccounts(
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        {
            commitment: connection.commitment,
            filters: [
                {
                    memcmp: {
                        offset: AMM_INFO_LAYOUT_V4.offsetOf('lpMintAddress'),
                        bytes: lpMintAddress,
                    },

                },
                {
                    dataSize: AMM_INFO_LAYOUT_V4.span,//can refer toekns.ts datasize
                },
            ],
            encoding: "base64",
        }
    )
    if (!amminfo.length) throw new Error("didn't get poolInfo");

    const amminfoobligations = amminfo.map((account) =>
        AmmInfoObligationParser(account.pubkey, account.account)
    );

    let swapFeeNumerator = await amminfoobligations[0].info.swapFeeNumerator.toString();
    let swapFeeDenominator = await amminfoobligations[0].info.swapFeeDenominator.toString();
    let coinDecimals = (await amminfoobligations[0].info.coinDecimals.toString());
    let pcDecimals = (await amminfoobligations[0].info.pcDecimals.toString());


    //get pool token amount
    let datas = await getRaydiumPairAPIData();
    let tokenAmountCoin;
    let tokenAmountPc;
    let mintCoin;
    let mintPc;
    for (let datasIndex = 0; datasIndex < datas.length; datasIndex++) {
        if (datas[datasIndex].lp_mint == lpMintAddress) {
            tokenAmountCoin = datas[datasIndex].token_amount_coin;
            tokenAmountPc = datas[datasIndex].token_amount_pc;
            mintCoin = datas[datasIndex].pair_id.split("-")[0];
            mintPc = datas[datasIndex].pair_id.split("-")[1];
            break;
        }
    }
    if (!tokenAmountCoin || !tokenAmountPc) throw new Error("didn't get pool token amount");

    return {
        swapFeeNumerator: swapFeeNumerator,
        swapFeeDenominator: swapFeeDenominator,
        tokenAmountCoin: tokenAmountCoin,
        tokenAmountPc: tokenAmountPc,
        mintCoin: mintCoin,
        mintPc: mintPc,
        coinDecimals: coinDecimals,
        pcDecimals: pcDecimals,
        lpMintAddress: lpMintAddress,
    };
}

export interface SlippageCntInterface {
    aIn: string,
    lpMintAddress: string,
    connection: Connection
    tokenMintAddr: string
}

export async function slippageCnt({
    aIn: ain,
    lpMintAddress: lpMintAddress,
    connection: connection,
    tokenMintAddr: tokenMintAddr
}: SlippageCntInterface
) {
    const parms = await getRaydiumPoolInfo({ connection: connection, lpMintAddress: lpMintAddress });
    if (!parms) throw new Error("getRaydiumPoolInfo() fail");

    let coin = parms.tokenAmountCoin;
    let pc = parms.tokenAmountPc;
    let mintCoin = parms.mintCoin;
    let mintPc = parms.mintPc;
    let amount = ain;
    let swapFeeNumerator: any = parms.swapFeeNumerator;//25;
    let swapFeeDenominator: any = parms.swapFeeDenominator;//10000;
    let coinDecimals = Number(parms.coinDecimals);
    let pcDecimals = Number(parms.pcDecimals);

    if (tokenMintAddr == mintCoin) {//  coin2pc
        const fromAmount = new TokenAmount(amount, coinDecimals, false)
        const fromAmountWithFee = fromAmount.wei
            .multipliedBy(swapFeeDenominator - swapFeeNumerator)
            .dividedBy(swapFeeDenominator)

        let coinBalance = new TokenAmount(coin, coinDecimals, false)
        let pcBalance = new TokenAmount(pc, pcDecimals, false)
        const denominator = coinBalance.wei.plus(fromAmountWithFee)
        const amountOut = pcBalance.wei.multipliedBy(fromAmountWithFee).dividedBy(denominator)

        const outBalance = pcBalance.wei.minus(amountOut)
        const beforePrice = new TokenAmount(
            parseFloat(new TokenAmount(pcBalance.wei, pcDecimals).fixed()) /
            parseFloat(new TokenAmount(coinBalance.wei, coinDecimals).fixed()),
            pcDecimals,
            false
        )
        const afterPrice = new TokenAmount(
            parseFloat(new TokenAmount(outBalance, pcDecimals).fixed()) /
            parseFloat(new TokenAmount(denominator, coinDecimals).fixed()),
            pcDecimals,
            false
        )
        const priceImpact =
            Math.abs((parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) / parseFloat(beforePrice.fixed())) *
            100

        return {
            aIn: ain,
            aOut: new TokenAmount(amountOut, pcDecimals).fixed(),
            lpMintAddress: lpMintAddress,
            priceImpact: priceImpact
        };
    }
    if (tokenMintAddr == mintPc) {  // pc2coin
        const fromAmount = new TokenAmount(amount, pcDecimals, false)
        const fromAmountWithFee = fromAmount.wei
            .multipliedBy(swapFeeDenominator - swapFeeNumerator)
            .dividedBy(swapFeeDenominator)

        let coinBalance = new TokenAmount(coin, coinDecimals, false)
        let pcBalance = new TokenAmount(pc, pcDecimals, false)
        const denominator = pcBalance.wei.plus(fromAmountWithFee)
        const amountOut = coinBalance.wei.multipliedBy(fromAmountWithFee).dividedBy(denominator)

        const outBalance = coinBalance.wei.minus(amountOut)
        const beforePrice = new TokenAmount(
            parseFloat(new TokenAmount(pcBalance.wei, pcDecimals).fixed()) /
            parseFloat(new TokenAmount(coinBalance.wei, coinDecimals).fixed()),
            pcDecimals,
            false
        )
        const afterPrice = new TokenAmount(
            parseFloat(new TokenAmount(denominator, pcDecimals).fixed()) /
            parseFloat(new TokenAmount(outBalance, coinDecimals).fixed()),
            pcDecimals,
            false
        )
        const priceImpact =
            Math.abs((parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) / parseFloat(beforePrice.fixed())) *
            100
        return {
            aIn: ain,
            aOut: new TokenAmount(amountOut, coinDecimals).fixed(),
            lpMintAddress: lpMintAddress,
            priceImpact: priceImpact
        };
    }
    throw new Error("(slippage cnt fail");
}