#!/bin/bash

# DO NOT CHANGE
NODE_URL='https://rpc4.bakerloo.autonity.network:8545'
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
defund_pair=
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


