import {PublicKey, Connection} from "@solana/web3.js"
import * as SPLToken from '@solana/spl-token'
import axios from 'axios'
import {decodeMetadata, findMetaDataProgramAddress} from './metadata'
import {TOKEN_PROGRAM_ID} from '../const'

export const getTokenAccountsByOwner = async (account: string) => {
  const mainnetUrl = "https://api.mainnet-beta.solana.com";
  const params = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getTokenAccountsByOwner',
    params: [
      account,
      {
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      },
      {
        encoding: 'jsonParsed',
      },
    ],
  };

  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: params ? JSON.stringify(params) : null,
  };

  try {
    let response = await axios.post(mainnetUrl, params);
    if (response.status === 200) {
      return response.data.result.value;
    }
  } catch (e) {
    console.log('getTokenAccountsByOwner err:::', e);
  }
};

export const getAccountNFTToken = async (account: string) => {
  // const response = await connection.getTokenAccountsByOwner(
  //   new PublicKey(account),
  //   {
  //     programId: TOKEN_PROGRAM_ID,
  //   }
  // );
  // // need to filter by decimal
  // const NFTTokenList = response.value.map((e) => {
  //   // console.log(`pubkey: ${e.pubkey.toBase58()}`);
  //   const accountInfo = SPLToken.AccountLayout.decode(e.account.data);
  //   // console.log({accountInfo})
  //   // console.log(`mint: ${new PublicKey(accountInfo.mint)}`);
  //   // console.log(`amount: ${SPLToken.u64.fromBuffer(accountInfo.amount)}`);
  //   return {mint: new PublicKey(accountInfo.mint)}
  // });
  const tokenAccountList = await getTokenAccountsByOwner(account)
  const NFTTokenList = tokenAccountList.map((tokenAccount: any) => {
    const {tokenAmount, mint} = tokenAccount.account.data.parsed.info
    if (tokenAmount.decimals === 0 && tokenAmount.amount === '1') {
      return {mint, amount: tokenAmount.amount, decimals: tokenAmount.decimals}
    }
  })
  return NFTTokenList
}

export const getMetaData = async (connection: Connection, mintAddress: string) => {
  const m = await findMetaDataProgramAddress(mintAddress);
  // get the account info for that account
  const accInfo = await connection.getAccountInfo(m);

  // finally, decode metadata
  if (accInfo) {
    const metaData = decodeMetadata(accInfo!.data)
    return metaData
  }
}