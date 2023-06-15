const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { getEIP712Signature } = require("./common/utilities");

const {
  SIGNING_DOMAIN_NAME,
  SIGNATURE_VERSION,
  CHAIN_ID,
  TOKEN_ID,
} = require("./common/constants");

describe("Minting Test", () => {
  const deployContractFixture = async () => {
    const Minting = await ethers.getContractFactory("Minting");
    const minting = await Minting.deploy();
    await minting.deployed();

    return { minting };
  };

  before(async function () {
    [owner, signer1, signer2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const { minting: mintingInstance } = await loadFixture(
      deployContractFixture
    );
    minting = mintingInstance;
  });

  describe("Calling functions", () => {
    describe("#minting", () => {
      const setupSignature = async (contractAddress, signer) => {
        const domain = {
          name: SIGNING_DOMAIN_NAME,
          version: SIGNATURE_VERSION,
          verifyingContract: contractAddress,
          chainId: CHAIN_ID,
        };

        const voucher = { tokenId: TOKEN_ID, receiver: signer.address };
        const types = {
          TokenVoucher: [
            { name: "tokenId", type: "uint256" },
            { name: "receiver", type: "address" },
          ],
        };

        const signature = await getEIP712Signature(
          domain,
          types,
          voucher,
          signer
        );

        return { ...voucher, signature };
      };

      it("Should recover correct address", async () => {
        const result = await setupSignature(minting.address, signer1);
        const { tokenId, receiver, signature } = result;

        const recoveredAddress = await minting.recover(
          [tokenId, receiver],
          signature
        );

        await expect(recoveredAddress).to.equal(signer1.address);
        await expect(recoveredAddress).to.not.equal(signer2.address);
      });

      it("Should able to mint if valid signer", async () => {
        const result = await setupSignature(minting.address, signer1);
        const { tokenId, receiver, signature } = result;

        await minting.connect(signer1).safeMint([tokenId, receiver], signature);

        // Not allowed if the caller does not owned the signature
        await expect(
          minting.connect(signer2).safeMint([tokenId, receiver], signature)
        ).to.be.revertedWith("Wrong signature.");

        // check if balance is correct
        const balance = await minting.totalSupply();
        await expect(balance).is.equal(1);
      });
    });
  });
});
