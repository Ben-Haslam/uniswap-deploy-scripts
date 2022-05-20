*Scripts to deploy, interact with and test unmodified Uniswap V2 contracts on an EVM blockchain*


## What is Uniswap?

ERC20 tokens can be swapped for each other on Autonity using Uniswap. A Uniswap factory deploys automated market maker contracts (pair contracts) on-chain to hold pools of both tokens, which provide the liquidity needed to make trades between the two tokens. Native Autons can also be traded in this way, using a wrapped Ether (WETH) contract, which allows Autons to be treated like an ERC20 contract. The factory and pair contracts are not easy to use, as using them directly was never intended. To call functions on the factory contract or pair contracts, a router contract is used, which has a much simpler interface, and is relatively easy to use with a web3 script.

The liquidy is supplied to the pair contracts by liquidity providers, who deposit large amounts of both tokens to set the initial trading rates and provide liquidity, in exchange for liquidity tokens which can be exchanged back for ERC20 tokens anytime. The initial time liquitity is provided for a pair sets the ideal ratio for making swaps on that pair contract.

The first part of this tutorial will cover using predeployed market maker contracts and a router contract to quote and make swaps between different tokens or AUT. The second part covers deploying and removing liquidity from the asset pool of a pair contract. To learn more about how Uniswap works, see the [product documentation][1], or read the [overview blog post][2].

## Swap ERC20 tokens and AUT yourself

To make trying out Uniswap easier, we have written a web3 JS script that automates most of the process, and a bash script that can be edited. The bash script passes variables (such as which tokens to swap, which way, how much etc.) chosen by the user. Before you can use the scripts to make swaps, checkout the setup process below.

### Setup

- Download the uniswap-deploy-scripts repo: 

```bash

git clone git@github.com:Ben-Haslam/uniswap-deploy-scripts.git
cd uniswap
```

- Within the new directory, install the required node modules using the command below:

```bash
npm install
```


### Swap functions

There are four different swap functions that are exposed by the web3 JS script that you can try out. These are described briefly below, but for more information see the [official router documentation][4]. The functions that swap native AUT (ETH) use a WETH contract to convert AUT to ERC20 tokens so they can be traded, but all this is done under the hood so the user does not need to have any WETH tokens or even be aware the contract exists. For more information on the use of swap functions generally see the [Uniswap documentation on swaps][7].

0. **swapExactTokensForTokens:** Swaps an exact amount of tokens in for an output amount of tokens out at least as large as a given minimum output

```bash
function swapExactTokensForTokens(
  uint amountIn,
  uint amountOutMin,
  address[] calldata path,
  address to,
  uint deadline
) external returns (uint[] memory amounts);
```

1. **swapTokensForExactTokens:** Swaps an amount of input tokens at most as large as a given maximum input for an exact amount of output tokens

```bash
function swapTokensForExactTokens(
  uint amountOut,
  uint amountInMax,
  address[] calldata path,
  address to,
  uint deadline
) external returns (uint[] memory amounts);
```

2. **swapExactETHForTokens:** Swaps an exact amount of AUT for an output amount of tokens out at least as large as a given minimum output. As this function sends AUT on behalf of the user, the amountIN 


```bash
function swapExactETHForTokens(
	uint amountOutMin,
	address[] calldata path,
	address to,
	uint deadline

	uint msg.value (amountIn)
) external payable returns (uint[] memory amounts);
```

3. **swapETHForExactTokens:** Swaps an amount of input AUT at most as large as a given maximum input for an exact amount of output tokens

```bash
function swapExactETHForTokens(
	uint amountOutMin,
	address[] calldata path,
	address to,
	uint deadline

	uint msg.value (amountIn)
) external payable returns (uint[] memory amounts);
```

4. **swapExactTokensForETH:**  Swaps an exact amount of tokens in for an output amount of AUT out at least as large as a given minimum output

```bash
function swapExactTokensForETH(
	uint amountIn,
	uint amountOutMin,
	address[] calldata path,
	address to,
	uint deadline
) external returns (uint[] memory amounts);
```

