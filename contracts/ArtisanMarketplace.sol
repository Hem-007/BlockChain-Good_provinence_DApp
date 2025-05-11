// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArtisanMarketplace
 * @dev A marketplace for artisans to register, create products as NFTs, and sell them
 */
contract ArtisanMarketplace is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Structs
    struct Artisan {
        string id;
        string name;
        string bio;
        string profileImage;
        bool isRegistered;
    }

    struct Product {
        uint256 tokenId;
        string name;
        string description;
        string[] materials;
        string artisanId;
        uint256 creationDate;
        string imageUrl;
        uint256 price; // in wei
        bool isVerified;
        bool isSold;
        address ownerAddress;
    }

    struct ProvenanceEvent {
        uint256 timestamp;
        string eventType;
        address actorAddress;
        string details;
    }

    // Mappings
    mapping(address => Artisan) public artisans;
    mapping(uint256 => Product) public products;
    mapping(uint256 => ProvenanceEvent[]) public productProvenance;
    mapping(string => address) public artisanIdToAddress;

    // Events
    event ArtisanRegistered(address indexed artisanAddress, string id, string name);
    event ProductCreated(uint256 indexed tokenId, string name, address artisanAddress, uint256 price);
    event ProductSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ProvenanceAdded(uint256 indexed tokenId, string eventType, address actorAddress);

    constructor() ERC721("ChennaiArtisanConnect", "CAC") Ownable(msg.sender) {}

    /**
     * @dev Register a new artisan
     * @param id Unique identifier for the artisan
     * @param name Name of the artisan
     * @param bio Bio of the artisan
     * @param profileImage URL to the profile image
     */
    function registerArtisan(
        string memory id,
        string memory name,
        string memory bio,
        string memory profileImage
    ) public {
        require(!artisans[msg.sender].isRegistered, "Artisan already registered");
        require(artisanIdToAddress[id] == address(0), "Artisan ID already exists");

        artisans[msg.sender] = Artisan({
            id: id,
            name: name,
            bio: bio,
            profileImage: profileImage,
            isRegistered: true
        });

        artisanIdToAddress[id] = msg.sender;

        emit ArtisanRegistered(msg.sender, id, name);
    }

    /**
     * @dev Create a new product as an NFT
     * @param name Name of the product
     * @param description Description of the product
     * @param materials Array of materials used
     * @param imageUrl URL to the product image
     * @param price Price in wei
     * @param tokenURI URI for the token metadata
     * @return tokenId The ID of the newly created token
     */
    function createProduct(
        string memory name,
        string memory description,
        string[] memory materials,
        string memory imageUrl,
        uint256 price,
        string memory tokenURI
    ) public returns (uint256) {
        require(artisans[msg.sender].isRegistered, "Only registered artisans can create products");

        uint256 newTokenId = _nextTokenId++;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        products[newTokenId] = Product({
            tokenId: newTokenId,
            name: name,
            description: description,
            materials: materials,
            artisanId: artisans[msg.sender].id,
            creationDate: block.timestamp,
            imageUrl: imageUrl,
            price: price,
            isVerified: false,
            isSold: false,
            ownerAddress: msg.sender
        });

        // Add creation event to provenance
        addProvenance(newTokenId, "Created by Artisan", msg.sender, "Initial creation");

        emit ProductCreated(newTokenId, name, msg.sender, price);

        return newTokenId;
    }

    /**
     * @dev Purchase a product
     * @param tokenId ID of the token to purchase
     */
    function purchaseProduct(uint256 tokenId) public payable {
        Product storage product = products[tokenId];
        require(!product.isSold, "Product already sold");
        require(msg.value >= product.price, "Insufficient funds");

        address seller = product.ownerAddress;

        // Update product status
        product.isSold = true;
        product.ownerAddress = msg.sender;

        // Transfer NFT ownership
        _transfer(seller, msg.sender, tokenId);

        // Add purchase event to provenance
        addProvenance(tokenId, "Sold", msg.sender, "Product purchased");

        // Transfer funds to seller
        (bool sent, ) = payable(seller).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit ProductSold(tokenId, seller, msg.sender, msg.value);
    }

    /**
     * @dev Add a provenance event to a product
     * @param tokenId ID of the token
     * @param eventType Type of event
     * @param actorAddress Address of the actor
     * @param details Additional details
     */
    function addProvenance(
        uint256 tokenId,
        string memory eventType,
        address actorAddress,
        string memory details
    ) internal {
        ProvenanceEvent memory newEvent = ProvenanceEvent({
            timestamp: block.timestamp,
            eventType: eventType,
            actorAddress: actorAddress,
            details: details
        });

        productProvenance[tokenId].push(newEvent);

        emit ProvenanceAdded(tokenId, eventType, actorAddress);
    }

    /**
     * @dev Verify a product (only owner can do this)
     * @param tokenId ID of the token to verify
     */
    function verifyProduct(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Product does not exist");
        products[tokenId].isVerified = true;

        addProvenance(tokenId, "Verified", msg.sender, "Product verified by marketplace owner");
    }

    /**
     * @dev Check if a token exists
     * @param tokenId ID of the token
     * @return True if the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return products[tokenId].tokenId == tokenId;
    }

    /**
     * @dev Get all provenance events for a product
     * @param tokenId ID of the token
     * @return Array of provenance events
     */
    function getProductProvenance(uint256 tokenId) public view returns (ProvenanceEvent[] memory) {
        return productProvenance[tokenId];
    }

    /**
     * @dev Check if an address is a registered artisan
     * @param artisanAddress Address to check
     * @return True if the address is a registered artisan
     */
    function isArtisanRegistered(address artisanAddress) public view returns (bool) {
        return artisans[artisanAddress].isRegistered;
    }

    /**
     * @dev Get artisan details by address
     * @param artisanAddress Address of the artisan
     * @return Artisan details
     */
    function getArtisanByAddress(address artisanAddress) public view returns (Artisan memory) {
        return artisans[artisanAddress];
    }

    /**
     * @dev Get artisan details by ID
     * @param artisanId ID of the artisan
     * @return Artisan details
     */
    function getArtisanById(string memory artisanId) public view returns (Artisan memory) {
        address artisanAddress = artisanIdToAddress[artisanId];
        require(artisanAddress != address(0), "Artisan not found");
        return artisans[artisanAddress];
    }
}
