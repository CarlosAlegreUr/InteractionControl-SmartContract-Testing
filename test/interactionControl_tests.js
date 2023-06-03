const { assert, expect } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");

function getSelector(functionSignature) {
  const hash = ethers.utils.solidityKeccak256(["string"], [functionSignature]);
  return hash.substring(0, 10);
}

describe("InteractionControl.sol tests", function () {
  let deployer,
    client1,
    client2,
    useCaseContract,
    useCaseContractClient1,
    funcSig1,
    funcSig2,
    funcSelec1,
    funcSelec2;

  beforeEach(async function () {
    const {
      deployer: dep,
      client1: c1,
      client2: c2,
    } = await getNamedAccounts();
    deployer = dep;
    client1 = c1;
    client2 = c2;
    funcSig1 = "changeData(uint256)";
    funcSig2 = "incrementData(uint256)";
    funcSelec1 = getSelector(funcSig1);
    funcSelec2 = getSelector(funcSig2);
  });

  describe("InteractionControl functionalities implemented in other contract tests.", function () {
    beforeEach(async function () {
      useCaseContract = await ethers.getContract("UseCaseContract", deployer);
      useCaseContractClient1 = await ethers.getContract(
        "UseCaseContract",
        client1
      );
    });

    it("Check if CallOrderControl is called correctly.", async () => {
      // Permission not given yet, must revert.
      await expect(
        useCaseContractClient1.changeData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "CallOrderControl__NotAllowedCall"
      );

      let validInput = await ethers.utils.defaultAbiCoder.encode(
        ["uint256"],
        [1]
      );
      validInput = await ethers.utils.keccak256(validInput);
      await useCaseContract.callAllowInputsFor(
        client1,
        [validInput, validInput],
        funcSig1,
        false
      );
      await useCaseContract.callAllowInputsFor(
        client1,
        [validInput],
        funcSig2,
        false
      );

      await useCaseContract.callAllowFuncCallsFor(
        client1,
        [funcSelec1, funcSelec2, funcSelec1],
        true
      );

      // Permission given but calling in different order, must revert.
      await expect(
        useCaseContractClient1.incrementData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "CallOrderControl__NotAllowedCall"
      );

      // Calling in correct order, should execute correctly.
      await useCaseContractClient1.changeData(1);
      let number = await useCaseContractClient1.getNumber();
      assert.equal(1, number);

      await useCaseContractClient1.incrementData(1);
      number = await useCaseContractClient1.getNumber();
      assert.equal(2, number);

      await useCaseContractClient1.changeData(1);
      number = await useCaseContractClient1.getNumber();
      assert.equal(1, number);

      // After calling correctly, if calling again must revert.
      await expect(
        useCaseContractClient1.changeData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "CallOrderControl__NotAllowedCall"
      );

      await expect(
        useCaseContractClient1.incrementData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "CallOrderControl__NotAllowedCall"
      );

      await expect(
        useCaseContractClient1.changeData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "CallOrderControl__NotAllowedCall"
      );
    });

    it("Check if InputControl is called correctly.", async () => {
      let validInput = await ethers.utils.defaultAbiCoder.encode(
        ["uint256"],
        [1]
      );
      validInput = await ethers.utils.keccak256(validInput);

      let validInput2 = await ethers.utils.defaultAbiCoder.encode(
        ["uint256"],
        [2]
      );
      validInput2 = await ethers.utils.keccak256(validInput2);

      // Permission not given yet, must revert.
      await expect(
        useCaseContractClient1.changeData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "CallOrderControl__NotAllowedCall"
      );

      await useCaseContract.callAllowFuncCallsFor(
        client1,
        [funcSelec1, funcSelec1, funcSelec1],
        false
      );

      await useCaseContract.callAllowInputsFor(
        client1,
        [validInput, validInput2, validInput],
        funcSig1,
        false
      );

      // Permission given, should not revert.
      await useCaseContractClient1.changeData(1);
      let number = await useCaseContractClient1.getNumber();
      assert.equal(1, number);

      await useCaseContractClient1.changeData(2);
      number = await useCaseContractClient1.getNumber();
      assert.equal(2, number);

      await useCaseContractClient1.changeData(1);
      number = await useCaseContractClient1.getNumber();
      assert.equal(1, number);

      await useCaseContract.callAllowFuncCallsFor(
        client1,
        [funcSelec1, funcSelec1, funcSelec1],
        false
      );

      // Inputs already used, must revert.
      await expect(
        useCaseContractClient1.changeData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "InputControl__NotAllowedInput"
      );

      await expect(
        useCaseContractClient1.changeData(2)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "InputControl__NotAllowedInput"
      );

      await expect(
        useCaseContractClient1.changeData(1)
      ).revertedWithCustomError(
        useCaseContractClient1,
        "InputControl__NotAllowedInput"
      );

      await useCaseContract.callAllowInputsFor(
        client1,
        [validInput, validInput2, validInput],
        funcSig1,
        false
      );

      // Resettin permissions for next times tests run.
      await useCaseContract.callAllowInputsFor(
        client1,
        [validInput, validInput2, validInput],
        funcSig1,
        false
      );
      await useCaseContractClient1.changeData(1);
      number = await useCaseContractClient1.getNumber();
      assert.equal(1, number);
      await useCaseContractClient1.changeData(2);
      number = await useCaseContractClient1.getNumber();
      assert.equal(2, number);
      await useCaseContractClient1.changeData(1);
      number = await useCaseContractClient1.getNumber();
      assert.equal(1, number);
    });
  });
});
