// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title RashitoStaking
/// @notice Stake NFTs from one fixed ERC-721 collection to earn a chosen
///         ERC-20 reward token (intended: the RASH token) at a flat rate per
///         staked token per second. Rewards are paid from a reward pool the
///         owner funds explicitly with `fundRewards` - this contract can
///         never mint tokens, so it can only ever pay out what it actually
///         holds. Staked NFTs are held in escrow by this contract and
///         returned in full on `unstake`; the owner has no path to touch a
///         staker's NFT or claim their rewards on their behalf.
contract RashitoStaking is IERC721Receiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC721 public immutable nft;
    IERC20 public immutable rewardToken;

    /// @notice Reward token units accrued per staked NFT per second.
    uint256 public rewardRatePerSecond;

    /// @notice When true, new stakes are blocked. Existing stakers can still
    ///         unstake and claim already-accrued rewards at any time.
    bool public stakingPaused;

    struct StakeInfo {
        address owner;
        uint64 stakedAt;
        uint64 lastClaimAt;
    }

    /// @notice tokenId => stake info. owner == address(0) means not staked.
    mapping(uint256 => StakeInfo) public stakes;

    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerTokenIndex;

    uint256 public totalStaked;

    event Staked(address indexed user, uint256 indexed tokenId);
    event Unstaked(address indexed user, uint256 indexed tokenId, uint256 reward);
    event Claimed(address indexed user, uint256 indexed tokenId, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event RewardsFunded(address indexed from, uint256 amount);
    event StakingPausedToggled(bool paused);
    event ExcessRewardsWithdrawn(uint256 amount);

    error NotStaker();
    error StakingIsPaused();
    error InsufficientRewardPool();
    error NotTheCollection();

    constructor(address nft_, address rewardToken_, uint256 rewardRatePerSecond_, address owner_) Ownable(owner_) {
        require(nft_ != address(0) && rewardToken_ != address(0), "zero address");
        nft = IERC721(nft_);
        rewardToken = IERC20(rewardToken_);
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    /// @notice Stakes one NFT. Requires prior approval (`approve` or
    ///         `setApprovalForAll`) on the NFT contract for this contract's
    ///         address, exactly like listing on any marketplace.
    function stake(uint256 tokenId) external nonReentrant {
        _stake(msg.sender, tokenId);
    }

    function stakeBatch(uint256[] calldata tokenIds) external nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _stake(msg.sender, tokenIds[i]);
        }
    }

    function _stake(address staker, uint256 tokenId) private {
        if (stakingPaused) revert StakingIsPaused();
        nft.safeTransferFrom(staker, address(this), tokenId);
        stakes[tokenId] = StakeInfo({owner: staker, stakedAt: uint64(block.timestamp), lastClaimAt: uint64(block.timestamp)});
        _addToken(staker, tokenId);
        totalStaked++;
        emit Staked(staker, tokenId);
    }

    /// @notice View-only: rewards accrued since the last claim for one token.
    function pendingReward(uint256 tokenId) public view returns (uint256) {
        StakeInfo memory s = stakes[tokenId];
        if (s.owner == address(0)) return 0;
        uint256 elapsed = block.timestamp - s.lastClaimAt;
        return elapsed * rewardRatePerSecond;
    }

    /// @notice Sum of pending rewards across every token a wallet has staked.
    function pendingRewardOf(address user) external view returns (uint256 total) {
        uint256[] memory tokens = _ownerTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            total += pendingReward(tokens[i]);
        }
    }

    /// @notice Claims accrued rewards for one staked token without unstaking it.
    function claim(uint256 tokenId) public nonReentrant {
        StakeInfo storage s = stakes[tokenId];
        if (s.owner != msg.sender) revert NotStaker();
        uint256 reward = pendingReward(tokenId);
        s.lastClaimAt = uint64(block.timestamp);
        if (reward > 0) {
            if (rewardToken.balanceOf(address(this)) < reward) revert InsufficientRewardPool();
            rewardToken.safeTransfer(msg.sender, reward);
        }
        emit Claimed(msg.sender, tokenId, reward);
    }

    function claimBatch(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            claim(tokenIds[i]);
        }
    }

    /// @notice Unstakes one token: returns the NFT and pays out any rewards
    ///         still owed, in the same transaction.
    function unstake(uint256 tokenId) external nonReentrant {
        StakeInfo memory s = stakes[tokenId];
        if (s.owner != msg.sender) revert NotStaker();
        uint256 reward = pendingReward(tokenId);
        delete stakes[tokenId];
        _removeToken(msg.sender, tokenId);
        totalStaked--;
        nft.safeTransferFrom(address(this), msg.sender, tokenId);
        if (reward > 0 && rewardToken.balanceOf(address(this)) >= reward) {
            rewardToken.safeTransfer(msg.sender, reward);
        }
        emit Unstaked(msg.sender, tokenId, reward);
    }

    function stakedTokensOf(address user) external view returns (uint256[] memory) {
        return _ownerTokens[user];
    }

    function onERC721Received(address, address, uint256, bytes calldata) external view override returns (bytes4) {
        if (msg.sender != address(nft)) revert NotTheCollection();
        return IERC721Receiver.onERC721Received.selector;
    }

    /* ---------------- Reward pool & owner controls ---------------- */

    /// @notice Anyone can top up the reward pool (typically the project
    ///         treasury). Requires prior ERC-20 approval for this contract.
    function fundRewards(uint256 amount) external {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(msg.sender, amount);
    }

    function rewardPoolBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRatePerSecond = newRate;
        emit RewardRateUpdated(newRate);
    }

    function setStakingPaused(bool paused) external onlyOwner {
        stakingPaused = paused;
        emit StakingPausedToggled(paused);
    }

    /// @notice Owner can only withdraw reward-token balance, and only what
    ///         isn't needed - this contract holds no user NFTs the owner can
    ///         touch, and cannot pull a staker's already-accrued rewards.
    function withdrawExcessRewards(uint256 amount) external onlyOwner {
        rewardToken.safeTransfer(owner(), amount);
        emit ExcessRewardsWithdrawn(amount);
    }

    function _addToken(address owner_, uint256 tokenId) private {
        _ownerTokenIndex[tokenId] = _ownerTokens[owner_].length;
        _ownerTokens[owner_].push(tokenId);
    }

    function _removeToken(address owner_, uint256 tokenId) private {
        uint256 lastIndex = _ownerTokens[owner_].length - 1;
        uint256 tokenIndex = _ownerTokenIndex[tokenId];
        if (tokenIndex != lastIndex) {
            uint256 lastTokenId = _ownerTokens[owner_][lastIndex];
            _ownerTokens[owner_][tokenIndex] = lastTokenId;
            _ownerTokenIndex[lastTokenId] = tokenIndex;
        }
        _ownerTokens[owner_].pop();
        delete _ownerTokenIndex[tokenId];
    }
}
