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

