const Factory = require("./node_modules/@uniswap/v2-core/build/UniswapV2Factory.json");
const Pair = require("./node_modules/@uniswap/v2-core/build/UniswapV2Pair.json");
const Router = require("./node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json");
const ERC20 = require("./node_modules/@openzeppelin/contracts/build/contracts/ERC20.json");
const WETH = require("./node_modules/canonical-weth/build/contracts/WETH9.json");

//-------------------------------------------------------------------

function getCliArg(argName) {
  Arg = [process.argv[Number(process.argv.indexOf(`--${argName}`) + 1)]];
  return String(Arg);
} // expects arg to exist

console.log("----------------------");
const node_url = getCliArg("node_url");
const Web3 = require("web3");
const web3 = new Web3(node_url);

// Variables
const prvkey = getCliArg("prvkey");
const router_address = getCliArg("router_address");
const tokenA_address = getCliArg("tokenA_address");
const tokenB_address = getCliArg("tokenB_address");
const weth_address = getCliArg("weth_address");
const factory_address = getCliArg("factory_address");
const fund_pair = getCliArg("fund_pair");
const defund_pair = getCliArg("defund_pair");

// liquidity
const amountADesired = web3.utils.toWei(getCliArg("amountADesired"), "ether");
const amountBDesired = web3.utils.toWei(getCliArg("amountBDesired"), "ether");
const amountAUTDesired = web3.utils.toWei(
  getCliArg("amountAUTDesired"),
  "ether"
);
const amountAMin = web3.utils.toWei(getCliArg("amountAMin"), "ether");
const amountBMin = web3.utils.toWei(getCliArg("amountBMin"), "ether");
const amountAUTMin = web3.utils.toWei(getCliArg("amountAUTMin"), "ether");
const liquidity = web3.utils.toWei(getCliArg("liquidity"), "ether");

const factory = new web3.eth.Contract(Factory.abi, factory_address);

async function approve(tokenContract, spender, amount, sender) {
  try {
    await tokenContract.methods
      .approve(spender, amount)
      .send({ from: sender, gas: 10000000 })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
      });
  } catch (err) {
    console.log("the approve transaction reverted! Lets see why...");

    await tokenContract.methods
      .approve(spender, amount)
      .call({ from: sender, gas: 10000000 });
  }
}

async function addLiquidity(
  router,
  tokenA_address,
  tokenB_address,
  amountADesired,
  amountBDesired,
  amountAMin,
  amountBMin,
  myAddress,
  deadline
) {
  const transfer = await router.methods
    .addLiquidity(
      tokenA_address,
      tokenB_address,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      myAddress,
      deadline
    )
    .call({
      from: myAddress,
      gas: 10000000,
    });

  console.log("----------------------");
  console.log("tokenA in: ", web3.utils.fromWei(transfer[0]));
  console.log("tokenB in: ", web3.utils.fromWei(transfer[1]));
  console.log("liquidity tokens out: ", web3.utils.fromWei(transfer[2]));

  try {
    await router.methods
      .addLiquidity(
        tokenA_address,
        tokenB_address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        myAddress,
        deadline
      )
      .send({
        from: myAddress,
        gas: 10000000,
      })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
      });
  } catch (err) {
    console.log("the addLiquidity transaction reverted! Lets see why...");

    await router.methods
      .addLiquidity(
        tokenA_address,
        tokenB_address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        myAddress,
        deadline
      )
      .call({
        from: myAddress,
        gas: 10000000,
      });
  }

  const pairAddress = await factory.methods
    .getPair(tokenA_address, tokenB_address)
    .call({ from: myAddress, gas: 10000000 });

  console.log("----------------------");
  console.log("tokenA Address", tokenA_address);
  console.log("tokenB Address", tokenB_address);
  console.log("pairAddress", pairAddress);

  const pair = new web3.eth.Contract(Pair.abi, pairAddress);

  const reserves = await pair.methods
    .getReserves()
    .call({ from: myAddress, gas: 10000000 });

  console.log("reserves for token A", web3.utils.fromWei(reserves._reserve0));
  console.log("reserves for token B", web3.utils.fromWei(reserves._reserve1));
  console.log("----------------------");
}

