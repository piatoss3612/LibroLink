// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ReadingLog is ERC1155URIStorage, Ownable {
    error ReadingLog__NotMember();
    error ReadingLog__NotExists();

    IERC721 public immutable membershipNFT;

    struct Log {
        string title;
        string author;
        string isbn;
        address reader;
        uint48 shareCount;
        uint48 timestamp;
    }

    mapping(uint256 => Log) public readingLogs;
    uint256 public nextTokenId;

    event LogCreated(
        uint256 indexed tokenId, string title, string author, string isbn, string uri, address reader, uint48 timestamp
    );
    event LogShared(uint256 indexed tokenId, address indexed sharer, uint48 timestamp);
    event GatewayChanged(string gateway);

    constructor(address _membershipNFT, string memory _gateway) ERC1155("") Ownable(msg.sender) {
        membershipNFT = IERC721(_membershipNFT);
        _setGateway(_gateway);
    }

    function createReadingLog(string memory _title, string memory _author, string memory _isbn, string memory _uri)
        external
    {
        address caller = msg.sender;

        // Check if the sender is a member
        if (membershipNFT.balanceOf(caller) == 0) {
            revert ReadingLog__NotMember();
        }

        uint256 tokenId = nextTokenId++;
        uint48 timestamp = uint48(block.timestamp);

        readingLogs[tokenId] =
            Log({title: _title, author: _author, isbn: _isbn, reader: caller, shareCount: 0, timestamp: timestamp});

        _setURI(tokenId, _uri);
        _mint(caller, tokenId, 1, "");

        emit LogCreated(tokenId, _title, _author, _isbn, _uri, caller, timestamp);
    }

    function shareReadingLog(uint256 _tokenId) external {
        address caller = msg.sender;

        // Check if the sender is a member
        if (membershipNFT.balanceOf(caller) == 0) {
            revert ReadingLog__NotMember();
        }

        Log storage log = readingLogs[_tokenId];
        if (log.reader == address(0)) {
            revert ReadingLog__NotExists();
        }

        log.shareCount++;
        _mint(caller, _tokenId, 1, "");

        emit LogShared(_tokenId, caller, uint48(block.timestamp));
    }

    function setGateway(string memory _gateway) external onlyOwner {
        _setGateway(_gateway);
    }

    function _setGateway(string memory _gateway) internal {
        _setBaseURI(_gateway);
        emit GatewayChanged(_gateway);
    }
}
