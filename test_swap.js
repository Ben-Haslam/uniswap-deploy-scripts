const Factory = require('./node_modules/@uniswap/v2-core/build/UniswapV2Factory.json'); 
const Pair = require('./node_modules/@uniswap/v2-core/build/UniswapV2Pair.json');
const Router = require('./node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json');
const ERC20 = require('./node_modules/@openzeppelin/contracts/build/contracts/ERC20.json');
const WETH = require('./node_modules/canonical-weth/build/contracts/WETH9.json');

//-------------------------------------------------------------------

function getCliArg(argName){
    Arg =  [process.argv[Number (process.argv.indexOf(`--${argName}`) + 1)]]
    return String(Arg)
} // expects arg to exist


console.log( '----------------------')
const node_url = getCliArg('node_url')
const Web3 = require('web3');
const web3 = new Web3(node_url);

// Variables
const prvkey = getCliArg('prvkey');
const router_address = getCliArg('router_address');
const tokenA_address = getCliArg('tokenA_address');
const tokenB_address = getCliArg('tokenB_address');
const weth_address = getCliArg('weth_address');
const factory_address = getCliArg('factory_address');


// For swapping an exact ammount
const amountIn = web3.utils.toWei(getCliArg('amountIn'), 'ether');
const amountOutMin = web3.utils.toWei(getCliArg('amountOutMin'), 'ether');

// For swapping to an exact ammount
const amountInMax = web3.utils.toWei(getCliArg('amountInMax'), 'ether');
const amountOut = web3.utils.toWei(getCliArg('amountOut'), 'ether');

// choose which swap function
const which_swap = getCliArg('which_swap');

// Let swap be A to swap token A > token B, B to swap token B > token A.
// If using ETH/AUT, let swap be A to swap too/from token A, B to swap too/from token B.
const swap = getCliArg('swap')

function Kfunc(){
    if (swap=='A'){
        const K = new Boolean (true);
        return K
    }else if (swap=='B'){
        const K = new Boolean (false);
        return K
    }
}

// K is a boolean that decides direction of swap
const K = Kfunc();

// choose which quote function
const which_quote = getCliArg('which_quote');

const quote = getCliArg('quote');

//-------------------------------------------------------------------

// const Web3 = require('web3');
// const web3 = new Web3('https://rpc4.bakerloo.autonity.network:8545');

// // Variables
// const prvkey = '<>';
// const router_address = '0xe34468D6698a8720464ebbb36bD2D43B07aBfEb0';
// const tokenA_address = '0x395e91dD43afaC4712bA93012D3764CDa0Ac8b2a';
// const tokenB_address = '0x1260d09f3fc0E270eE85C0CD77C764A314274980';
// const weth_address = '0x846f338293cEb0e219000609B5d3041b2A18950E';
// const factory_address = '0x8A32C557FEdd59AbbE1079bFF27c60A967E5E0aB';


// // For swapping an exact ammount
// const amountIn = web3.utils.toWei('1000', 'ether');
// const amountOutMin = 0

// // For swapping to an exact ammount
// const amountInMax = web3.utils.toWei('1000', 'ether');
// const amountOut = web3.utils.toWei('500', 'ether');

// const which_swap = 1;
// // choose which swap function

// const swap = true;
// // Let swap be true to swap token A, false to swap token B.
// // If using ETH, let swap be true to swap too/from token A, false to swap too/from token B.

//-------------------------------------------------------------------


// Functions


