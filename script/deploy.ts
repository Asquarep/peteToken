import { ethers } from "hardhat";

const main = async () => {
    const [deployer, user1, user2] = await ethers.getSigners();

    console.log(`\nDeploying contract with account: ${deployer.address}`);

    // Deploy PeteToken contract
    const PeteToken = await ethers.getContractFactory("PeteToken");
    const token = await PeteToken.deploy("PeteCoin", "PTC");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`\nPeteToken deployed at: ${tokenAddress}`);

    // Check initial supply
    const totalSupply = await token.getTotalSupply();
    console.log(`\nTotal Supply: ${ethers.formatUnits(totalSupply, 18)} PTC`);

    // Transfer tokens from deployer to user1
    const transferAmount = ethers.parseUnits("100", 18);
    await token.transfer(user1.address, transferAmount);
    console.log(`\nTransferred ${ethers.formatUnits(transferAmount, 18)} PTC to ${user1.address}`);
    const user1Balance = await token.balanceOf(user1.address);
    console.log(`\nUser 1 balance: ${user1Balance}`);

    // Approve user2 to spend on behalf of user1
    const approvedAmount = ethers.parseUnits("60", 18);
    await token.connect(user1).approve(user2.address, approvedAmount);
    console.log(`\n${user1.address} approved ${approvedAmount} PTC for ${user2.address}`);

    // user2 transfers from user1 to deployer
    const spendAmount = ethers.parseUnits("20", 18);
    await token.connect(user2).transferFrom(user1.address, deployer.address, spendAmount);
    console.log(`\n${user2.address} transferred ${spendAmount} PTC from ${user1.address} to ${deployer.address}`);

    console.log("\nScript execution completed.");
};

// Execute the script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
