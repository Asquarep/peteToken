import { expect } from "chai";
import { ethers } from "hardhat";

describe("PeteToken", function () {
    let token: any, owner: any, user1: any, user2: any;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const PeteToken = await ethers.getContractFactory("PeteToken");
        token = await PeteToken.deploy("PeteCoin", "PTC");
        await token.waitForDeployment();
    });

    it("Should return correct token name and symbol", async function () {
        expect(await token.getTokenName()).to.equal("PeteCoin");
        expect(await token.getSymbol()).to.equal("PTC");
    });

    it("Should return correct total supply", async function () {
        expect(await token.getTotalSupply()).to.equal(ethers.parseUnits("1000000", 18));
    });

    it("Should return correct decimals", async function () {
        expect(await token.decimal()).to.equal(18);
    });

    it("Should return correct balanceOf", async function () {
        expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("1000000", 18));
        expect(await token.balanceOf(user1.address)).to.equal(0);
    });

    it("Should transfer tokens correctly", async function () {
        await token.transfer(user1.address, ethers.parseUnits("100", 18));
        expect(await token.balanceOf(user1.address)).to.equal(ethers.parseUnits("100", 18));
    });

    it("Should fail to transfer more than balance", async function () {
        await expect(
            token.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18))
        ).to.be.revertedWith("You can't take more than what is avaliable");
    });

    it("Should fail when transferring to zero address", async function () {
        await expect(
            token.transfer(ethers.ZeroAddress, ethers.parseUnits("10", 18))
        ).to.be.revertedWith("Transfer to the zero address is not allowed");
    });

    it("Should approve token spending correctly", async function () {
        await token.approve(user1.address, ethers.parseUnits("50", 18));
        expect(await token.allowance(owner.address, user1.address)).to.equal(ethers.parseUnits("50", 18));
    });

    it("Should fail approval if balance is insufficient", async function () {
        await expect(
            token.connect(user1).approve(user2.address, ethers.parseUnits("10", 18))
        ).to.be.revertedWith("Balance is not enough");
    });

    it("Should transferFrom correctly when approved", async function () {
        await token.approve(user1.address, ethers.parseUnits("50", 18));
        await token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseUnits("50", 18));
        expect(await token.balanceOf(user2.address)).to.equal(ethers.parseUnits("50", 18));
    });

    it("Should fail transferFrom if not enough allowance", async function () {
        await expect(
            token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseUnits("10", 18))
        ).to.be.reverted;
    });

    it("Should fail transferFrom when owner address is zero", async function () {
        await expect(
            token.connect(user1).transferFrom(ethers.ZeroAddress, user2.address, ethers.parseUnits("10", 18))
        ).to.be.revertedWith("Address is not allowed");
    });
});