// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SubmitWithWorldMiniApp is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    string private constant TOKEN_URI = "https://chocolate-magnetic-scorpion-427.mypinata.cloud/ipfs/bafybeihsnuyx5j6f42edqkpybrffa3fpd54y6pyzd2b2nrnyjq7hucoj7m";

    constructor() ERC721("Submit with World Mini App", "BADGE") Ownable(msg.sender) {}

    function mint(address recipient) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, TOKEN_URI);
        _tokenIdCounter++;
    }
}