5. **swapTokensForExactETH:** Swaps an amount of input tokens at most as large as a given maximum input for an exact amount of output AUT

```bash
function swapTokensForExactETH(
	uint amountOut,
	uint amountInMax,
	address[] calldata path,
	address to,
	uint deadline
) external returns (uint[] memory amounts);
```

### Quote functions

There are two functions that can be used to get a quote of a swap to see what amount of output tokens a particular amount of input tokens could be traded for, or to see what amount of input tokens could be traded for a particular amount of output tokens. These functions are therefore useful preliminaries before making a swap. These functions can be used to get a quote for any ERC20 tokens, including wrapped Autons (using the WETH contract).

0. **getAmountsOut:** Get a quote of the output for various tokens, given and input amount of one token, e.g. can be used to see what output of tokenA or AUT one would receive after swapping an input amount of tokenB

```bash
function getAmountsOut(
  uint amountIn,
  address[] memory path
) public view returns (uint[] memory amounts);
```

1. **getAmountsIn:** Get a quote of the input amount for various tokens needed to swap for a given amount of an output token, e.g. can be used to see what input of tokenA or AUT one would need to swap to an output amount of tokenB

```bash
function getAmountsIn(
  uint amountOut,
  address[] memory path
) public view returns (uint[] memory amounts);
```


### Use

The use of the swap functions can be done with the bash script `test_swap.sh`, shown below:

```bash
#!/bin/bash

# DO NOT CHANGE
NODE_URL='<RPC NODE>'
weth_address='0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF';
factory_address='0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116'
router_address='0x4489D87C8440B19f11d63FA2246f943F492F3F5F';

# Variables

prvkey='<ENTER HERE>';
tokenA_address='0x1d29BD2ACedBff15A59e946a4DE26d5257447727';
tokenB_address='0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA';

# For swapping from an exact amount
amountIn=1000
amountOutMin=0

# For swapping to an exact amount
amountInMax=1000
amountOut=500

which_swap=3
# choose which swap function, leave empty to skip
swap='A'
# Let swap be A to swap token A > token B, B to swap token B > token A.
# If using ETH/AUT, let swap be A to swap to/from token A, B to swap to/from token B.

which_quote=0
# choose which quote function, leave empty to skip
quote='AUT'
# choose which Token to quote, takes A, B or AUT

node test_swap.js \
   --node_url $NODE_URL \
   --weth_address $weth_address \
   --factory_address $factory_address\
   --prvkey $prvkey \
   --router_address $router_address \
   --tokenA_address $tokenA_address \
   --tokenB_address $tokenB_address \
   --amountIn $amountIn \
   --amountOutMin $amountOutMin \
   --amountInMax $amountInMax \
   --amountOut $amountOut \
   --which_swap $which_swap \
   --swap $swap \
   --which_quote $which_quote \
   --quote $quote

```

By customising the variables in this script you can construct any possible swap function:

- `which_swap`  allows you to choose which swap function to use (0-5). Leave empty to skip the swap functionality

- `swap` selects which way to swap A or B, let swap be A to swap token A > token B, B to swap token B > token A. If using ETH/AUT, let K be A to swap to/from token A, B to swap to/from token B

- `which_quote` selects which quote funciton to use, leave empty to skip the quote functionality

- `quote` selects which token to apply the quote on, A, B, or Aut

- `amountIn` and `amountOutMin` are used to specify the volumes of tokens when swapping an exact amount, used for swap functions 0, 2 and 4, and quote function 0

- `amountInMax` and `amountOut` are used to specify the volumes of tokens when swapping to an exact amount, used for swap functions 1, 3 and 5, and quote function 1

- As any ERC20 tokens can be traded with Uniswap, the variables `tokenA_address` and `tokenB_address` can be changed to other tokens, although a swap can only be successful if liquidity had been provided for the token pair, therefore it is not recommended changing these variables

After the variables are set the bash script runs the web3 script with node to run all the transactions, with the variables set as arguments. If successful you should receive an output resembling the following:

