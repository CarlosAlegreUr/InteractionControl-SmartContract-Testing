// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "input-control-contract/InputControl.sol";
import "call-order-control-contract/CallOrderControl.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title Interaction Control.
 * @author Carlos Alegre Urquizú (GitHub --> https://github.com/CarlosAlegreUr)
 *
 * @notice InteractionControl combines different smart contracts to grant total control
 * of your functions if desired. From who calls them to in which order and even with which
 * inputs' values.
 *
 * @dev Check an usecase on a contract at UseCaseContract.sol on the github repo:
 * (add Link)
 *
 */
contract InteractionControl is CallOrderControl, InputControl {
    /* Modifiers */

    /**
     * @dev Calls modifierApplier() function which has this two
     * modifiers applied to it:
     *
     *          isAllowedCall() => (link)
     *          isAllowedInput() => (link)
     *
     * Check the link for details on how they work.
     */
    modifier isAllowedInteraction(
        bytes4 _funcSig,
        address _clientAddress,
        bytes32 _input
    ) {
        modifierApplier(_funcSig, _clientAddress, _input);
        _;
    }

    /* Functions */

    /**
     * @dev Helper function to use modifiers inside
     * another modifier. In this case inside isAllowedInteraction()
     * modifier above.
     */
    function modifierApplier(
        bytes4 _funcSelec,
        address _clientAddress,
        bytes32 _input
    )
        private
        isAllowedCall(_funcSelec, _clientAddress)
        isAllowedInput(_funcSelec, _clientAddress, _input)
    {}
}
