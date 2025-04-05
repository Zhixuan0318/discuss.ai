// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICCTPTransmitter {
    function receiveMessage(bytes calldata messageBytes, bytes calldata attestation) external;
}

contract DestinationCaller is ERC721, Ownable {
    address public transmitter;
    uint256 private _tokenIdCounter;
    string private constant TOKEN_URI = "https://chocolate-magnetic-scorpion-427.mypinata.cloud/ipfs/bafkreidsrtv65bflrnm4ftp3652x56phemyqis5ppcbdduz4lmbbthrafi";

    event MessageDecoded(address recipient, string action);

    constructor(address _transmitter) ERC721("Celebrate a Successful CCTP V2", "BADGE") Ownable(msg.sender) {
        transmitter = _transmitter;
    }

    function receiveMessage(bytes calldata messageBytes, bytes calldata attestation) external {
        // Try calling the receiveMessage function on the transmitter contract
        try ICCTPTransmitter(transmitter).receiveMessage(messageBytes, attestation) {
            // Ensure the messageBytes length is at least 128 bytes
            require(messageBytes.length >= 128, "Invalid data length");
            
            // Slice the last 128 bytes
            bytes memory slicedData = new bytes(128);
            for (uint256 i = 0; i < 128; i++) {
                slicedData[i] = messageBytes[messageBytes.length - 128 + i];
            }
            
            // Decode the sliced bytes
            (address recipient, string memory action) = abi.decode(slicedData, (address, string));
            
            // Emit the decoded message
            emit MessageDecoded(recipient, action);

            // Check if action is "MINT_BADGE" and mint NFT if true
            if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("MINT_BADGE"))) {
                _mintNFT(recipient);
            }
        } catch {
            revert("receiveMessage() failed");
        }
    }

    function _mintNFT(address recipient) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(recipient, tokenId);
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return TOKEN_URI;
    }
}
