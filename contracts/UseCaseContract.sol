// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./InteractionControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// AccessControl.sol is not used in this contract but here it is if
// you want to play with it. (:D)
import "@openzeppelin/contracts/access/AccessControl.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title Example of contract using InteractionControl.
 * @author Carlos Alegre Urquizú (GitHub --> https://github.com/CarlosAlegreUr)
 *
 * @dev To use InteractionControl make your contract inherits InteractionControl, add the isAllowedInteraction()
 * modifier in the functions you desire to fully control.
 *
 * The isAllowedInteraction() has 3 parameters:
 *
 * -First = function selector of the function where it's being applied => bytes4(keccak256(bytes("funcSignatureAsString")))
 * -Second = msg.sender => to know who is calling.
 * -Third = a unique identifier of the inputs and it's values => keccak256(abi.encode(_newNumber))
 *
 * Implementation in code below.
 *
 * Btw it's essential you use abi.enconde() and not abi.encodePakced() because abi.encodePakced()
 * can give the same output to different inputs.
 *
 * @dev Additionally you can override callAllowInputsFor() or and callAllowFuncCallsFor() if you please mixing this
 * InteractionControl with, for example, other useful ones like Ownable or AccessControl contracts from OpenZeppelin.
 *
 * @notice As InteractionControl inherits from CallOrderControl.sol and InputControl.sol you can use their modifier directly
 * if pleased.
 */
contract UseCaseContract is InteractionControl, Ownable {
    uint256 private s_myData;

    function changeData(
        uint256 _newNumber
    )
        public
        isAllowedInteraction(
            bytes4(keccak256(bytes("changeData(uint256)"))), // <-- Look!
            msg.sender, // <-- Look!
            keccak256(abi.encode(_newNumber)) // <-- Look!
        )
    {
        s_myData = _newNumber;
    }

    function incrementData(
        uint256 _increment
    )
        public
        isAllowedInteraction(
            bytes4(keccak256(bytes("incrementData(uint256)"))), // <-- Look!
            msg.sender, // <-- Look!
            keccak256(abi.encodePacked(_increment)) // <-- Look!
        )
    {
        s_myData += _increment;
    }

    function getNumber() public view returns (uint256) {
        return s_myData;
    }

    // Override so you can control all interactions and even mix the control with
    // useful modifiers such as OpenZeppelin's onlyRole from AccessControl.sol or
    // onlyOwner from Owner.sol.
    function callAllowInputsFor(
        address _client,
        bytes32[] calldata _validInputs,
        string calldata _funcSignature,
        bool _isSequence
    ) public override onlyOwner {
        allowInputsFor(_client, _validInputs, _funcSignature, _isSequence);
    }

    function callAllowFuncCallsFor(
        address _callerAddress,
        bytes4[] calldata _validFuncCalls,
        bool _isSequence
    ) public override onlyOwner {
        allowFuncCallsFor(_callerAddress, _validFuncCalls, _isSequence);
    }
}