async function addLiquidityETH(
  router,
  token_address,
  amountTDesired,
  amountAUTDesired,
  amountTMin,
  amountAUTMin,
  myAddress,
  deadline
) {
  const transfer = await router.methods
    .addLiquidityETH(
      token_address,
      amountTDesired,
      amountTMin,
      amountAUTMin,
      myAddress,
      deadline
    )
    .call({
      from: myAddress,
      gas: 10000000,
      value: amountAUTDesired,
    });

  console.log("----------------------");
  console.log("token in: ", web3.utils.fromWei(transfer[0]));
  console.log("AUT in: ", web3.utils.fromWei(transfer[1]));
  console.log("liquidity tokens out: ", web3.utils.fromWei(transfer[2]));

  try {
    await router.methods
      .addLiquidityETH(
        token_address,
        amountTDesired,
        amountTMin,
        amountAUTMin,
        myAddress,
        deadline
      )
      .send({
        from: myAddress,
        gas: 10000000,
        value: amountAUTDesired,
      })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
      });
  } catch (err) {
    console.log("the addLiquidityETH transaction reverted! Lets see why...");

    await router.methods
      .addLiquidityETH(
        token_address,
        amountTDesired,
        amountTMin,
        amountAUTMin,
        myAddress,
        deadline
      )
      .call({
        from: myAddress,
        gas: 10000000,
        value: amountAUTDesired,
      });
  }
  const pairAddress = await factory.methods
    .getPair(token_address, weth_address)
    .call({ from: myAddress, gas: 10000000 });

  console.log("----------------------");
  console.log("token Address", token_address);
  console.log("weth_address", weth_address);
  console.log("pairAddress", pairAddress);

  const pair = new web3.eth.Contract(Pair.abi, pairAddress);

  const reserves = await pair.methods
    .getReserves()
    .call({ from: myAddress, gas: 10000000 });

  console.log("reserves for token", web3.utils.fromWei(reserves._reserve0));
  console.log("reserves for AUT", web3.utils.fromWei(reserves._reserve1));
  console.log("----------------------");
}

async function removeLiquidity(
  router,
  tokenA_address,
  tokenB_address,
  liquidity,
  amountAMin,
  amountBMin,
  myAddress,
  deadline
) {
  const transfer = await router.methods
    .removeLiquidity(
      tokenA_address,
      tokenB_address,
      liquidity,
      amountAMin,
      amountBMin,
      myAddress,
      deadline
    )
    .call({
      from: myAddress,
      gas: 10000000,
    });

  console.log("----------------------");
  console.log("liquidity tokens in: ", web3.utils.fromWei(liquidity));
  console.log("tokenA out: ", web3.utils.fromWei(transfer[0]));
  console.log("tokenB out: ", web3.utils.fromWei(transfer[1]));

  try {
    await router.methods
      .removeLiquidity(
        tokenA_address,
        tokenB_address,
        liquidity,
        amountAMin,
        amountBMin,
        myAddress,
        deadline
      )
      .send({
        from: myAddress,
        gas: 10000000,
      })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
      });
  } catch (err) {
    console.log("the removeLiquidity transaction reverted! Lets see why...");

    await router.methods
      .removeLiquidity(
        tokenA_address,
        tokenB_address,
        liquidity,
        amountAMin,
        amountBMin,
        myAddress,
        deadline
      )
      .call({
        from: myAddress,
        gas: 10000000,
      });
  }

  const pairAddress = await factory.methods
    .getPair(tokenA_address, tokenB_address)
    .call({ from: myAddress, gas: 10000000 });

  console.log("----------------------");
  console.log("tokenA Address", tokenA_address);
  console.log("tokenB Address", tokenB_address);
  console.log("pairAddress", pairAddress);

  const pair = new web3.eth.Contract(Pair.abi, pairAddress);

  const reserves = await pair.methods
    .getReserves()
    .call({ from: myAddress, gas: 10000000 });

  console.log("reserves for token A", web3.utils.fromWei(reserves._reserve0));
  console.log("reserves for token B", web3.utils.fromWei(reserves._reserve1));

  console.log("----------------------");
}

async function removeLiquidityETH(
  router,
  token_address,
  liquidity,
  amountTMin,
  amountAUTMin,
  myAddress,
  deadline
) {
  const transfer = await router.methods
    .removeLiquidityETH(
      token_address,
      liquidity,
      amountTMin,
      amountAUTMin,
      myAddress,
      deadline
    )
    .call({
      from: myAddress,
      gas: 10000000,
    });

  console.log("----------------------");
  console.log("liquidity tokens in: ", web3.utils.fromWei(liquidity));
  console.log("token out: ", web3.utils.fromWei(transfer[0]));
  console.log("AUT out: ", web3.utils.fromWei(transfer[1]));

  try {
    await router.methods
      .removeLiquidityETH(
        token_address,
        liquidity,
        amountTMin,
        amountAUTMin,
        myAddress,
        deadline
      )
      .send({
        from: myAddress,
        gas: 10000000,
      })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
      });
  } catch (err) {
    console.log("the removeLiquidityETH transaction reverted! Lets see why...");

    await router.methods
      .removeLiquidityETH(
        token_address,
        liquidity,
        amountTMin,
        amountAUTMin,
        myAddress,
        deadline
      )
      .call({
        from: myAddress,
        gas: 10000000,
      });
  }

  const pairAddress = await factory.methods
    .getPair(token_address, weth_address)
    .call({ from: myAddress, gas: 10000000 });

  console.log("----------------------");
  console.log("token Address", token_address);
  console.log("weth_address", weth_address);
  console.log("pairAddress", pairAddress);

  const pair = new web3.eth.Contract(Pair.abi, pairAddress);

  const reserves = await pair.methods
    .getReserves()
    .call({ from: myAddress, gas: 10000000 });

  console.log("reserves for token", web3.utils.fromWei(reserves._reserve0));
  console.log("reserves for AUT", web3.utils.fromWei(reserves._reserve1));
  console.log("----------------------");
}

