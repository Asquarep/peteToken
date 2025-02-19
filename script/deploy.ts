import { ethers } from "hardhat";

const main = async () => {
    const [deployer, seller, buyer] = await ethers.getSigners();

    console.log(`Deploying contract with account: ${deployer.address}`);

    // Deploy Reverse Dutch Auction contract
    const AuctionFactory = await ethers.getContractFactory("ReverseDutchAuction");
    const auctionContract = await AuctionFactory.deploy();
    await auctionContract.waitForDeployment();
    const auctionAddress = await auctionContract.getAddress();
    console.log(`Auction Contract deployed at: ${auctionAddress}`);

    // ERC20 Mock Token Deployment (if you need a test token)
    const TokenFactory = await ethers.getContractFactory("ERC20Mock");
    const token = await TokenFactory.deploy("TestToken", "TTK", 18);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`Mock Token deployed at: ${tokenAddress}`);

    // Seller mints and approves tokens
    const tokenAmount = ethers.parseUnits("1000", 18); // 1000 TTK
    await token.mint(seller.address, tokenAmount);
    await token.connect(seller).approve(auctionAddress, tokenAmount);
    console.log("Seller approved tokens for auction.");

    // Create auction
    const initialPrice = ethers.parseUnits("100", 18); // 100 tokens
    const duration = 300; // 5 minutes
    const priceDecreaseRate = ethers.parseUnits("1", 18); // 1 token per second

    const tx = await auctionContract.connect(seller).createAuction(
        tokenAddress,
        tokenAmount,
        initialPrice,
        duration,
        priceDecreaseRate
    );
    await tx.wait();
    console.log("Auction created successfully.");

    // Wait some time before buying (simulate price drop)
    console.log("Waiting for price to drop...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate 5 sec delay

    // Check current price
    const auctionId = 1;
    const currentPrice = await auctionContract.getCurrentPrice(auctionId);
    console.log(`Current price after delay: ${ethers.formatUnits(currentPrice, 18)} TTK`);

    // Buyer approves payment and buys at the reduced price
    await token.mint(buyer.address, initialPrice); // Mint enough for purchase
    await token.connect(buyer).approve(auctionAddress, initialPrice);
    console.log("Buyer approved token for purchase.");

    await auctionContract.connect(buyer).buy(auctionId);
    console.log("Auction successfully finalized by buyer.");

    console.log("Script execution completed.");
};

// Execute the script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
