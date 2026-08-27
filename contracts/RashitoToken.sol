// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RashitoToken (RASH)
/// @notice The Rashito platform's fixed-supply ERC-20 utility token. The full
///         supply is minted once, at deployment, straight to the treasury
///         address you choose - there is no further minting function, so
///         holders never have to worry about inflation from this contract.
///         Burnable so the treasury (or anyone) can permanently reduce supply,
///         and ERC20Permit for gasless approvals (EIP-2612).
contract RashitoToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    /// @notice Total supply minted at deployment: 1,000,000,000 RASH (18 decimals).
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 ether;

    constructor(address treasury, address owner_) ERC20("Rashito", "RASH") ERC20Permit("Rashito") Ownable(owner_) {
        require(treasury != address(0), "treasury is zero address");
        _mint(treasury, INITIAL_SUPPLY);
    }

    /// @notice Owner-only rescue for ERC-20 tokens accidentally sent to this
    ///         contract address. Cannot be used to touch RASH balances of
    ///         other holders - only tokens held by the contract itself.
    function rescueERC20(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(this) || to == owner(), "use burn for RASH");
        ERC20(token).transfer(to, amount);
    }
}
