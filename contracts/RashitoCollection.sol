// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title RashitoCollection
/// @notice Generative ERC-721 collection contract deployed by the Rashito studio.
///         Supports capped supply, public/allowlist minting, per-wallet limits,
///         ERC-2981 royalties, a pausable mint, a pre-reveal placeholder URI and
///         owner withdrawals. Deployed directly from the connected creator wallet
///         through the Rashito app - no backend private key ever touches funds.
contract RashitoCollection is ERC721, ERC2981, Ownable, Pausable, ReentrancyGuard {
    /// @notice Maximum number of tokens that will ever exist.
    uint256 public immutable maxSupply;

    /// @notice Price (in wei) to mint a single token during public mint.
    uint256 public mintPrice;

    /// @notice Maximum number of tokens a single wallet may hold from public mint.
    uint256 public maxPerWallet;

    /// @notice Whether the public (permissionless) mint is currently open.
    bool public publicMintEnabled;

    /// @notice Whether metadata has been revealed. Before reveal, tokenURI
    ///         resolves every token to `unrevealedURI`.
    bool public revealed;

    /// @notice Base URI used once the collection has been revealed, e.g.
    ///         "ipfs://<metadata-cid>/". tokenURI appends "{id}.json".
    string private _baseTokenURI;

    /// @notice URI shown for every token before reveal (a single placeholder JSON).
    string public unrevealedURI;

    /// @notice Merkle root for allowlist minting. Leave as bytes32(0) to disable.
    bytes32 public allowlistRoot;

    /// @notice Whether allowlist minting is currently open.
    bool public allowlistMintEnabled;

    uint256 private _nextTokenId = 1;
    uint256 private _totalMinted;

    mapping(address => uint256) public mintedByWallet;
    mapping(address => uint256) public allowlistMintedByWallet;

    event Minted(address indexed to, uint256 indexed tokenId, uint256 quantity);
    event Revealed(string baseURI);
    event MintPriceUpdated(uint256 newPrice);
    event PublicMintToggled(bool enabled);
    event AllowlistMintToggled(bool enabled);
    event AllowlistRootUpdated(bytes32 root);
    event Withdrawn(address indexed to, uint256 amount);

    error MaxSupplyExceeded();
    error IncorrectPayment();
    error PublicMintClosed();
    error AllowlistMintClosed();
    error WalletLimitExceeded();
    error InvalidProof();
    error ZeroQuantity();
    error WithdrawFailed();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        uint256 maxPerWallet_,
        string memory unrevealedURI_,
        address royaltyReceiver_,
        uint96 royaltyFeeBps_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        maxPerWallet = maxPerWallet_;
        unrevealedURI = unrevealedURI_;
        if (royaltyReceiver_ != address(0)) {
            _setDefaultRoyalty(royaltyReceiver_, royaltyFeeBps_);
        }
    }

    /// @notice Public, permissionless mint. Pay `mintPrice * quantity`.
    function mint(uint256 quantity) external payable nonReentrant whenNotPaused {
        if (!publicMintEnabled) revert PublicMintClosed();
        if (quantity == 0) revert ZeroQuantity();
        if (_totalMinted + quantity > maxSupply) revert MaxSupplyExceeded();
        if (mintedByWallet[msg.sender] + quantity > maxPerWallet) revert WalletLimitExceeded();
        if (msg.value != mintPrice * quantity) revert IncorrectPayment();

        mintedByWallet[msg.sender] += quantity;
        _mintBatch(msg.sender, quantity);
    }

    /// @notice Allowlist mint gated by a Merkle proof against `allowlistRoot`.
    function allowlistMint(uint256 quantity, bytes32[] calldata proof) external payable nonReentrant whenNotPaused {
        if (!allowlistMintEnabled) revert AllowlistMintClosed();
        if (quantity == 0) revert ZeroQuantity();
        if (_totalMinted + quantity > maxSupply) revert MaxSupplyExceeded();
        if (allowlistMintedByWallet[msg.sender] + quantity > maxPerWallet) revert WalletLimitExceeded();
        if (msg.value != mintPrice * quantity) revert IncorrectPayment();

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender))));
        if (!_verifyProof(proof, allowlistRoot, leaf)) revert InvalidProof();

        allowlistMintedByWallet[msg.sender] += quantity;
        _mintBatch(msg.sender, quantity);
    }

    /// @notice Owner-only reserve mint, e.g. for the team or giveaways. Free of charge.
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (quantity == 0) revert ZeroQuantity();
        if (_totalMinted + quantity > maxSupply) revert MaxSupplyExceeded();
        _mintBatch(to, quantity);
    }

    function _mintBatch(address to, uint256 quantity) internal {
        uint256 startId = _nextTokenId;
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, startId + i);
        }
        _nextTokenId += quantity;
        _totalMinted += quantity;
        emit Minted(to, startId, quantity);
    }

    function totalSupply() external view returns (uint256) {
        return _totalMinted;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!revealed) return unrevealedURI;
        return string.concat(_baseTokenURI, _toString(tokenId), ".json");
    }

    /* ---------------- Owner controls ---------------- */

    function setPublicMintEnabled(bool enabled) external onlyOwner {
        publicMintEnabled = enabled;
        emit PublicMintToggled(enabled);
    }

    function setAllowlistMintEnabled(bool enabled) external onlyOwner {
        allowlistMintEnabled = enabled;
        emit AllowlistMintToggled(enabled);
    }

    function setAllowlistRoot(bytes32 root) external onlyOwner {
        allowlistRoot = root;
        emit AllowlistRootUpdated(root);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    function setMaxPerWallet(uint256 newLimit) external onlyOwner {
        maxPerWallet = newLimit;
    }

    /// @notice Reveals the collection by pointing tokenURI at the real, pinned metadata.
    function reveal(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
        revealed = true;
        emit Revealed(baseURI_);
    }

    function setUnrevealedURI(string calldata uri_) external onlyOwner {
        unrevealedURI = uri_;
    }

    function setDefaultRoyalty(address receiver, uint96 feeBps) external onlyOwner {
        _setDefaultRoyalty(receiver, feeBps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool ok, ) = payable(owner()).call{value: balance}("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawn(owner(), balance);
    }

    /* ---------------- Internals ---------------- */

    function _verifyProof(bytes32[] calldata proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computed = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 p = proof[i];
            computed = computed <= p ? keccak256(abi.encodePacked(computed, p)) : keccak256(abi.encodePacked(p, computed));
        }
        return computed == root;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
