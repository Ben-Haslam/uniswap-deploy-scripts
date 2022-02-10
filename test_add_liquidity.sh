#!/bin/bash

# Network details
NODE_URL='<ENTER HERE>'
weth_address='<ENTER HERE>';
factory_address='<ENTER HERE>'
router_address='<ENTER HERE>';

# Variables

prvkey='<ENTER HERE>';
tokenA_address='<ENTER HERE>';
tokenB_address='<ENTER HERE>';

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