async function approve(tokenContract, spender, amount, sender) {
    try {
        await tokenContract.methods.approve(spender, amount).send({ from: sender, gas: 10000000})
        .on('transactionHash', function (hash) {
            console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the approve transaction reverted! Lets see why...');

        await tokenContract.methods.approve(spender, amount).call({ from: sender, gas: 10000000});
    }

};


async function ExactTokensForTokens (router, amountIn, amountOutMin, tokenA_address, tokenB_address, myAddress, deadline, K) {

    if (K == true){
        tokens = [tokenA_address, tokenB_address];
        } else {
        tokens = [tokenB_address, tokenA_address];
        }

    const transfer = await router.methods.swapExactTokensForTokens( amountIn, amountOutMin, tokens, myAddress, deadline ).call({
        from: myAddress,
        gas: 10000000
    })

    console.log( '----------------------')
    console.log('amount in: ',  web3.utils.fromWei(transfer[0]));
    console.log('amount out: ',  web3.utils.fromWei(transfer[1]));

    try {
        await router.methods.swapExactTokensForTokens( amountIn, amountOutMin, tokens, myAddress, deadline ).send({
            from: myAddress,
            gas: 10000000
        // })
        // .on('transactionHash', function (hash) {
        //     console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the swapExactTokensForTokens transaction reverted! Lets see why...');

        await router.methods.swapExactTokensForTokens( amountIn, amountOutMin, tokens, myAddress, deadline ).call({
            from: myAddress,
            gas: 10000000
        });
    }

    const factory = new web3.eth.Contract(Factory.abi, factory_address);
    const pairAddress = await factory.methods.getPair(tokenA_address, tokenB_address).call({ from: myAddress, gas: 10000000});

    console.log( '----------------------')
    console.log('tokenA Address', tokenA_address);
    console.log('tokenB Address', tokenB_address);
    console.log('pairAddress', pairAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call({ from: myAddress, gas: 10000000});

    console.log('reserves for token A', web3.utils.fromWei(reserves._reserve0));
    console.log('reserves for token B', web3.utils.fromWei(reserves._reserve1));
    console.log( '----------------------')

}

async function TokensForExactTokens (router, amountInMax, amountOut, tokenA_address, tokenB_address, myAddress, deadline, K) {

    if (K == true){
        tokens = [tokenA_address, tokenB_address];
        } else {
        tokens = [tokenB_address, tokenA_address];
        }
    
    const transfer = await router.methods.swapTokensForExactTokens ( amountOut, amountInMax, tokens, myAddress, deadline ).call({
        from: myAddress,
        gas: 10000000
    })

    console.log( '----------------------')
    console.log('amount in: ',  web3.utils.fromWei(transfer[0]));
    console.log('amount out: ',  web3.utils.fromWei(transfer[1]));

    try {
        await router.methods.swapTokensForExactTokens ( amountOut, amountInMax, tokens, myAddress, deadline ).send({
            from: myAddress,
            gas: 10000000
        // })
        // .on('transactionHash', function (hash) {
        //     console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the swapTokensForExactTokens transaction reverted! Lets see why...');

        await router.methods.swapTokensForExactTokens( amountOut, amountInMax, tokens, myAddress, deadline ).call({
            from: myAddress,
            gas: 10000000
        });
    }

    const factory = new web3.eth.Contract(Factory.abi, factory_address);
    const pairAddress = await factory.methods.getPair(tokenA_address, tokenB_address).call({ from: myAddress, gas: 10000000});

    console.log( '----------------------')
    console.log('tokenA Address', tokenA_address);
    console.log('tokenB Address', tokenB_address);
    console.log('pairAddress', pairAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call({ from: myAddress, gas: 10000000});

    console.log('reserves for token A', web3.utils.fromWei(reserves._reserve0));
    console.log('reserves for token B', web3.utils.fromWei(reserves._reserve1));
    console.log( '----------------------')

}

async function ExactETHForTokens (router, amountIn, amountOutMin, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K) {

    if (K == true){
        token_address = tokenA_address;
        } else {
        token_address = tokenB_address;
        }
    
    tokens = [weth_address, token_address];

    const transfer = await router.methods.swapExactETHForTokens( amountOutMin, tokens, myAddress, deadline ).call({
        from: myAddress,
        gas: 10000000,
        value: amountIn
    })

    console.log( '----------------------')
    console.log('amount in: ',  web3.utils.fromWei(transfer[0]));
    console.log('amount out: ',  web3.utils.fromWei(transfer[1]));

    try {

        await router.methods.swapExactETHForTokens( amountOutMin, tokens, myAddress, deadline ).send({
            from: myAddress,
            gas: 10000000,
            value: amountIn
        // })
        // .on('transactionHash', function (hash) {
        //     console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the swapExactETHForTokens transaction reverted! Lets see why...');

        await router.methods.swapExactETHForTokens( amountOutMin, tokens, myAddress, deadline ).call({
            from: myAddress,
            gas: 10000000,
            value: amountIn
        });
    }

    const factory = new web3.eth.Contract(Factory.abi, factory_address);
    const pairAddress = await factory.methods.getPair(token_address, weth_address).call({ from: myAddress, gas: 10000000});

    console.log( '----------------------')
    console.log('token Address', token_address);
    console.log('weth_address', weth_address);
    console.log('pairAddress', pairAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call({ from: myAddress, gas: 10000000});

    console.log('reserves for token', web3.utils.fromWei(reserves._reserve0));
    console.log('reserves for WETH', web3.utils.fromWei(reserves._reserve1));
    console.log( '----------------------')

}


async function ETHForExactTokens (router, amountInMax, amountOut, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K) {

    if (K == true){
        token_address = tokenA_address;
        } else {
        token_address = tokenB_address;
        }
    
    tokens = [weth_address, token_address];

    const transfer = await router.methods.swapETHForExactTokens( amountOut, tokens, myAddress, deadline ).call({
        from: myAddress,
        gas: 10000000,
        value: amountInMax
    })
    console.log( '----------------------')
    console.log('amount in: ',  web3.utils.fromWei(transfer[0]));
    console.log('amount out: ',  web3.utils.fromWei(transfer[1]));    

    try {

        await router.methods.swapETHForExactTokens( amountOut, tokens, myAddress, deadline ).send({
            from: myAddress,
            gas: 10000000,
            value: amountInMax
        // })
        // .on('transactionHash', function (hash) {
        //     console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the swapETHForExactTokens transaction reverted! Lets see why...');

        await router.methods.swapETHForExactTokens( amountOut, tokens, myAddress, deadline ).call({
            from: myAddress,
            gas: 10000000,
            value: amountInMax
        });
    }


    const factory = new web3.eth.Contract(Factory.abi, factory_address);
    const pairAddress = await factory.methods.getPair(token_address, weth_address).call({ from: myAddress, gas: 10000000});

    console.log( '----------------------')
    console.log('token Address', token_address);
    console.log('weth_address', weth_address);
    console.log('pairAddress', pairAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call({ from: myAddress, gas: 10000000});

    console.log('reserves for token', web3.utils.fromWei(reserves._reserve0));
    console.log('reserves for WETH', web3.utils.fromWei(reserves._reserve1));
    console.log( '----------------------')

}


async function ExactTokensForETH (router, amountIn, amountOutMin, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K) {

    if (K == true){
        token_address = tokenA_address;
        } else {
        token_address = tokenB_address;
        }
    
    tokens = [token_address, weth_address];

    const transfer = await router.methods.swapExactTokensForETH( amountIn, amountOutMin, tokens, myAddress, deadline ).call({
        from: myAddress,
        gas: 10000000
    })

    console.log( '----------------------')
    console.log('amount in: ',  web3.utils.fromWei(transfer[0]));
    console.log('amount out: ',  web3.utils.fromWei(transfer[1]));    

    try {

        await router.methods.swapExactTokensForETH( amountIn, amountOutMin, tokens, myAddress, deadline ).send({
            from: myAddress,
            gas: 10000000
        // })
        // .on('transactionHash', function (hash) {
        //     console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the swapExactTokensForETH transaction reverted! Lets see why...');

        await router.methods.swapExactTokensForETH( amountIn, amountOutMin, tokens, myAddress, deadline ).call({
            from: myAddress,
            gas: 10000000
        });
    }

    const factory = new web3.eth.Contract(Factory.abi, factory_address);
    const pairAddress = await factory.methods.getPair(token_address, weth_address).call({ from: myAddress, gas: 10000000});

    console.log( '----------------------')
    console.log('token Address', token_address);
    console.log('weth_address', weth_address);
    console.log('pairAddress', pairAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call({ from: myAddress, gas: 10000000});

    console.log('reserves for token', web3.utils.fromWei(reserves._reserve0));
    console.log('reserves for WETH', web3.utils.fromWei(reserves._reserve1));
    console.log( '----------------------')

}


async function TokensForExactETH (router, amountInMax, amountOut, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K) {

    if (K == true){
        token_address = tokenA_address;
        } else {
        token_address = tokenB_address;
        }
    
    tokens = [token_address, weth_address];

    const transfer = await router.methods.swapTokensForExactETH( amountOut, amountInMax, tokens, myAddress, deadline ).call({
        from: myAddress,
        gas: 10000000
    })

    console.log( '----------------------')
    console.log('amount in: ',  web3.utils.fromWei(transfer[0]));
    console.log('amount out: ',  web3.utils.fromWei(transfer[1]));  

    try {

        await router.methods.swapTokensForExactETH( amountOut, amountInMax, tokens, myAddress, deadline ).send({
            from: myAddress,
            gas: 10000000
        // })
        // .on('transactionHash', function (hash) {
        //     console.log('transaction hash', hash);
        // })
        // .on('receipt', function (receipt) {
        //     console.log('receipt', receipt);
        });
    } catch (err) {
        console.log('the swapTokensForExactETH transaction reverted! Lets see why...');

        await router.methods.swapTokensForExactETH( amountOut, amountInMax, tokens, myAddress, deadline ).call({
            from: myAddress,
            gas: 10000000
        });
    }


    const factory = new web3.eth.Contract(Factory.abi, factory_address);
    const pairAddress = await factory.methods.getPair(token_address, weth_address).call({ from: myAddress, gas: 10000000});

    console.log( '----------------------')
    console.log('token Address', token_address);
    console.log('weth_address', weth_address);
    console.log('pairAddress', pairAddress);

    const pair = new web3.eth.Contract(Pair.abi, pairAddress);

    const reserves = await pair.methods.getReserves().call({ from: myAddress, gas: 10000000});

    console.log('reserves for token', web3.utils.fromWei(reserves._reserve0));
    console.log('reserves for WETH', web3.utils.fromWei(reserves._reserve1));
    console.log( '----------------------')

}


// Quote functions

async function getAmountsOut (router, amountIn, tokenA_address, tokenB_address, weth_address, myAddress, K) {

    console.log( '----------------------')
    console.log('getAmountsOut');

    if (quote=='A'){
        tokens = [tokenA_address, tokenB_address, weth_address];
        token0 = 'tokenA: ';
        token1 = 'tokenB: ';
        token2 = 'Aut: ';
    }else if (quote=='B'){
        tokens = [tokenB_address, tokenA_address, weth_address];
        token0 = 'tokenB: ';
        token1 = 'tokenA: ';
        token2 = 'Aut: ';
    }else if  (quote=='AUT'){
        tokens = [weth_address, tokenA_address, tokenB_address];
        token0 = 'Aut: ';
        token1 = 'tokenA: ';
        token2 = 'tokenB: ';
    }

    const amount_out = await router.methods.getAmountsOut( amountIn, tokens).call({ from: myAddress, gas: 10000000});

    console.log ('amount in of ', token0, web3.utils.fromWei(amount_out[0], 'ether'));
    console.log ('amount out of ', token1, web3.utils.fromWei(amount_out[1], 'ether'));
    console.log ('amount out of ', token2, web3.utils.fromWei(amount_out[2], 'ether'));
    console.log( '----------------------')
}


async function getAmountsIn (router, amountOut, tokenA_address, tokenB_address, weth_address, myAddress, K) {

    console.log( '----------------------')
    console.log('getAmountsIn');

    if (quote=='A'){
        tokens = [weth_address, tokenB_address, tokenA_address];
        token0 = 'Aut: ';
        token1 = 'tokenB: ';
        token2 = 'tokenA: ';
    }else if (quote=='B'){
        tokens = [weth_address, tokenA_address, tokenB_address];
        token0 = 'Aut: ';
        token1 = 'tokenA: ';
        token2 = 'tokenB: ';
    }else if  (quote=='AUT'){
        tokens = [tokenA_address, tokenB_address, weth_address];
        token0 = 'tokenA: ';
        token1 = 'tokenB: ';
        token2 = 'Aut: ';
    }

    const amount_in = await router.methods.getAmountsIn( amountOut, tokens).call({ from: myAddress, gas: 10000000});

    console.log ('amount out of ', token2, web3.utils.fromWei(amount_in[2], 'ether'));
    console.log ('amount in of ', token0, web3.utils.fromWei(amount_in[0], 'ether'));
    console.log ('amount in of ', token1, web3.utils.fromWei(amount_in[1], 'ether'));
    console.log( '----------------------')
}



async function test() {

    // Set it all up

    const id = await web3.eth.net.getId();
    const account = web3.eth.accounts.wallet.add(prvkey);
    const myAddress = web3.utils.toChecksumAddress(account.address);

    console.log ('myaddress: ', myAddress)
    // Add the tokens

    tokenA = new web3.eth.Contract(ERC20.abi, tokenA_address);
    tokenB = new web3.eth.Contract(ERC20.abi, tokenB_address);
    weth = new web3.eth.Contract(WETH.abi, weth_address);


    console.log('tokenA address: ', tokenA.options.address);
    console.log('tokenB address: ', tokenB.options.address);

    // Add the Router

    let router = new web3.eth.Contract(Router.abi, router_address);
    console.log ('router address: ', router.options.address)

    // approve the tokens
    console.log( '----------------------')
    console.log('Start Approvals')
    console.log( '----------------------')

    await approve(tokenA, router.options.address, amountInMax, myAddress);
    await approve(tokenB, router.options.address, amountInMax, myAddress);
    await approve(weth, router.options.address, amountInMax, myAddress);

    console.log( '----------------------')

    // Deadline

    var BN = web3.utils.BN;
    const time = (Math.floor(Date.now()/1000) + 200000);
    const deadline = new BN(time);


    // Get a quote
    console.log ('QUOTE');

    if (which_quote == 0) {
        await getAmountsOut (router, amountIn, tokenA_address, tokenB_address, weth_address, myAddress, K);

    } else if (which_quote == 1){
        await getAmountsIn (router, amountOut, tokenA_address, tokenB_address, weth_address, myAddress, K);

    } else { console.log ('That number is not an option, if you want to quote please select quote function 0-1.')}

    // Make the (ETH) swap
    console.log('SWAPFUNCTION');

    
    if (which_swap == 0) {
        await ExactTokensForTokens (router, amountIn, amountOutMin, tokenA_address, tokenB_address, myAddress, deadline, K);

    } else if (which_swap == 1) {
        await TokensForExactTokens (router, amountInMax, amountOut, tokenA_address, tokenB_address, myAddress, deadline, K);
    
    } else if (which_swap == 2) {
        await ExactETHForTokens (router, amountIn, amountOutMin, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K);

    } else if (which_swap == 3) {
        await ETHForExactTokens (router, amountInMax, amountOut, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K);

    } else if (which_swap == 4) {
        await ExactTokensForETH (router, amountIn, amountOutMin, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K);

    } else if (which_swap == 5) {
        await TokensForExactETH (router, amountInMax, amountOut, tokenA_address, tokenB_address, weth_address, myAddress, deadline, K);
    
    } else { console.log('That number is not an option, if you want to make a swap please select swap function 0-5.')}
};


test();