```bash
----------------------
myaddress:  0xB77d5Ca0266151ba62E098BFD0e8A5a95bC5902D
tokenA address:  0x1d29BD2ACedBff15A59e946a4DE26d5257447727
tokenB address:  0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA
router address:  0x4489D87C8440B19f11d63FA2246f943F492F3F5F
----------------------
Start Approvals
----------------------
transaction hash 0xf25df0020f4d8ea6cda7501c9ce52462a175347bc6628681d18c8dd0d0db5d40
transaction hash 0x52b2432d1af7320246f5b607e71f5c39589ed8a79b733e3d7127bf213ebecee9
transaction hash 0xc93983fcb9b64315c298552be46b713a091c2621160c94a167083c15a745c26b
----------------------
QUOTE
----------------------
getAmountsOut
amount in of  Aut:  1000
amount out of  tokenA:  358.587026332691072575
amount out of  tokenB:  357.569879502982990709
----------------------
SWAPFUNCTION
----------------------
amount in:  1000
amount out:  997.099693866798141177
----------------------
tokenA Address 0x1d29BD2ACedBff15A59e946a4DE26d5257447727
tokenB Address 0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA
pairAddress 0x61eEd2ec2050b67Ce4338806B982120C49eedbb1
reserves for token A 10000383.021516754379628347
reserves for token B 10000382.898306133201858823
----------------------
```


## Deploy liquidity to pairs yourself

Similar to the functionality for making swaps, the functionality for deploying liquidity is implemented with a rather complicated web3 JS script, so a bash script that can be edited is used to choose the variables (which pair of tokens to fund, how much liquidity to add for each token in the pair) then pass them on to the web3 JS script. The web3 JS script and bash script needed for deploying liquidity are found in the zip file along with the scripts for the making swaps, so the same setup process sets up for deploying liquidity too.

There are two functions that are used to add liquidity; one to add liquidity to a token-token pair and another for an AUT-token pair. There are also two functions used to remove liquidity, again one for a token-token pair and another for an AUT-token pair. These functions are implemented in the web3 JS script but abstracted through the bash script to make adding and removing liquidity more simple. When liquidity is added, the amount of liquidity tokens recieved in return is calculated as the room mean squar of the tokens added, and when they are traded back in, a root mean square formula is used to calculate the amount of output tokens. For a more detailed description of these functions see the [official Uniswap documentation][5], and for a more detailed description of liquidity pools themselves see the [Uniswap documentation on pools][6].

### Add liquidity functions

- **addLiquidity:** Adds liquidity to an ERC-20⇄ERC-20 pool at the ideal ratio using `amountAMin` and `amountBMin` or if a pool did not previously exist, created pool of assets using `amountADesired` and `amountBDesired`

```bash
function addLiquidity(
  address tokenA,
  address tokenB,
  uint amountADesired,
  uint amountBDesired,
  uint amountAMin,
  uint amountBMin,
  address to,
  uint deadline
) external returns (uint amountA, uint amountB, uint liquidity);
```

- **addLiquidityETH:** Adds liquidity to an ERC-20⇄AUT pool at the ideal ratio using `amountAMin`/`amountBMin` and `amountAUTMin` or if a pool did not previously exist, creates the pool of assets using `amountADesired` and `amountBDesired`

```bash
function addLiquidityETH(
  address token,
  uint amountTokenDesired,
  uint amountTokenMin,
  uint amountETHMin,
  address to,
  uint deadline
) external payable returns (uint amountToken, uint amountETH, uint liquidity);
```

### Remove liquidity functions


- **removeLiquidity:** Removes liquidity from an ERC-20⇄ERC-20 pool burning the given `liquidity` tokens to recieve tokens

```bash
function removeLiquidity(
  address tokenA,
  address tokenB,
  uint liquidity,
  uint amountAMin,
  uint amountBMin,
  address to,
  uint deadline
) external returns (uint amountA, uint amountB);
```
 
- **removeLiquidityETH:** Removes liquidity from an ERC-20⇄AUT pool, burning the given `liquidity` tokens to receive tokens and AUT

```bash
function removeLiquidityETH(
  address token,
  uint liquidity,
  uint amountTokenMin,
  uint amountETHMin,
  address to,
  uint deadline
) external returns (uint amountToken, uint amountETH);
```