// the most amazing function on earth
async function main() {
  const id = await web3.eth.net.getId();

  const account = web3.eth.accounts.wallet.add(prvkey);
  const myAddress = web3.utils.toChecksumAddress(account.address);

  const router = new web3.eth.Contract(Router.abi, router_address);
  const tokenA = new web3.eth.Contract(ERC20.abi, tokenA_address);
  const tokenB = new web3.eth.Contract(ERC20.abi, tokenB_address);
  const weth = new web3.eth.Contract(WETH.abi, weth_address);

  // Pairs

  const pairAB_address = await factory.methods
    .getPair(tokenA_address, tokenB_address)
    .call({ from: myAddress, gas: 10000000 });
  const pairAB = new web3.eth.Contract(Pair.abi, pairAB_address);

  const pairAAUT_address = await factory.methods
    .getPair(tokenA_address, weth_address)
    .call({ from: myAddress, gas: 10000000 });
  const pairAAUT = new web3.eth.Contract(Pair.abi, pairAAUT_address);

  const pairBAUT_address = await factory.methods
    .getPair(tokenB_address, weth_address)
    .call({ from: myAddress, gas: 10000000 });
  const pairBAUT = new web3.eth.Contract(Pair.abi, pairBAUT_address);

  console.log("tokenA", tokenA.options.address);
  console.log("tokenB", tokenB.options.address);

  // deadline
  var BN = web3.utils.BN;
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = new BN(time);

  // before calling addLiquidity we need to approve the router
  // we need to approve atleast amountADesired and amountBDesired
  const amountA = amountADesired;
  const amountB = amountBDesired;

  // approve the tokens
  console.log("----------------------");
  console.log("Start Approvals");
  console.log("----------------------");

  if (fund_pair == "0" || fund_pair == "1" || fund_pair == "2") {
    // Only do approvals that are needed to save time
    await approve(tokenA, router_address, amountA, myAddress);
    await approve(tokenB, router_address, amountA, myAddress);
    await approve(weth, router_address, amountA, myAddress);
  }

  if (defund_pair == "0" || defund_pair == "1" || defund_pair == "2") {
    // Only do approvals that are needed to save time
    await approve(pairAB, router_address, liquidity, myAddress);
    await approve(pairAAUT, router_address, liquidity, myAddress);
    await approve(pairBAUT, router_address, liquidity, myAddress);
  }

  console.log("----------------------");

  // Add liquidity to token-token or AUT-token pair

  if (fund_pair == "0") {
    console.log("Add liquidity to tokenA-tokenB pair");
    await addLiquidity(
      router,
      tokenA_address,
      tokenB_address,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      myAddress,
      deadline
    );
  } else if (fund_pair == "1") {
    console.log("Add liquidity to tokenA-AUT pair");
    await addLiquidityETH(
      router,
      tokenA_address,
      amountADesired,
      amountAUTDesired,
      amountAMin,
      amountAUTMin,
      myAddress,
      deadline
    );
  } else if (fund_pair == "2") {
    console.log("Add liquidity to tokenB-AUT pair");
    await addLiquidityETH(
      router,
      tokenB_address,
      amountBDesired,
      amountAUTDesired,
      amountBMin,
      amountAUTMin,
      myAddress,
      deadline
    );
  } else {
    console.log("You have not chosen a pair to fund. Select 0, 1 or 2");
    console.log("----------------------");
  }

  // remove liquidity from a token-token or AUT-token pair

  if (defund_pair == "0") {
    console.log("Remove liquidity from tokenA-tokenB pair");
    await removeLiquidity(
      router,
      tokenA_address,
      tokenB_address,
      liquidity,
      amountAMin,
      amountBMin,
      myAddress,
      deadline
    );
  } else if (defund_pair == "1") {
    console.log("Remove liquidity from tokenA-AUT pair");
    removeLiquidityETH(
      router,
      tokenA_address,
      liquidity,
      amountAMin,
      amountAUTMin,
      myAddress,
      deadline
    );
  } else if (defund_pair == "2") {
    console.log("Remove liquidity from tokenB-AUT pair");
    removeLiquidityETH(
      router,
      tokenB_address,
      liquidity,
      amountBMin,
      amountAUTMin,
      myAddress,
      deadline
    );
  } else {
    console.log("You have not chosen a pair to defund. Select 0, 1 or 2");
  }
}

main();
