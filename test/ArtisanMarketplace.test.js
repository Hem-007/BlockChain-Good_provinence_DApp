const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("ArtisanMarketplace", function () {
  let artisanMarketplace;
  let owner;
  let artisan1;
  let artisan2;
  let buyer;

  const artisan1Data = {
    id: "artisan-1",
    name: "Lakshmi Pottery",
    bio: "Creating handcrafted pottery with traditional Chennai designs for over 20 years.",
    profileImage: "https://picsum.photos/seed/lakshmi/200/200"
  };

  const productData = {
    name: "Terracotta Vase 'Sunrise'",
    description: "A beautiful hand-painted terracotta vase depicting a sunrise over the Marina Beach.",
    materials: ["Terracotta Clay", "Natural Dyes"],
    imageUrl: "https://picsum.photos/seed/pottery1/600/400",
    price: ethers.parseEther("0.05"),
    tokenURI: "ipfs://QmTokenURI"
  };

  async function deployContractFixture() {
    const [owner, artisan1, artisan2, buyer] = await ethers.getSigners();

    const ArtisanMarketplace = await ethers.getContractFactory("ArtisanMarketplace");
    const artisanMarketplace = await ArtisanMarketplace.deploy();

    return { artisanMarketplace, owner, artisan1, artisan2, buyer };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployContractFixture);
    artisanMarketplace = fixture.artisanMarketplace;
    owner = fixture.owner;
    artisan1 = fixture.artisan1;
    artisan2 = fixture.artisan2;
    buyer = fixture.buyer;
  });

  describe("Artisan Registration", function () {
    it("Should register a new artisan", async function () {
      await artisanMarketplace.connect(artisan1).registerArtisan(
        artisan1Data.id,
        artisan1Data.name,
        artisan1Data.bio,
        artisan1Data.profileImage
      );

      const isRegistered = await artisanMarketplace.isArtisanRegistered(artisan1.address);
      expect(isRegistered).to.be.true;

      const artisanInfo = await artisanMarketplace.getArtisanByAddress(artisan1.address);
      expect(artisanInfo.name).to.equal(artisan1Data.name);
      expect(artisanInfo.bio).to.equal(artisan1Data.bio);
    });

    it("Should not allow duplicate artisan IDs", async function () {
      await artisanMarketplace.connect(artisan1).registerArtisan(
        artisan1Data.id,
        artisan1Data.name,
        artisan1Data.bio,
        artisan1Data.profileImage
      );

      await expect(
        artisanMarketplace.connect(artisan2).registerArtisan(
          artisan1Data.id, // Same ID
          "Different Name",
          "Different Bio",
          "Different Image"
        )
      ).to.be.revertedWith("Artisan ID already exists");
    });
  });

  describe("Product Creation", function () {
    beforeEach(async function () {
      await artisanMarketplace.connect(artisan1).registerArtisan(
        artisan1Data.id,
        artisan1Data.name,
        artisan1Data.bio,
        artisan1Data.profileImage
      );
    });

    it("Should create a new product", async function () {
      const tx = await artisanMarketplace.connect(artisan1).createProduct(
        productData.name,
        productData.description,
        productData.materials,
        productData.imageUrl,
        productData.price,
        productData.tokenURI
      );

      // Get the token ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'ProductCreated'
      );
      const tokenId = event ? event.args[0] : 0;

      const product = await artisanMarketplace.products(tokenId);
      expect(product.name).to.equal(productData.name);
      expect(product.description).to.equal(productData.description);
      expect(product.price).to.equal(productData.price);
      expect(product.isSold).to.be.false;
      expect(product.ownerAddress).to.equal(artisan1.address);
    });

    it("Should not allow non-artisans to create products", async function () {
      await expect(
        artisanMarketplace.connect(buyer).createProduct(
          productData.name,
          productData.description,
          productData.materials,
          productData.imageUrl,
          productData.price,
          productData.tokenURI
        )
      ).to.be.revertedWith("Only registered artisans can create products");
    });
  });

  describe("Product Purchase", function () {
    let tokenId;

    beforeEach(async function () {
      await artisanMarketplace.connect(artisan1).registerArtisan(
        artisan1Data.id,
        artisan1Data.name,
        artisan1Data.bio,
        artisan1Data.profileImage
      );

      const tx = await artisanMarketplace.connect(artisan1).createProduct(
        productData.name,
        productData.description,
        productData.materials,
        productData.imageUrl,
        productData.price,
        productData.tokenURI
      );

      // Get the token ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'ProductCreated'
      );
      tokenId = event ? event.args[0] : 0;
    });

    it("Should allow a buyer to purchase a product", async function () {
      const artisanBalanceBefore = await ethers.provider.getBalance(artisan1.address);

      await artisanMarketplace.connect(buyer).purchaseProduct(tokenId, {
        value: productData.price
      });

      const product = await artisanMarketplace.products(tokenId);
      expect(product.isSold).to.be.true;
      expect(product.ownerAddress).to.equal(buyer.address);

      const artisanBalanceAfter = await ethers.provider.getBalance(artisan1.address);
      expect(artisanBalanceAfter - artisanBalanceBefore).to.equal(productData.price);

      const ownerOfToken = await artisanMarketplace.ownerOf(tokenId);
      expect(ownerOfToken).to.equal(buyer.address);
    });

    it("Should not allow purchase with insufficient funds", async function () {
      const insufficientAmount = ethers.parseEther("0.01"); // Less than the price

      await expect(
        artisanMarketplace.connect(buyer).purchaseProduct(tokenId, {
          value: insufficientAmount
        })
      ).to.be.reverted; // Just check that it reverts, not the specific message
    });

    it("Should not allow purchase of already sold products", async function () {
      await artisanMarketplace.connect(buyer).purchaseProduct(tokenId, {
        value: productData.price
      });

      await expect(
        artisanMarketplace.connect(artisan2).purchaseProduct(tokenId, {
          value: productData.price
        })
      ).to.be.revertedWith("Product already sold");
    });
  });

  describe("Product Verification", function () {
    let tokenId;

    beforeEach(async function () {
      await artisanMarketplace.connect(artisan1).registerArtisan(
        artisan1Data.id,
        artisan1Data.name,
        artisan1Data.bio,
        artisan1Data.profileImage
      );

      const tx = await artisanMarketplace.connect(artisan1).createProduct(
        productData.name,
        productData.description,
        productData.materials,
        productData.imageUrl,
        productData.price,
        productData.tokenURI
      );

      // Get the token ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'ProductCreated'
      );
      tokenId = event ? event.args[0] : 0;
    });

    it("Should allow the owner to verify a product", async function () {
      await artisanMarketplace.connect(owner).verifyProduct(tokenId);

      const product = await artisanMarketplace.products(tokenId);
      expect(product.isVerified).to.be.true;
    });

    it("Should not allow non-owners to verify products", async function () {
      await expect(
        artisanMarketplace.connect(artisan1).verifyProduct(tokenId)
      ).to.be.reverted; // Just check that it reverts, not the specific message
    });
  });

  describe("Provenance Tracking", function () {
    let tokenId;

    beforeEach(async function () {
      await artisanMarketplace.connect(artisan1).registerArtisan(
        artisan1Data.id,
        artisan1Data.name,
        artisan1Data.bio,
        artisan1Data.profileImage
      );

      const tx = await artisanMarketplace.connect(artisan1).createProduct(
        productData.name,
        productData.description,
        productData.materials,
        productData.imageUrl,
        productData.price,
        productData.tokenURI
      );

      // Get the token ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'ProductCreated'
      );
      tokenId = event ? event.args[0] : 0;
    });

    it("Should track product provenance", async function () {
      // Purchase the product to add another provenance event
      await artisanMarketplace.connect(buyer).purchaseProduct(tokenId, {
        value: productData.price
      });

      // Verify the product to add another provenance event
      await artisanMarketplace.connect(owner).verifyProduct(tokenId);

      const provenance = await artisanMarketplace.getProductProvenance(tokenId);

      // Should have 3 events: creation, purchase, and verification
      expect(provenance.length).to.equal(3);
      expect(provenance[0].eventType).to.equal("Created by Artisan");
      expect(provenance[1].eventType).to.equal("Sold");
      expect(provenance[2].eventType).to.equal("Verified");
    });
  });
});
