// 'use strict';
const { describe, it } = require('mocha');
const { expect, assert } = require('chai');
const { Connection } = require('@solana/web3.js')
const { getRaydiumUserLiquidityBalance,getRaydiumUserFarmBalance, getRaydiumUserStakeBalance,findRaydiumPairTokenInPool, TOKENS, getRaydiumPairAPIData, getPoolLpTokenAmount, slippageCnt } = require('../dist/index')

describe('solana test', () => {
  let connection;
  before(() => {
    const API_ENDPOINT = "https://solana-api.projectserum.com";
    connection = new Connection(API_ENDPOINT);
  });

  it('getRaydiumUserDepositBalance', async () => {
    let testAccounts = [];
    testAccounts.push(
      {
        testAccount: 'G8TanyWHGXe7DhG7kfEMGxfrcoZYq3JTf4d5RjUhen86',//miner addr
      },
      {
        testAccount: "Gy4sp9PZE3bCddqkgf8smpa544GGSzLu3W31cURBZ4QT",//major addr
      },
      {
        testAccount: "Fv9cU218yZrHD25mbaptFG7vNs1rMLhugQgg8d3e8EhE",//developer addr
      },
      {
        testAccount: "GvZtNTE563Bhgfewxro4BbUhpeEcT4JjDnfo9szqHFBE",// test stake addr
      }
    )
    for (var testAccount of testAccounts){
      //console.log(await getRaydiumUserLiquidityBalance(connection, testAccount.testAccount))
      //console.log(await getRaydiumUserFarmBalance(connection, testAccount.testAccount))
       console.log(await getRaydiumUserStakeBalance(connection, testAccount.testAccount))
    }

    assert.isTrue(true);
  });

  // it('getRaydiumPairAPIData', async (
  // ) => {
  //   console.log(await getRaydiumPairAPIData())
  //   assert.isTrue(true);
  // });

  // it('findRaydiumPairTokenInPool', async (//delete unknown
  //   // TokenMintAddr
  //   // APIdata
  // ) => {
  //   let tokenMintAddrs = [];
  //   const APIdata = await getRaydiumPairAPIData()

  //   tokenMintAddrs.push(
  //     // {
  //     //   tokenMintAddr: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"//ray
  //     // },
  //     // {
  //     //   tokenMintAddr: TOKENS['WSOL'].mintAddress
  //     // },
  //     {
  //       tokenMintAddr:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  //     }
  //   )

  //   for (var tokenMintAddr of tokenMintAddrs) {
  //     console.log(await findRaydiumPairTokenInPool({ tokenMintAddr: tokenMintAddr.tokenMintAddr, data: APIdata }));
  //   }

  //   assert.isTrue(true);
  // });


  // it('get slippage', async (
  // ) => {
  //   testSlippageCases = [];
  //   testSlippageCases.push(
  //     // {
  //     //   aIn: "1",
  //     //   lpMintAddress: "9XnZd82j34KxNLgQfz29jGbYdxsYznTWRpvZE3SRE7JG",//srm-usdc 
  //     //   tokenMintAddr: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  //     //   //tokenMintAddr : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  //     // },
  //     // {
  //     //   aIn: "1",
  //     //   lpMintAddress: "AKJHspCwDhABucCxNLXUSfEzb7Ny62RqFtC9uNjJi4fq",//srm-sol 
  //     //   tokenMintAddr: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  //     //   //tokenMintAddr : TOKENS['WSOL'].mintAddress,
  //     // },
  //     {
  //       aIn: "1000",
  //       lpMintAddress: "FbC6K13MzHvN42bXrtGaWsvZY9fxrackRSZcBGfjPc7m",//ray-usdc 
  //       //tokenMintAddr: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  //       tokenMintAddr : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  //     }
  //   )
  //   for (testSlippageCase of testSlippageCases)
  //     console.log(await slippageCnt({ aIn: testSlippageCase.aIn, lpMintAddress: testSlippageCase.lpMintAddress, connection: connection, tokenMintAddr: testSlippageCase.tokenMintAddr }));

  // });

  // it('findRaydiumPairTokenInPool then get slippage', async (
  //   // TokenMintAddr
  //   // APIdata
  // ) => {
  //   let tokenInfos = [];
  //   tokenInfos.push(
  //     {
  //       aIn: "1",
  //       tokenMintAddr: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",//usdc
  //       //tokenMintAddr : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",//srm
  //     },
  //     // {
  //     //   aIn: "1",
  //     //   tokenMintAddr: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",//srm
  //     //   //tokenMintAddr : TOKENS['WSOL'].mintAddress,//sol
  //     // },
  //     // {
  //     //   aIn: "1000",
  //     //   tokenMintAddr: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",//ray
  //     //   //tokenMintAddr : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"//usdc
  //     // }
  //   )

  //   const APIdata = await getRaydiumPairAPIData()
  //   for (var tokenInfo of tokenInfos) {
  //     const tokens = await findRaydiumPairTokenInPool({ tokenMintAddr: tokenInfo.tokenMintAddr, data: APIdata })
  //     for (var token of tokens) {
  //       const deposited = await slippageCnt({
  //         aIn: tokenInfo.aIn,
  //         lpMintAddress: token.lpMintAddr,
  //         connection: connection,
  //         tokenMintAddr: tokenInfo.tokenMintAddr
  //       })
  //       console.log({ deposited });
  //     }
  //   }
  //   assert.isTrue(true);
  // });

});