## Use

Like with the swap functions, adding liquity is best done by editing a bash script with the neccisarry variables, which then passes the variables onto the web3 JS script. The bash script `test_add_liquidity.sh` is shown below:

```bash
#!/bin/bash

# DO NOT CHANGE
NODE_URL='<RPC NODE>'
weth_address='0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF';
factory_address='0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116'
router_address='0x4489D87C8440B19f11d63FA2246f943F492F3F5F';

# Variables

prvkey='<ENTER HERE>';
tokenA_address='0x1d29BD2ACedBff15A59e946a4DE26d5257447727';
tokenB_address='0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA';

# ADD LIQUIDITY
amountADesired=200
amountBDesired=200
amountAUTDesired=200

amountAMin=0
amountBMin=0
amountAUTMin=0


# Select which pair to fund, 0 => tokenA/tokenB, 1 => tokenA/AUT, 2=> tokenB/AUT. Leave blank to skip adding liquidity.
fund_pair=0

# ---------------------------------

# REMOVE LIQUIDITY

# Select which pair to defund, 0 => tokenA/tokenB, 1 => tokenA/AUT, 2=> tokenB/AUT. Leave blank to skip removing liquidity.
defund_pair=1
# Amount of liquidity tokens to remove
liquidity=200



node test_add_liquidity.js \
   --node_url $NODE_URL \
   --weth_address $weth_address \
   --factory_address $factory_address\
   --prvkey $prvkey \
   --router_address $router_address \
   --tokenA_address $tokenA_address \
   --tokenB_address $tokenB_address \
   --amountADesired $amountADesired \
   --amountBDesired $amountBDesired \
   --amountAUTDesired $amountAUTDesired \
   --amountAMin $amountAMin \
   --amountBMin $amountBMin \
   --amountAUTMin $amountAUTMin \
   --fund_pair $fund_pair \
   --defund_pair $defund_pair \
   --liquidity $liquidity 

```

### Add liquidity

By customising the following variables, you can and liquidity to a pair of your choice:

- `amountADesired`, `amountBDesired` and `amountAUTDesired`. Depending on which pair you choose, two of these values will be used to set the ratio at which tokens are added to a liquidity pool if the pool has not already been created. If a pool does already exist (liquidity for that pair has already been added), then assets are added at the ideal ratio (see `fund_pair`)

- `amountAMin`, `amountBMin`, `amountAUTMin`. Set the minimum value of the tokenA, tokenB and AUT that will be added to a liquidity pool if assets are added at the ideal ratio

- `fund_pair`. Choose which pair to fund, 0 => tokenA/tokenB, 1 => tokenA/AUT, 2=> tokenB/AUT. Leave blank to skip adding liquidity. If the liquidity pool for a pair already exists, assets are added at the ideal ratio, with the amount of the assets being deployed being set by the first token in the pair. For example, for `fund_pair=0`, the first token in the pair is `tokenA`, so the amount of tokens deployed is set by `amountADesired` and the ideal ratio

Run the bash script with `./test_add_liquidity.sh`. If successful part of the output will resemble the following:

``` bash
Add liquidity to tokenA-AUT pair
----------------------
token in:  200
AUT in:  200
liquidity tokens out:  200
transaction hash 0x830b3cb4b2def802549a5c27077110a6bc6b2f0c1fa1e0a6806389dacfae31b7
----------------------
token Address 0x1d29BD2ACedBff15A59e946a4DE26d5257447727
weth_address 0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF
pairAddress 0xb33e10F22FD73491bB1e458fad5281725d14c130
reserves for token 580
reserves for AUT 580
----------------------
```

It is recommended that you save the `pairAddress` and add it as a custom token in metamask. This will allow you to keep track of the liquidity tokens for different pairs (the liquidity tokens themselves are ERC20 compatible). When you add the `pairAddress` as a custom token, the `Token Symbol` is automatically filled out as `UNI-V2`. It is recommended appending this with an abbreviation of the pair it represents, such as `UNI-V2-A/B` for the pair for tokenA and tokenB. This makes it much easier keeping track if you have liquidity tokens for multiple pair contracts.

