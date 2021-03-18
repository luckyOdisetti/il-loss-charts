import dotenv from 'dotenv';
dotenv.config();

import Mixpanel from 'mixpanel';
let mixpanel: Mixpanel.Mixpanel;
import fetch from 'node-fetch';

var MS_PER_MINUTE = 60000;
var key = process.env.ETHPLORER_KEY || 'freekey';

var ADD_TRANSACTION_HASH = '0xFd8A61F94604aeD5977B31930b48f1a94ff3a195';
var REMOVE_TRANSACTION_HASH = '0x418915329226AE7fCcB20A2354BbbF0F6c22Bd92';

if (key == 'freekey') {
  console.log('Limited results without official ethplorer key.');
}

if (process.env.MIXPANEL_TOKEN) {
    mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
} else {
    throw new Error(`Cannot start il alerts mixpanel liquidity bot without mixpanel token.`);
}

interface AddressTransaction {
  timestamp: Date;
  from: string;
  to: string;
  hash: string;
  value: number;
  input: string;
  success: boolean;
}

async function getTransactionData(transactionType: string, hash: string): Promise<void> {
  var oneHoursBefore = Date.now() - (MS_PER_MINUTE * 60);

  var addPath ='https://api.ethplorer.io/getAddressTransactions/'
  var fullPath = `${addPath}${hash}?apiKey=${
      key
  }&limit=200&timestamp=${
    oneHoursBefore
  }`

  const res = await fetch(fullPath);
  const data = await res.json();

  data.forEach(function (addressTransaction: AddressTransaction) {
    console.log(addressTransaction.timestamp);

    mixpanel.track(`UniswapLiquidity:${transactionType}`, {
      distinct_id: addressTransaction.from,
      timestamp: addressTransaction.timestamp,
      to: addressTransaction.to,
      from: addressTransaction.from,
      hash: addressTransaction.hash,
      value: addressTransaction.value,
      success: addressTransaction.success
    });
  });
}

async function getData() {
  await getTransactionData('add', ADD_TRANSACTION_HASH);
  await getTransactionData('remove', REMOVE_TRANSACTION_HASH);
}

getData();
