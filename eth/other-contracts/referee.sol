// SPDX-License-Identifier: MIT
// forked from http://www.jbonneau.com/doc/BGB17-IEEESB-proof_of_delay_ethereum.pdf

pragma solidity ^0.7.3;
import "./verifier.sol";

contract Referee {
  // Should be power of 2
  uint8 constant NUM_CHECKPOINTS = 1 << 3; // 8

  // Has to be even
  uint8 constant NUM_ROUNDS = 10;
  uint256 constant CHALLENGE_RESPONSE_TIMEOUT = 5 minutes;
  uint256 constant CHALLENGE_PERIOD = 2 hours;

  struct ChallengeState {
    uint256 lastChallenge;
    bytes32[7] checkpoints;
    bytes32 firstCheckpoint;
    bytes32 lastCheckpoint;
    uint8 round;
    bool initialized;
  }

  bytes32 public challenge;

  // This stores the challenge and the beacon
  ChallengeState public initialState;

  mapping(address => ChallengeState) public challenges;

  address public prover;

  constructor() {
    challenge = blockhash(block.number - 1);
    // Fix for easier debugging
  }

  function submitBeacon(bytes32 _beacon, bytes32[7] calldata _checkpoints) public {
    require(!initialState.initialized, "BEACON_EXISTS");

    prover = msg.sender;
    initialState = ChallengeState(block.timestamp, _checkpoints, challenge, _beacon, 0, true);
  }

  function postChallenge(
    uint8 prevIndex,
    bytes32[7] calldata _checkpoints,
    address challenger
  ) public {
    require(initialState.initialized, "BEACON_DOES_NOT_EXIST");
    require(prevIndex < NUM_CHECKPOINTS - 1, "INDEX_OUT_BOUNDS");
    require(block.timestamp - initialState.lastChallenge <= CHALLENGE_PERIOD, "CHALLENGE_EXPIRED");

    ChallengeState memory state = challenges[challenger];

    if (!state.initialized) {
      state = ChallengeState(
        block.timestamp,
        initialState.checkpoints,
        initialState.firstCheckpoint,
        initialState.lastCheckpoint,
        0,
        true
      );
    }

    require(state.round < NUM_ROUNDS, "STATE_ROUND_GT_NUM_ROUNDS");

    require((state.round % 2 != 0) || (msg.sender == challenger), "CHALLENGER_TURN");

    require((state.round % 2 != 1) || (msg.sender == prover), "PROVER_TURN");

    if (prevIndex > 0) {
      state.firstCheckpoint = state.checkpoints[prevIndex - 1];
    }

    if (prevIndex < NUM_CHECKPOINTS - 2) {
      state.lastCheckpoint = state.checkpoints[prevIndex];
    }

    state.checkpoints = _checkpoints;
    state.round += 1;
    state.lastChallenge = block.timestamp;
    challenges[challenger] = state;
  }

  function callTimeout() public {
    // TODO: memory?
    ChallengeState storage state = challenges[msg.sender];

    // Ball must be in prover's court
    require(state.round % 2 == 1, "NOT_TURN");

    // self destruct if enough time elapsed since last challenge
    if (block.timestamp - state.lastChallenge > CHALLENGE_RESPONSE_TIMEOUT) {
      selfdestruct(msg.sender);
    }
  }

  function finalChallenge(uint8 prevIndex) public returns (bool verified) {
    require(prevIndex < NUM_CHECKPOINTS - 1, "INDEX_OUT_BOUNDS");
    require(block.timestamp - initialState.lastChallenge <= CHALLENGE_PERIOD, "CHALLENGE_EXPIRED");

    address payable challenger = msg.sender;

    // TODO: memory?
    ChallengeState storage state = challenges[challenger];

    require(state.round == NUM_ROUNDS, "NOT_FINAL");

    bytes32 claimedResult;
    // bytes32 computedResult;
    bytes32 start;

    if (prevIndex == 0) {
      start = state.firstCheckpoint;
      claimedResult = state.checkpoints[0];
    } else if (prevIndex == NUM_CHECKPOINTS - 2) {
      start = state.checkpoints[prevIndex - 1];
      claimedResult = state.lastCheckpoint;
    } else {
      start = state.checkpoints[prevIndex - 1];
      claimedResult = state.checkpoints[prevIndex];
    }

    verified = Verifier.verify(uint256(start), uint256(claimedResult), uint256(1000000007), uint256(10**4));

    if (!verified) {
      selfdestruct(challenger);
    } else {
      delete challenges[challenger];
    }
  }
}
