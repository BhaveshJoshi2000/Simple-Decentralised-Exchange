// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token2 is ERC20 {
    constructor(uint256 amount) ERC20("MyToken2", "MTK2") {
        _mint(msg.sender, amount);
    }

    function mint(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }
}
