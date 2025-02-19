import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReverseDutchAuction", function () {
    let auction: any;
    let token: any;
    let owner: any;
    let buyer: any;

    before(async function () {
        [owner, buyer] = await ethers.getSigners();
    
        const Token = await ethers.getContractFactory("ERC20Mock");
        token = await Token.deploy("Test Token", "TT", 18);
        await token.waitForDeployment();
    
        // Mint tokens to the buyer
        await token.mint(buyer.address, ethers.parseUnits("5000", 18));
    
        const ReverseDutchAuction = await ethers.getContractFactory("ReverseDutchAuction");
        auction = await ReverseDutchAuction.deploy();
        await auction.waitForDeployment();
    });

    it("Should create an auction", async function () {
        const amount = ethers.parseUnits("100", 18);
        const initialPrice = ethers.parseUnits("1000", 18);
        const duration = 300; // 5 minutes
        const priceDecreaseRate = ethers.parseUnits("2", 18);

        await token.connect(owner).approve(await auction.getAddress(), amount);
        await auction.createAuction(token.getAddress(), amount, initialPrice, duration, priceDecreaseRate);

        const auctionData = await auction.auctions(1);
        expect(auctionData.seller).to.equal(owner.address);
        expect(auctionData.amount).to.equal(amount);
    });

    it("Should allow a buyer to purchase", async function () {
        await ethers.provider.send("evm_increaseTime", [120]); // Simulate 2 minutes passed
        await ethers.provider.send("evm_mine");

        const priceBefore = await auction.getCurrentPrice(1);
        console.log(`🔹 Current Price Before Purchase: ${ethers.formatUnits(priceBefore, 18)} TT`);

        await token.connect(buyer).approve(await auction.getAddress(), priceBefore);
        await auction.connect(buyer).buy(1);

        const priceAfter = await auction.getCurrentPrice(1);
        console.log(`✅ Auction Finalized. Price Paid: ${ethers.formatUnits(priceAfter, 18)} TT`);

        const auctionData = await auction.auctions(1);
        expect(auctionData.active).to.equal(false);
    });
});