If you have deployed liquidity to all the pair contracts described above, the assets on metamask will look something like this:

[![liquidity tokens](../images/uniswap/liquidity_tokens.png){: style="width:100%;" }](../images/uniswap/liquidity_tokens.png)


### Remove liquidity

By customising the following variables in the same bash script shown above, you can remove liquidity from a liquidity pool of your choice. 

- `defund_pair`. Select which pair to defund, 0 for tokenA/tokenB, 1 for tokenA/AUT, 2 for tokenB/AUT. Leave blank to skip removing liquidity.

- `liquidity`. Amount of liquidity tokens to remove

Run the bash script with `./test_add_liquidity.sh`. If successful when you run the bash script part of the output will resemble the following:


```bash
----------------------
Remove liquidity from tokenA-AUT pair
----------------------
liquidity tokens in:  20
token out:  20
AUT out:  20
transaction hash 0x5b2b443067c9c86bb2e43057e16421f167a90d651ad33e99977ac8d71246c4a5
----------------------
token Address 0x1d29BD2ACedBff15A59e946a4DE26d5257447727
weth_address 0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF
pairAddress 0xb33e10F22FD73491bB1e458fad5281725d14c130
reserves for token 560
reserves for AUT 560
----------------------  
```

It is possible to add liquidity to one pair liquidity pool while removing liquidity from another. If you do this, the whole output should resemble the following:

```bash 
----------------------
tokenA 0x1d29BD2ACedBff15A59e946a4DE26d5257447727
tokenB 0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA
----------------------
Start Approvals
----------------------
transaction hash 0xaa38a667ae007bf1764db406fc19fc4f8b24d1204b2f920af49bc6fc3144fdd8
transaction hash 0x06e59d24d8e8492cc045668836e89eacc57547caa8cca3c0415dd8feb10b246a
transaction hash 0x254dec7d02fec289dc51b207ff850348406f8413e9189d7ca4ec8e3a381686ae
transaction hash 0x53d71649f6bbebdec2d9d46ac6c0f8e77144a6caa84585e62eaf82141da77dcb
transaction hash 0x65e472681f7ddd46b287908cc4a732697e6b7e55721e93092a84dca745d708a8
transaction hash 0x93232491a7123829e03e99e5288a98834e83ccf5b630f521cfe8ca408f703dc9
----------------------
Add liquidity to tokenA-AUT pair
----------------------
token in:  200
AUT in:  200
liquidity tokens out:  200
transaction hash 0x830b3cb4b2def802549a5c27077110a6bc6b2f0c1fa1e0a6806389dacfae31b7
----------------------
token Address 0x1d29BD2ACedBff15A59e946a4DE26d5257447727
weth_address 0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF
pairAddress 0xb33e10F22FD73491bB1e458fad5281725d14c130
reserves for token 580
reserves for AUT 580
----------------------
Remove liquidity from tokenA-AUT pair
----------------------
liquidity tokens in:  20
token out:  20
AUT out:  20
transaction hash 0x5b2b443067c9c86bb2e43057e16421f167a90d651ad33e99977ac8d71246c4a5
----------------------
token Address 0x1d29BD2ACedBff15A59e946a4DE26d5257447727
weth_address 0x3f0D1FAA13cbE43D662a37690f0e8027f9D89eBF
pairAddress 0xb33e10F22FD73491bB1e458fad5281725d14c130
reserves for token 560
reserves for AUT 560
----------------------

```

The Approvals you can see are needed for the router contract to handle tokens on behalf of the user. The web3 JS script is set up such that it only does the approvals it needs for the functions selected to save time.



----------------------------------------


[1]: https://uniswap.org/docs/v2/
[2]: https://uniswap.org/blog/uniswap-v2/
[4]: https://uniswap.org/docs/v2/smart-contracts/router02/#swapexacttokensfortokens
[5]: https://uniswap.org/docs/v2/smart-contracts/router02/#addliquidity
[6]: https://uniswap.org/docs/v2/core-concepts/pools/
[7]: https://uniswap.org/docs/v2/core-concepts/swaps/

