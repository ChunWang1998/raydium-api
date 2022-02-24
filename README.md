# Solana aggregate API

## install
```js
npm install
npm install -g typescript
```

## build
```js
rm -rf dist && npm run build && npm run test 
```

## npm install package
```js
npm install git+https://github.com/UniOasis/solana-api.git
```

## get liquidity balance 

### function 
getRaydiumUserLiquidityBalance()

### input
- connection(refer: test.js)
- Owner account #string

### output
- type #string
- mintAddress #string
- poolToken #string
- poolBaseValue #string
- poolQuoteValue #string

### example successful output
![image](https://github.com/UniOasis/solana-api/blob/develop/%E6%88%AA%E5%9C%96%202022-01-30%20%E4%B8%8B%E5%8D%889.10.12.png)

### example code 
```js
const { getRaydiumUserLiquidityBalance } = require("solana-api")
const { Connection } = require('@solana/web3.js')
async function test() {
    const API_ENDPOINT = "https://solana-api.projectserum.com";
    let connection = new Connection(API_ENDPOINT);
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
    for (var testAccount of testAccounts) {
        console.log(await getRaydiumUserLiquidityBalance(connection, testAccount.testAccount))
    }
};
test()
```

## get farm balance 

### function 
getRaydiumUserFarmBalance()

### input
- connection(refer: test.js)
- Owner account #string

### output
- type #string
- mintAddress #string
- poolToken #string
- poolBaseReward #string
- poolQuoteReward #string
- poolBaseValue #string
- poolQuoteValue #string


### example successful output
single reward:

![image](https://github.com/UniOasis/solana-api/blob/develop/%E6%88%AA%E5%9C%96%202022-01-30%20%E4%B8%8B%E5%8D%889.09.54.png)

dual reward:

![image](https://github.com/UniOasis/solana-api/blob/develop/%E6%88%AA%E5%9C%96%202022-01-30%20%E4%B8%8B%E5%8D%889.10.02.png)

### example code 
```js
const { getRaydiumUserFarmBalance } = require("solana-api")
const { Connection } = require('@solana/web3.js')
async function test() {
    const API_ENDPOINT = "https://solana-api.projectserum.com";
    let connection = new Connection(API_ENDPOINT);
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
    for (var testAccount of testAccounts) {
        console.log(await getRaydiumUserFarmBalance(connection, testAccount.testAccount))
    }
};
test()
```

## get stake balance 

### function 
getRaydiumUserStakeBalance()

### input
- connection(refer: test.js)
- Owner account #string

### output
- type #string
- mintAddress #string
- poolToken #string
- poolReward #string

### example successful output
![image](https://github.com/UniOasis/solana-api/blob/develop/%E6%88%AA%E5%9C%96%202022-01-30%20%E4%B8%8B%E5%8D%889.24.14.png)

### example code 
```js
const { getRaydiumUserStakeBalance } = require("solana-api")
const { Connection } = require('@solana/web3.js')
async function test() {
    const API_ENDPOINT = "https://solana-api.projectserum.com";
    let connection = new Connection(API_ENDPOINT);
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
    for (var testAccount of testAccounts) {
        console.log(await getRaydiumUserStakeBalance(connection, testAccount.testAccount))
    }
};
test()
```

## find pair token in pool

### function
findRaydiumPairTokenInPool()

### input
- tokenMintAddr #string
- API data #array

API data 可以由getRaydiumPairAPIData() 產生

若是要找sol的pair token mint address要輸入TOKENS['WSOL'].mintAddress

### output
- anotherTokenMintAddr #string
- lpMintAddr #string
- ammId #string
- liquidity #int

### example successful output
![image](https://github.com/UniOasis/solana-api/blob/develop/%E6%88%AA%E5%9C%96%202022-01-20%20%E4%B8%8B%E5%8D%8810.51.18.png)

### example code 
```js
const {findRaydiumPairTokenInPool, TOKENS, getRaydiumPairAPIData } = require("solana-api")

async function testfindRaydiumPairTokenInPool() {
    let tokenMintAddrs = [];
    const APIdata = await getRaydiumPairAPIData()

    tokenMintAddrs.push(
      {
        tokenMintAddr: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"//ray
      },
      {
        tokenMintAddr: TOKENS['WSOL'].mintAddress
      }
    )

    for (var tokenMintAddr of tokenMintAddrs) {
      console.log(await findRaydiumPairTokenInPool({ tokenMintAddr: tokenMintAddr.tokenMintAddr, data: APIdata }));
    }


  };
  testfindRaydiumPairTokenInPool()

```

## count slippage(price impact)

出來的priceImpact正常來說應該要和raydium swap的一樣,但有可能會不同,原因是raydium會用不同的Swapping Through,之後會新增透過serum dex來swap,以及以類似1inch 的方式來swap

### function
slippageCnt()

### input
- aIn #string
- lpMintAddress #string
- tokenMintAddr #string

### output
- aIn #string
- aOut #string
- lpMintAddress #string
- priceImpact #string

### example successful output
![image](https://github.com/UniOasis/solana-api/blob/develop/%E6%88%AA%E5%9C%96%202022-01-20%20%E4%B8%8B%E5%8D%882.23.57.png)

### example code 
```jsconst { Connection } = require('@solana/web3.js')
const { slippageCnt ,TOKENS} = require("solana-api")
const API_ENDPOINT = "https://solana-api.projectserum.com";
const CONNECTION = new Connection(API_ENDPOINT);
async function testSlippageCnt() {
    aIn = "1";
    testSlippageCases = [];
    testSlippageCases.push(
        {
            aIn: "1",
            lpMintAddress: "9XnZd82j34KxNLgQfz29jGbYdxsYznTWRpvZE3SRE7JG",//srm-usdc 
            tokenMintAddr: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
            //tokenMintAddr : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        {
            aIn: "1",
            lpMintAddress: "AKJHspCwDhABucCxNLXUSfEzb7Ny62RqFtC9uNjJi4fq",//srm-sol 
            //tokenMintAddr: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
            tokenMintAddr : TOKENS['WSOL'].mintAddress,//sol
        },
        {
            aIn: "1",
            lpMintAddress: "FbC6K13MzHvN42bXrtGaWsvZY9fxrackRSZcBGfjPc7m",//ray-usdc 
            tokenMintAddr: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
            //tokenMintAddr : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        }
    )
    for (testSlippageCase of testSlippageCases)
        console.log(await slippageCnt({ aIn: testSlippageCase.aIn, lpMintAddress: testSlippageCase.lpMintAddress, connection: CONNECTION, tokenMintAddr: testSlippageCase.tokenMintAddr }));
}
testSlippageCnt()
```


## Note for developer

https://docs.google.com/document/d/1opUEwVqvSTxRDtikqWAIxh0fA4-k-XKw7SDZ8mpGiKg/edit

- raydium 的farms 和 tokens要定期去更新
https://github.com/raydium-io/raydium-ui/blob/847b4f20d3146b46a761e7df78b1a0f19aeef329/src/utils/tokens.ts

https://github.com/raydium-io/raydium-ui/blob/847b4f20d3146b46a761e7df78b1a0f19aeef329/src/utils/farms.ts

若是有最新的token, 而開發者還沒更新,會跳出這樣的錯誤訊息：

```
can't find farm 8QAZXSY99fCxp9FRG9W5JL4uTkicx2C7KAaMumVKLpVA  ,please add it to farm.ts
```

- output interface 列在index上
- 可以更改test.js 上的test account來進行測試,並且拿相同addr去step搜尋看結果是否相同

