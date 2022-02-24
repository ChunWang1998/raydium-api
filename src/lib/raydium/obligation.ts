// @ts-ignore

import { FARM_LEDGER_LAYOUT_V5_1, FARM_STATE_LAYOUT_V3,FARM_STATE_LAYOUT_V5,USER_STAKE_INFO_ACCOUNT_LAYOUT_V4, USER_STAKE_INFO_ACCOUNT_LAYOUT_V5,LIQUIDITY_STATE_LAYOUT_V4, AMM_INFO_LAYOUT_V4, USER_STAKE_INFO_ACCOUNT_LAYOUT, USER_STAKE_INFO_ACCOUNT_LAYOUT_V3_1 ,STAKE_INFO_LAYOUT} from "./layout"


// @ts-ignore
export const FarmLedgerObligationParser = (pubkey, info) => {
  const buffer = Buffer.from(info.data);
  const {
    state,
    id,//pubkey , poolid in radium-ui/src/utils/farms.ts
    owner,//pubkey
    deposited,//u64, 對應Step 上id pool 的value
    rewardDebts,//2 u128, 對應Step 上id pool 的 pending reward,若只有一種token reward那第一項為0
  } = FARM_LEDGER_LAYOUT_V5_1.decode(buffer);

  // console.log(state.toString());
  //   console.log(id.toString());
  // console.log(owner.toString());
  // console.log(deposited.toString());
  // console.log(rewardDebts.toString());
  // console.log('-------------------------')
  const obligation = {
    id,
    owner,
    deposited,
    rewardDebts,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const FarmStateObligationParserV3 = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);
  const {
    state,
    nonce,
    lpVault,
    lastSlot,
    rewardVaults,
    totalRewards,
    perShareRewards,
    perSlotRewards
  } = FARM_STATE_LAYOUT_V3.decode(buffer);

  //console.log(perShareRewards.toString())


  const obligation = {
    state,
    nonce,
    lpVault,
    lastSlot,
    rewardVaults,
    totalRewards,
    perShareRewards,
    perSlotRewards
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const FarmStateObligationParserV5 = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);
  const {
    state,
    nonce,
    lpVault,
    // rewardVaultA,
    // totalRewardA,
    // perShareRewardA,
    // perSlotRewardA,
    option,
    // rewardVaultB,
    // totalRewardB,
    // perShareRewardB,
    // perSlotRewardB,
    lastSlot,
    rewardVaults,
    totalRewards,
    perShareRewards,
    perSlotRewards
  } = FARM_STATE_LAYOUT_V5.decode(buffer);

  //console.log(perShareRewards.toString())


  const obligation = {
    state,
    nonce,
    lpVault,
    // rewardVaultA,
    // totalRewardA,
    // perShareRewardA,
    // perSlotRewardA,
    option,
    // rewardVaultB,
    // totalRewardB,
    // perShareRewardB,
    // perSlotRewardB,
    lastSlot,
    rewardVaults,
    totalRewards,
    perShareRewards,
    perSlotRewards
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const LiquidityStateObligationParser = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);
  const {
    status,
    nonce,
    maxOrder,
    depth,
    baseDecimal,
    quoteDecimal,
    state,
    resetFlag,
    minSize,
    volMaxCutRatio,
    amountWaveRatio,
    baseLotSize,
    quoteLotSize,
    minPriceMultiplier,
    maxPriceMultiplier,
    systemDecimalValue,
    minSeparateNumerator,
    minSeparateDenominator,
    tradeFeeNumerator,
    tradeFeeDenominator,
    pnlNumerator,
    pnlDenominator,
    swapFeeNumerator,
    swapFeeDenominator,
    baseNeedTakePnl,
    quoteNeedTakePnl,
    quoteTotalPnl,
    baseTotalPnl,
    quoteTotalDeposited,
    baseTotalDeposited,
    swapBaseInAmount,
    swapQuoteOutAmount,
    swapBase2QuoteFee,
    swapQuoteInAmount,
    swapBaseOutAmount,
    swapQuote2BaseFee,
    // amm vault
    baseVault,
    quoteVault,
    // mint
    baseMint,// Pool_token_coin Account
    quoteMint,// mintAddress
    lpMint,//mintAddress
    // market
    openOrders,
    marketId,
    marketProgramId,
    targetOrders,
    withdrawQueue,
    lpVault,//poolTempLpTokenAccount in ui/src/utils/pools
    owner,
    pnlOwner,
  } = LIQUIDITY_STATE_LAYOUT_V4.decode(buffer);

  // console.log(baseDecimal.toString());
  // console.log(quoteDecimal.toString());
  // console.log(baseTotalPnl.toString());
  // console.log(quoteTotalPnl.toString());
  // console.log(baseTotalDeposited.toString());
  // console.log(quoteTotalDeposited.toString());

  // console.log(baseVault.toBase58());
  // console.log(quoteVault.toBase58());
  // console.log(baseMint.toBase58());
  // console.log(quoteMint.toBase58());
  //console.log(lpMint.toBase58());
  // console.log(openOrders.toBase58());
  // console.log(marketId.toBase58());
  // console.log(marketProgramId.toBase58());
  // console.log(targetOrders.toBase58());
  // console.log(withdrawQueue.toBase58());
  // console.log(lpVault.toBase58());
  // console.log(owner.toBase58()); // all same

  //console.log(pnlOwner.toBase58());
  //console.log('----------------------')

  const obligation = {
    status,
    nonce,
    maxOrder,
    depth,
    baseDecimal,
    quoteDecimal,
    state,
    resetFlag,
    minSize,
    volMaxCutRatio,
    amountWaveRatio,
    baseLotSize,
    quoteLotSize,
    minPriceMultiplier,
    maxPriceMultiplier,
    systemDecimalValue,
    minSeparateNumerator,
    minSeparateDenominator,
    tradeFeeNumerator,
    tradeFeeDenominator,
    pnlNumerator,
    pnlDenominator,
    swapFeeNumerator,
    swapFeeDenominator,
    baseNeedTakePnl,
    quoteNeedTakePnl,
    quoteTotalPnl,
    baseTotalPnl,
    quoteTotalDeposited,
    baseTotalDeposited,
    swapBaseInAmount,
    swapQuoteOutAmount,
    swapBase2QuoteFee,
    swapQuoteInAmount,
    swapBaseOutAmount,
    swapQuote2BaseFee,
    // amm vault
    baseVault,
    quoteVault,
    // mint
    baseMint,
    quoteMint,
    lpMint,
    // market
    openOrders,
    marketId,
    marketProgramId,
    targetOrders,
    withdrawQueue,
    lpVault,
    owner,
    pnlOwner,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const AmmInfoObligationParser = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);
  const {
    swapFeeNumerator,
    swapFeeDenominator,
    coinDecimals,
    pcDecimals,
    needTakePnlCoin,
    needTakePnlPc,
    totalPnlPc,
    totalPnlCoin,

    swapCoinInAmount,
    swapPcOutAmount,
    poolCoinTokenAccount,
    poolPcTokenAccount,
    coinMintAddress,
    pcMintAddress,
    lpMintAddress,
    ammOpenOrders,
    serumMarket,
    serumProgramId,
    ammTargetOrders,
    poolWithdrawQueue,
    poolTempLpTokenAccount,
    ammOwner,
    pnlOwner,
    swapCoinOutAmount
  } = AMM_INFO_LAYOUT_V4.decode(buffer);

  const obligation = {
    swapFeeNumerator,
    swapFeeDenominator,
    coinDecimals,
    pcDecimals,
    needTakePnlCoin,
    needTakePnlPc,
    totalPnlPc,
    totalPnlCoin,
    swapCoinInAmount,
    swapPcOutAmount,
    poolCoinTokenAccount,
    poolPcTokenAccount,
    coinMintAddress,
    pcMintAddress,
    lpMintAddress,
    ammOpenOrders,
    serumMarket,
    serumProgramId,
    ammTargetOrders,
    poolWithdrawQueue,
    poolTempLpTokenAccount,
    ammOwner,
    pnlOwner,
    swapCoinOutAmount
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const StakeObligationParser = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);

  const {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
  } = USER_STAKE_INFO_ACCOUNT_LAYOUT.decode(buffer);
  const obligation = {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;

};

export const StakeObligationParserV3 = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);

  const {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
  } = USER_STAKE_INFO_ACCOUNT_LAYOUT_V3_1.decode(buffer);
  const obligation = {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const StakeObligationParserV4 = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);

  const {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
    rewardDebtB,
  } = USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.decode(buffer);
  const obligation = {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
    rewardDebtB,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const StakeObligationParserV5 = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);

  const {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
    rewardDebtB,
  } = USER_STAKE_INFO_ACCOUNT_LAYOUT_V5.decode(buffer);
  const obligation = {
    state,
    poolId,
    stakerOwner,
    depositBalance,
    rewardDebt,
    rewardDebtB,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

export const StakeInfoObligationParser = (pubkey: any, info: any) => {
  const buffer = Buffer.from(info.data);

  const {
    rewardPerBlock,
  } = STAKE_INFO_LAYOUT.decode(buffer);
  const obligation = {
    rewardPerBlock,
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};