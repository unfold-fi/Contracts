// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract UnfoldToken is ERC20 {
    constructor(uint256 _initial) public ERC20('Unfold Token', 'UNF') {
        _mint(_msgSender(), _initial);
    }
}
