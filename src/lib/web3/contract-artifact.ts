// Auto-generated from contracts/RashitoCollection.sol via solc.
// Regenerate after editing the contract: see contracts/README.md.
// Keeping the compiled ABI + bytecode in the frontend lets Rashito deploy the
// contract directly from the connected wallet (viem walletClient.deployContract) -
// no backend, no private key, the creator signs and pays gas themselves.

export const RASHITO_COLLECTION_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "maxSupply_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "mintPrice_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxPerWallet_",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "unrevealedURI_",
        type: "string",
      },
      {
        internalType: "address",
        name: "royaltyReceiver_",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "royaltyFeeBps_",
        type: "uint96",
      },
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AllowlistMintClosed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "numerator",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "denominator",
        type: "uint256",
      },
    ],
    name: "ERC2981InvalidDefaultRoyalty",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC2981InvalidDefaultRoyaltyReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "numerator",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "denominator",
        type: "uint256",
      },
    ],
    name: "ERC2981InvalidTokenRoyalty",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC2981InvalidTokenRoyaltyReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721InvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC721InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectPayment",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidProof",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxSupplyExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "PublicMintClosed",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "WalletLimitExceeded",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroQuantity",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "AllowlistMintToggled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
    ],
    name: "AllowlistRootUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newPrice",
        type: "uint256",
      },
    ],
    name: "MintPriceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
    ],
    name: "Minted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "PublicMintToggled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "baseURI",
        type: "string",
      },
    ],
    name: "Revealed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    name: "allowlistMint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "allowlistMintEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowlistMintedByWallet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allowlistRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxPerWallet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "mintedByWallet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
    ],
    name: "ownerMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "publicMintEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "baseURI_",
        type: "string",
      },
    ],
    name: "reveal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "revealed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "salePrice",
        type: "uint256",
      },
    ],
    name: "royaltyInfo",
    outputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "setAllowlistMintEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
    ],
    name: "setAllowlistRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "feeBps",
        type: "uint96",
      },
    ],
    name: "setDefaultRoyalty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newLimit",
        type: "uint256",
      },
    ],
    name: "setMaxPerWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newPrice",
        type: "uint256",
      },
    ],
    name: "setMintPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "setPublicMintEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "uri_",
        type: "string",
      },
    ],
    name: "setUnrevealedURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unrevealedURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const RASHITO_COLLECTION_BYTECODE =
  "0x60a06040526001601055348015610014575f80fd5b506040516128eb3803806128eb833981016040819052610033916102b1565b8089895f6100418382610412565b50600161004e8282610412565b5050506001600160a01b03811661007f57604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b610088816100f0565b5060017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005560808790526009869055600a859055600d6100c88582610412565b506001600160a01b038316156100e2576100e28383610141565b5050505050505050506104cc565b600880546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6127106001600160601b03821681101561018057604051636f483d0960e01b81526001600160601b038316600482015260248101829052604401610076565b6001600160a01b0383166101a957604051635b6cc80560e11b81525f6004820152602401610076565b50604080518082019091526001600160a01b039092168083526001600160601b039091166020909201829052600160a01b90910217600655565b634e487b7160e01b5f52604160045260245ffd5b5f82601f830112610206575f80fd5b81516001600160401b0381111561021f5761021f6101e3565b604051601f8201601f19908116603f011681016001600160401b038111828210171561024d5761024d6101e3565b604052818152838201602001851015610264575f80fd5b8160208501602083015e5f918101602001919091529392505050565b80516001600160a01b0381168114610296575f80fd5b919050565b80516001600160601b0381168114610296575f80fd5b5f805f805f805f805f6101208a8c0312156102ca575f80fd5b89516001600160401b038111156102df575f80fd5b6102eb8c828d016101f7565b60208c0151909a5090506001600160401b03811115610308575f80fd5b6103148c828d016101f7565b60408c015160608d015160808e015160a08f0151939c50919a509850965090506001600160401b03811115610347575f80fd5b6103538c828d016101f7565b94505061036260c08b01610280565b925061037060e08b0161029b565b915061037f6101008b01610280565b90509295985092959850929598565b600181811c908216806103a257607f821691505b6020821081036103c057634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561040d57805f5260205f20601f840160051c810160208510156103eb5750805b601f840160051c820191505b8181101561040a575f81556001016103f7565b50505b505050565b81516001600160401b0381111561042b5761042b6101e3565b61043f81610439845461038e565b846103c6565b6020601f821160018114610471575f831561045a5750848201515b5f19600385901b1c1916600184901b17845561040a565b5f84815260208120601f198516915b828110156104a05787850151825560209485019460019092019101610480565b50848210156104bd57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b6080516123f26104f95f395f818161069c01528181610acf01528181610d190152610f7a01526123f25ff3fe608060405260043610610254575f3560e01c806370a082311161013f578063a0712d68116100b3578063e268e4d311610078578063e268e4d3146106be578063e985e9c5146106dd578063f2fde38b146106fc578063f4a0a5281461071b578063f611db1a1461073a578063fe2c7fee14610765575f80fd5b8063a0712d681461061b578063a22cb4651461062e578063b88d4fde1461064d578063c87b56dd1461066c578063d5abeb011461068b575f80fd5b8063818668d711610104578063818668d7146105835780638456cb59146105a25780638da5cb5b146105b65780638e0acd12146105d357806395d89b41146105f25780639c9c666914610606575f80fd5b806370a0823114610505578063715018a61461052457806371a943401461053857806379de186a146105575780637bc9200e14610570575f80fd5b80633ccfd60b116101d65780634c2612471161019b5780634c2612471461046257806351830227146104815780635c975abb1461049f5780636352211e146104bd5780636817c76c146104dc5780637035bf18146104f1575f80fd5b80633ccfd60b146103e75780633f4ba83a146103fb57806342842e0e1461040f578063453c23101461042e578063484b973c14610443575f80fd5b80630d7581111161021c5780630d758111146103245780630f4161aa1461035d57806318160ddd1461037657806323b872dd1461038a5780632a55205a146103a9575f80fd5b806301ffc9a71461025857806304634d8d1461028c57806306fdde03146102ad578063081812fc146102ce578063095ea7b314610305575b5f80fd5b348015610263575f80fd5b50610277610272366004611cd6565b610784565b60405190151581526020015b60405180910390f35b348015610297575f80fd5b506102ab6102a6366004611d13565b610794565b005b3480156102b8575f80fd5b506102c16107aa565b6040516102839190611d81565b3480156102d9575f80fd5b506102ed6102e8366004611d93565b610839565b6040516001600160a01b039091168152602001610283565b348015610310575f80fd5b506102ab61031f366004611daa565b610860565b34801561032f575f80fd5b5061034f61033e366004611dd2565b60126020525f908152604090205481565b604051908152602001610283565b348015610368575f80fd5b50600b546102779060ff1681565b348015610381575f80fd5b5060115461034f565b348015610395575f80fd5b506102ab6103a4366004611deb565b61086b565b3480156103b4575f80fd5b506103c86103c3366004611e25565b6108f9565b604080516001600160a01b039093168352602083019190915201610283565b3480156103f2575f80fd5b506102ab61097c565b348015610406575f80fd5b506102ab610a76565b34801561041a575f80fd5b506102ab610429366004611deb565b610a86565b348015610439575f80fd5b5061034f600a5481565b34801561044e575f80fd5b506102ab61045d366004611daa565b610aa5565b34801561046d575f80fd5b506102ab61047c366004611e45565b610b25565b34801561048c575f80fd5b50600b5461027790610100900460ff1681565b3480156104aa575f80fd5b50600854600160a01b900460ff16610277565b3480156104c8575f80fd5b506102ed6104d7366004611d93565b610b88565b3480156104e7575f80fd5b5061034f60095481565b3480156104fc575f80fd5b506102c1610b92565b348015610510575f80fd5b5061034f61051f366004611dd2565b610c1e565b34801561052f575f80fd5b506102ab610c63565b348015610543575f80fd5b506102ab610552366004611ec2565b610c74565b348015610562575f80fd5b50600f546102779060ff1681565b6102ab61057e366004611edb565b610cc4565b34801561058e575f80fd5b506102ab61059d366004611ec2565b610e80565b3480156105ad575f80fd5b506102ab610ec9565b3480156105c1575f80fd5b506008546001600160a01b03166102ed565b3480156105de575f80fd5b506102ab6105ed366004611d93565b610ed9565b3480156105fd575f80fd5b506102c1610f16565b348015610611575f80fd5b5061034f600e5481565b6102ab610629366004611d93565b610f25565b348015610639575f80fd5b506102ab610648366004611f55565b611076565b348015610658575f80fd5b506102ab610667366004611f9a565b611081565b348015610677575f80fd5b506102c1610686366004611d93565b611099565b348015610696575f80fd5b5061034f7f000000000000000000000000000000000000000000000000000000000000000081565b3480156106c9575f80fd5b506102ab6106d8366004611d93565b611176565b3480156106e8575f80fd5b506102776106f7366004612077565b611183565b348015610707575f80fd5b506102ab610716366004611dd2565b6111b0565b348015610726575f80fd5b506102ab610735366004611d93565b6111ea565b348015610745575f80fd5b5061034f610754366004611dd2565b60136020525f908152604090205481565b348015610770575f80fd5b506102ab61077f366004611e45565b611227565b5f61078e8261123c565b92915050565b61079c611260565b6107a6828261128d565b5050565b60605f80546107b89061209f565b80601f01602080910402602001604051908101604052809291908181526020018280546107e49061209f565b801561082f5780601f106108065761010080835404028352916020019161082f565b820191905f5260205f20905b81548152906001019060200180831161081257829003601f168201915b5050505050905090565b5f6108438261132f565b505f828152600460205260409020546001600160a01b031661078e565b6107a6828233611367565b6001600160a01b03821661089957604051633250574960e11b81525f60048201526024015b60405180910390fd5b5f6108a5838333611374565b9050836001600160a01b0316816001600160a01b0316146108f3576040516364283d7b60e01b81526001600160a01b0380861660048301526024820184905282166044820152606401610890565b50505050565b5f82815260076020526040812080548291906001600160a01b03811690600160a01b90046001600160601b03168161094c5750506006546001600160a01b03811690600160a01b90046001600160601b03165b5f6127106109636001600160601b038416896120eb565b61096d9190612116565b92989297509195505050505050565b610984611260565b61098c611466565b475f6109a06008546001600160a01b031690565b6001600160a01b0316826040515f6040518083038185875af1925050503d805f81146109e7576040519150601f19603f3d011682016040523d82523d5f602084013e6109ec565b606091505b5050905080610a0e57604051631d42c86760e21b815260040160405180910390fd5b6008546001600160a01b03166001600160a01b03167f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d583604051610a5491815260200190565b60405180910390a25050610a7460015f8051602061239d83398151915255565b565b610a7e611260565b610a74611481565b610aa083838360405180602001604052805f815250611081565b505050565b610aad611260565b805f03610acd5760405163f4f5b73360e01b815260040160405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000081601154610afc9190612129565b1115610b1b57604051638a164f6360e01b815260040160405180910390fd5b6107a682826114d6565b610b2d611260565b600c610b3a828483612180565b50600b805461ff0019166101001790556040517f34f25fe82e04b6b4bb3440737372e9d5d8e7a6a2b12da5dc4abead2c0b544ad990610b7c908490849061223a565b60405180910390a15050565b5f61078e8261132f565b600d8054610b9f9061209f565b80601f0160208091040260200160405190810160405280929190818152602001828054610bcb9061209f565b8015610c165780601f10610bed57610100808354040283529160200191610c16565b820191905f5260205f20905b815481529060010190602001808311610bf957829003601f168201915b505050505081565b5f6001600160a01b038216610c48576040516322718ad960e21b81525f6004820152602401610890565b506001600160a01b03165f9081526003602052604090205490565b610c6b611260565b610a745f611573565b610c7c611260565b600f805460ff19168215159081179091556040519081527f2d05d8440342b76f79ab0e0ccc473d7c7448a709b6ccbb3a46c94c10e3678ecf906020015b60405180910390a150565b610ccc611466565b610cd46115c4565b600f5460ff16610cf7576040516309c7220160e31b815260040160405180910390fd5b825f03610d175760405163f4f5b73360e01b815260040160405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000083601154610d469190612129565b1115610d6557604051638a164f6360e01b815260040160405180910390fd5b600a54335f90815260136020526040902054610d82908590612129565b1115610da15760405163746f460760e01b815260040160405180910390fd5b82600954610daf91906120eb565b3414610dce5760405163569e8c1160e01b815260040160405180910390fd5b604080513360208201525f910160408051601f1981840301815282825280516020918201209083015201604051602081830303815290604052805190602001209050610e1e8383600e54846115ef565b610e3b576040516309bde33960e01b815260040160405180910390fd5b335f9081526013602052604081208054869290610e59908490612129565b90915550610e69905033856114d6565b50610aa060015f8051602061239d83398151915255565b610e88611260565b600b805460ff19168215159081179091556040519081527fa81e445dac2343503dc87e4663774817434721db7d985310a6959766e6d4480e90602001610cb9565b610ed1611260565b610a74611690565b610ee1611260565b600e8190556040518181527f3acc3a8ccad9989eb960fa656ab3fe7c50873af2f06d0e4eeddd7081890e7e5e90602001610cb9565b6060600180546107b89061209f565b610f2d611466565b610f356115c4565b600b5460ff16610f58576040516316851fc760e11b815260040160405180910390fd5b805f03610f785760405163f4f5b73360e01b815260040160405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000081601154610fa79190612129565b1115610fc657604051638a164f6360e01b815260040160405180910390fd5b600a54335f90815260126020526040902054610fe3908390612129565b11156110025760405163746f460760e01b815260040160405180910390fd5b8060095461101091906120eb565b341461102f5760405163569e8c1160e01b815260040160405180910390fd5b335f908152601260205260408120805483929061104d908490612129565b9091555061105d905033826114d6565b61107360015f8051602061239d83398151915255565b50565b6107a63383836116d3565b61108c84848461086b565b6108f33385858585611792565b60606110a48261132f565b50600b54610100900460ff1661114457600d80546110c19061209f565b80601f01602080910402602001604051908101604052809291908181526020018280546110ed9061209f565b80156111385780601f1061110f57610100808354040283529160200191611138565b820191905f5260205f20905b81548152906001019060200180831161111b57829003601f168201915b50505050509050919050565b600c61114f836118ba565b604051602001611160929190612268565b6040516020818303038152906040529050919050565b61117e611260565b600a55565b6001600160a01b039182165f90815260056020908152604080832093909416825291909152205460ff1690565b6111b8611260565b6001600160a01b0381166111e157604051631e4fbdf760e01b81525f6004820152602401610890565b61107381611573565b6111f2611260565b60098190556040518181527f525b762709cc2a983aec5ccdfd807a061f993c91090b5bcd7da92ca254976aaa90602001610cb9565b61122f611260565b600d610aa0828483612180565b5f6001600160e01b0319821663152a902d60e11b148061078e575061078e826119bf565b6008546001600160a01b03163314610a745760405163118cdaa760e01b8152336004820152602401610890565b6127106001600160601b0382168110156112cc57604051636f483d0960e01b81526001600160601b038316600482015260248101829052604401610890565b6001600160a01b0383166112f557604051635b6cc80560e11b81525f6004820152602401610890565b50604080518082019091526001600160a01b039092168083526001600160601b039091166020909201829052600160a01b90910217600655565b5f818152600260205260408120546001600160a01b03168061078e57604051637e27328960e01b815260048101849052602401610890565b610aa08383836001611a0e565b5f828152600260205260408120546001600160a01b03908116908316156113a0576113a0818486611b12565b6001600160a01b038116156113da576113bb5f855f80611a0e565b6001600160a01b0381165f90815260036020526040902080545f190190555b6001600160a01b03851615611408576001600160a01b0385165f908152600360205260409020805460010190555b5f8481526002602052604080822080546001600160a01b0319166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b61146e611b76565b60025f8051602061239d83398151915255565b611489611ba5565b6008805460ff60a01b191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b6010545f5b828110156114fe576114f6846114f18385612129565b611bcf565b6001016114db565b508160105f8282546115109190612129565b925050819055508160115f8282546115289190612129565b909155505060405182815281906001600160a01b038516907f25b428dfde728ccfaddad7e29e4ac23c24ed7fd1a6e3e3f91894a9a073f5dfff906020015b60405180910390a3505050565b600880546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b600854600160a01b900460ff1615610a745760405163d93c066560e01b815260040160405180910390fd5b5f81815b85811015611684575f87878381811061160e5761160e6122f3565b9050602002013590508083111561164e57604080516020810183905290810184905260600160405160208183030381529060405280519060200120611679565b6040805160208101859052908101829052606001604051602081830303815290604052805190602001205b9250506001016115f3565b50909214949350505050565b6116986115c4565b6008805460ff60a01b1916600160a01b1790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586114b93390565b6001600160a01b0383166116fc5760405163a9fbf51f60e01b81525f6004820152602401610890565b6001600160a01b03821661172e57604051630b61174360e31b81526001600160a01b0383166004820152602401610890565b6001600160a01b038381165f81815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c319101611566565b6001600160a01b0383163b156118b357604051630a85bd0160e11b81526001600160a01b0384169063150b7a02906117d4908890889087908790600401612307565b6020604051808303815f875af192505050801561180e575060408051601f3d908101601f1916820190925261180b91810190612343565b60015b611875573d80801561183b576040519150601f19603f3d011682016040523d82523d5f602084013e611840565b606091505b5080515f0361186d57604051633250574960e11b81526001600160a01b0385166004820152602401610890565b805160208201fd5b6001600160e01b03198116630a85bd0160e11b146118b157604051633250574960e11b81526001600160a01b0385166004820152602401610890565b505b5050505050565b6060815f036118e05750506040805180820190915260018152600360fc1b602082015290565b815f5b811561190957806118f38161235e565b91506119029050600a83612116565b91506118e3565b5f8167ffffffffffffffff81111561192357611923611f86565b6040519080825280601f01601f19166020018201604052801561194d576020820181803683370190505b5090505b84156119b757611962600183612376565b915061196f600a86612389565b61197a906030612129565b60f81b81838151811061198f5761198f6122f3565b60200101906001600160f81b03191690815f1a9053506119b0600a86612116565b9450611951565b949350505050565b5f6001600160e01b031982166380ac58cd60e01b14806119ef57506001600160e01b03198216635b5e139f60e01b145b8061078e57506301ffc9a760e01b6001600160e01b031983161461078e565b8080611a2257506001600160a01b03821615155b15611ae3575f611a318461132f565b90506001600160a01b03831615801590611a5d5750826001600160a01b0316816001600160a01b031614155b8015611a705750611a6e8184611183565b155b15611a995760405163a9fbf51f60e01b81526001600160a01b0384166004820152602401610890565b8115611ae15783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b50505f90815260046020526040902080546001600160a01b0319166001600160a01b0392909216919091179055565b611b1d838383611be8565b610aa0576001600160a01b038316611b4b57604051637e27328960e01b815260048101829052602401610890565b60405163177e802f60e01b81526001600160a01b038316600482015260248101829052604401610890565b5f8051602061239d83398151915254600203610a7457604051633ee5aeb560e01b815260040160405180910390fd5b600854600160a01b900460ff16610a7457604051638dfc202b60e01b815260040160405180910390fd5b6107a6828260405180602001604052805f815250611c49565b5f6001600160a01b038316158015906119b75750826001600160a01b0316846001600160a01b03161480611c215750611c218484611183565b806119b75750505f908152600460205260409020546001600160a01b03908116911614919050565b611c538383611c60565b610aa0335f858585611792565b6001600160a01b038216611c8957604051633250574960e11b81525f6004820152602401610890565b5f611c9583835f611374565b90506001600160a01b03811615610aa0576040516339e3563760e11b81525f6004820152602401610890565b6001600160e01b031981168114611073575f80fd5b5f60208284031215611ce6575f80fd5b8135611cf181611cc1565b9392505050565b80356001600160a01b0381168114611d0e575f80fd5b919050565b5f8060408385031215611d24575f80fd5b611d2d83611cf8565b915060208301356001600160601b0381168114611d48575f80fd5b809150509250929050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f611cf16020830184611d53565b5f60208284031215611da3575f80fd5b5035919050565b5f8060408385031215611dbb575f80fd5b611dc483611cf8565b946020939093013593505050565b5f60208284031215611de2575f80fd5b611cf182611cf8565b5f805f60608486031215611dfd575f80fd5b611e0684611cf8565b9250611e1460208501611cf8565b929592945050506040919091013590565b5f8060408385031215611e36575f80fd5b50508035926020909101359150565b5f8060208385031215611e56575f80fd5b823567ffffffffffffffff811115611e6c575f80fd5b8301601f81018513611e7c575f80fd5b803567ffffffffffffffff811115611e92575f80fd5b856020828401011115611ea3575f80fd5b6020919091019590945092505050565b80358015158114611d0e575f80fd5b5f60208284031215611ed2575f80fd5b611cf182611eb3565b5f805f60408486031215611eed575f80fd5b83359250602084013567ffffffffffffffff811115611f0a575f80fd5b8401601f81018613611f1a575f80fd5b803567ffffffffffffffff811115611f30575f80fd5b8660208260051b8401011115611f44575f80fd5b939660209190910195509293505050565b5f8060408385031215611f66575f80fd5b611f6f83611cf8565b9150611f7d60208401611eb3565b90509250929050565b634e487b7160e01b5f52604160045260245ffd5b5f805f8060808587031215611fad575f80fd5b611fb685611cf8565b9350611fc460208601611cf8565b925060408501359150606085013567ffffffffffffffff811115611fe6575f80fd5b8501601f81018713611ff6575f80fd5b803567ffffffffffffffff81111561201057612010611f86565b604051601f8201601f19908116603f0116810167ffffffffffffffff8111828210171561203f5761203f611f86565b604052818152828201602001891015612056575f80fd5b816020840160208301375f6020838301015280935050505092959194509250565b5f8060408385031215612088575f80fd5b61209183611cf8565b9150611f7d60208401611cf8565b600181811c908216806120b357607f821691505b6020821081036120d157634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b808202811582820484141761078e5761078e6120d7565b634e487b7160e01b5f52601260045260245ffd5b5f8261212457612124612102565b500490565b8082018082111561078e5761078e6120d7565b601f821115610aa057805f5260205f20601f840160051c810160208510156121615750805b601f840160051c820191505b818110156118b3575f815560010161216d565b67ffffffffffffffff83111561219857612198611f86565b6121ac836121a6835461209f565b8361213c565b5f601f8411600181146121dd575f85156121c65750838201355b5f19600387901b1c1916600186901b1783556118b3565b5f83815260208120601f198716915b8281101561220c57868501358255602094850194600190920191016121ec565b5086821015612228575f1960f88860031b161c19848701351681555b505060018560011b0183555050505050565b60208152816020820152818360408301375f818301604090810191909152601f909201601f19160101919050565b5f8084546122758161209f565b60018216801561228c57600181146122a1576122ce565b60ff19831686528115158202860193506122ce565b875f5260205f205f5b838110156122c6578154888201526001909101906020016122aa565b505081860193505b50505083518060208601835e64173539b7b760d91b9101908152600501949350505050565b634e487b7160e01b5f52603260045260245ffd5b6001600160a01b03858116825284166020820152604081018390526080606082018190525f9061233990830184611d53565b9695505050505050565b5f60208284031215612353575f80fd5b8151611cf181611cc1565b5f6001820161236f5761236f6120d7565b5060010190565b8181038181111561078e5761078e6120d7565b5f8261239757612397612102565b50069056fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220d1b9193ea1ab7a5ee733d5cc7a807427c0343397e4911d42ea7b3e800a69248764736f6c634300081a0033" as `0x${string}`;
