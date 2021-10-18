const Web3 = require("web3");
const Factory = require("./node_modules/@uniswap/v2-core/build/UniswapV2Factory.json");
const Router = require("./node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json");
const ERC20 = require("./node_modules/@openzeppelin/contracts/build/contracts/ERC20PresetFixedSupply.json");
const Pair = require("./node_modules/@uniswap/v2-core/build/UniswapV2Pair.json");
const WETH = require("./node_modules/canonical-weth/build/contracts/WETH9.json");

const RPC = "https://rpc3.bakerloo.autonity.network:8545";
const prvKey =
  "ebe1978d0906698b98f20e26cd861c72431cc6ee67e636ab15ede06970556ab7";

const gaslimit = 10000000;
const GasPrice = 1;

// deploy Weth

async function deployWeth(web3, sender) {
  let weth = new web3.eth.Contract(WETH.abi);

  weth = await weth
    .deploy({ data: WETH.bytecode })
    .send({ from: sender, gas: gaslimit, gasprice: GasPrice });

  console.log("Weth address", weth.options.address);

  return weth.options.address;
}

// deploy two ERC20 contracts
async function deployTokens(web3, sender) {
  let tokenA = new web3.eth.Contract(ERC20.abi);
  let tokenB = new web3.eth.Contract(ERC20.abi);

  tokenA = await tokenA
    .deploy({
      data: ERC20.bytecode,
      arguments: [
        "tokenA",
        "TA",
        // 18,
        web3.utils.toWei("9999999999999999999", "ether"),
        sender,
      ],
    })
    .send({ from: sender, gas: gaslimit, gasprice: GasPrice });

  console.log("tokenA address", tokenA.options.address);

  tokenB = await tokenB
    .deploy({
      data: ERC20.bytecode,
      arguments: [
        "tokenB",
        "TB",
        // 18,
        web3.utils.toWei("9999999999999999999", "ether"),
        sender,
      ],
    })
    .send({ from: sender, gas: gaslimit, gasprice: GasPrice });

  console.log("tokenB address", tokenB.options.address);

  return [tokenA.options.address, tokenB.options.address];
}

// deploy a uniswapV2Router
async function deployRouter(web3, factoryAddress, wethAddress, sender) {
  let router = new web3.eth.Contract(Router.abi);
  router = await router
    .deploy({ data: Router.bytecode, arguments: [factoryAddress, wethAddress] })
    .send({ from: sender, gas: gaslimit, gasprice: GasPrice });

  console.log("router address", router.options.address);

  return router.options.address;
}

// deploy a uniswapV2Factory
async function deployFactory(web3, feeToSetter, sender) {
  let factory = new web3.eth.Contract(Factory.abi);

  console.log(sender);
  factory = await factory
    .deploy({ data: Factory.bytecode, arguments: [feeToSetter] })
    .send({ from: sender, gas: gaslimit, gasprice: GasPrice });

  console.log("factory address", factory.options.address);

  return factory.options.address;
}

async function approve(tokenContract, spender, amount, sender) {
  try {
    await tokenContract.methods
      .approve(spender, amount)
      .send({ from: sender, gas: gaslimit, gasprice: GasPrice })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
      })
      .on("receipt", function (receipt) {
        console.log("receipt", receipt);
      });
  } catch (err) {
    console.log("the approve transaction reverted! Lets see why...");

    await tokenContract.methods
      .approve(spender, amount)
      .call({ from: sender, gas: gaslimit, gasprice: GasPrice });
  }
}

// check some stuff on a deployed uniswapV2Pair
async function checkPair(
  web3,
  factoryContract,
  tokenAAddress,
  tokenBAddress,
  sender,
  routerAddress
) {
  try {
    console.log("tokenAAddress: ", tokenAAddress);
    console.log("tokenBAddress: ", tokenBAddress);

    const pairAddress = await factoryContract.methods
      .getPair(tokenAAddress, tokenBAddress)
      .call();

    console.log("tokenA Address", tokenAAddress);
    console.log("tokenA Address", tokenBAddress);
    console.log("pairAddress", pairAddress);
    console.log("router address", routerAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call();

    console.log("reserves for token A", web3.utils.fromWei(reserves._reserve0));
    console.log("reserves for token B", web3.utils.fromWei(reserves._reserve1));
  } catch (err) {
    console.log("the check pair reverted! Lets see why...");
    console.log(err);
  }
}

// the most amazing function on earth
async function foo() {
  const web3 = new Web3(RPC);

  const id = await web3.eth.net.getId();

  const account = web3.eth.accounts.wallet.add(prvKey);
  const myAddress = web3.utils.toChecksumAddress(account.address);

  const wethAddress = await deployWeth(web3, myAddress);
  const weth = new web3.eth.Contract(WETH.abi, wethAddress);

  const factoryAddress = await deployFactory(web3, myAddress, myAddress);
  const factory = new web3.eth.Contract(Factory.abi, factoryAddress);

  console.log("Router!");

  const routerAddress = await deployRouter(
    web3,
    factoryAddress,
    wethAddress,
    myAddress
  );
  const router = new web3.eth.Contract(Router.abi, routerAddress);

  // const multicallAddress = await deployMulticall(web3, myAddress);
  // const multicall = new web3.eth.Contract(Multicall.abi, multicallAddress);

  const [tokenAAddress, tokenBAddress] = await deployTokens(web3, myAddress);

  const tokenA = new web3.eth.Contract(ERC20.abi, tokenAAddress);
  const tokenB = new web3.eth.Contract(ERC20.abi, tokenBAddress);

  console.log("tokenA", tokenA.options.address);
  console.log("tokenB", tokenB.options.address);

  // liquidity
  const amountADesired = web3.utils.toWei("10000000", "ether");
  const amountBDesired = web3.utils.toWei("10000000", "ether");
  const amountAMin = web3.utils.toWei("0", "ether");
  const amountBMin = web3.utils.toWei("0", "ether");

  // deadline
  var BN = web3.utils.BN;
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = new BN(time);

  // before calling addLiquidity we need to approve the router
  // we need to approve atleast amountADesired and amountBDesired
  const spender = router.options.address;
  const amountA = amountADesired;
  const amountB = amountBDesired;

  await approve(tokenA, spender, amountA, myAddress);
  await approve(tokenB, spender, amountB, myAddress);
  await approve(weth, wethAddress, amountA, myAddress);
  await approve(weth, spender, amountA, myAddress);

  // try to add liquidity to a non-existen pair contract
  try {
    await router.methods
      .addLiquidity(
        tokenAAddress,
        tokenBAddress,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        myAddress,
        deadline
      )
      .send({
        from: myAddress,
        gas: gaslimit,
        gasprice: GasPrice,
      })
      .on("transactionHash", function (hash) {
        console.log("transaction hash", hash);
      })
      .on("receipt", function (receipt) {
        console.log("receipt", receipt);
      });
  } catch (err) {
    console.log("the addLiquidity transaction reverted! Lets see why...");

    await router.methods
      .addLiquidity(
        tokenAAddress,
        tokenBAddress,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        myAddress,
        deadline
      )
      .call({
        from: myAddress,
        gas: gaslimit,
        gasprice: GasPrice,
      });
  }

  await checkPair(
    web3,
    factory,
    tokenAAddress,
    tokenBAddress,
    myAddress,
    routerAddress
  );
}

foo();
