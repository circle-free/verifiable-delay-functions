// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;
import "./sloth-verifiable-delay.sol";

contract Sloth_Test_Harness {
  uint256 public y;
  bool public valid;

  // Stateful
  function set(uint256 _y) external {
    y = _y;
  }

  // Stateful
  function compute_and_store(
    uint256 _x,
    uint256 _p,
    uint256 _i
  ) external {
    y = Sloth_Verifiable_Delay.compute(_x, _p, _i);
  }

  // Stateful
  function verify_and_store(
    uint256 _x,
    uint256 _p,
    uint256 _i
  ) external {
    valid = Sloth_Verifiable_Delay.verify(y, _x, _p, _i);
  }

  // Stateless
  function compute(
    uint256 _x,
    uint256 _p,
    uint256 _i
  ) external pure returns (uint256) {
    return Sloth_Verifiable_Delay.compute(_x, _p, _i);
  }

  // Stateless
  function verify(
    uint256 _y,
    uint256 _x,
    uint256 _p,
    uint256 _i
  ) external pure returns (bool) {
    return Sloth_Verifiable_Delay.verify(_y, _x, _p, _i);
  }
}
