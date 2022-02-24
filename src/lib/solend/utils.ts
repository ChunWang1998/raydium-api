import BN from "bn.js";

// @ts-ignore
export const calculateSupplyAPY = (reserve: Reserve) => {
  const currentUtilization = calculateUtilizationRatio(reserve);
  const borrowAPY = calculateBorrowAPY(reserve);
  return currentUtilization * borrowAPY;
};

// @ts-ignore
export const calculateUtilizationRatio = (reserve: Reserve) => {
  const borrowedAmount = reserve.liquidity.borrowedAmountWads
    .div(new BN(`1${''.padEnd(18, '0')}`))
    .toNumber();
  const availableAmount = reserve.liquidity.availableAmount.toNumber();
  const currentUtilization =
    borrowedAmount / (availableAmount + borrowedAmount);
  return currentUtilization;
};

// @ts-ignore
export const calculateBorrowAPY = (reserve: Reserve) => {
  const currentUtilization = calculateUtilizationRatio(reserve);
  const optimalUtilization = reserve.config.optimalUtilizationRate / 100;
  let borrowAPY;
  if (optimalUtilization === 1.0 || currentUtilization < optimalUtilization) {
    const normalizedFactor = currentUtilization / optimalUtilization;
    const optimalBorrowRate = reserve.config.optimalBorrowRate / 100;
    const minBorrowRate = reserve.config.minBorrowRate / 100;
    borrowAPY =
      normalizedFactor * (optimalBorrowRate - minBorrowRate) + minBorrowRate;
  } else {
    const normalizedFactor =
      (currentUtilization - optimalUtilization) / (1 - optimalUtilization);
    const optimalBorrowRate = reserve.config.optimalBorrowRate / 100;
    const maxBorrowRate = reserve.config.maxBorrowRate / 100;
    borrowAPY =
      normalizedFactor * (maxBorrowRate - optimalBorrowRate) +
      optimalBorrowRate;
  }

  return borrowAPY;
};