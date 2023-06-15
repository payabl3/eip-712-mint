// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract Minting is ERC721, EIP712 {
    string private constant SIGNING_DOMAIN = "Voucher-Domain";
    string private constant SIGNATURE_VERSION = "1";
    uint256 public totalSupply = 0;
    constructor() ERC721("MyToken", "MTK") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    struct TokenVoucher {
        uint256 tokenId;
        address receiver;
    }

    function recover(TokenVoucher calldata voucher, bytes calldata signature) public view returns (address) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("TokenVoucher(uint256 tokenId,address receiver)"),
            voucher.tokenId,
            voucher.receiver
        )));
        address signer = ECDSA.recover(digest, signature);
        return signer;
    }

    function safeMint(TokenVoucher calldata voucher, bytes calldata signature) external {
        require(msg.sender == recover(voucher, signature), "Wrong signature.");
        _safeMint(voucher.receiver, voucher.tokenId);
        totalSupply++;
    }
}
