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

# For swapping from an exact amount
amountIn=1000
amountOutMin=0

# For swapping to an exact amount
amountInMax=1000
amountOut=500

which_swap=0
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

