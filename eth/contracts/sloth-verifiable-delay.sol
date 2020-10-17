// SPDX-License-Identifier: MIT
// https://eprint.iacr.org/2015/366.pdf

pragma solidity ^0.7.3;

// TODO: checking for quadratic residues has been removed, unclear of implications

library Sloth_Verifiable_Delay {
  // verify sloth result y, starting from seed x, over prime p, with t iterations
  function verify(
    uint256 y,
    uint256 x,
    uint256 p,
    uint256 t
  ) internal pure returns (bool) {
    for (uint256 i; i < t; ++i) {
      y = mulmod(y, y, p);
    }

    x %= p;

    if (x == y) return true;

    if (p - x == y) return true;

    return false;
  }

  // pow(base, exponent, modulus)
  function mod_exp(
    uint256 b,
    uint256 e,
    uint256 m
  ) internal pure returns (uint256 r) {
    r = 1;

    for (; e > 0; e >>= 1) {
      if (e & 1 == 1) {
        r = mulmod(r, b, m);
      }

      b = mulmod(b, b, m);
    }
  }

  // compute sloth starting from seed x, over prime p, with t iterations
  function compute(
    uint256 x,
    uint256 p,
    uint256 t
  ) internal pure returns (uint256) {
    uint256 e = (p + 1) >> 2;
    x %= p;

    for (uint256 i; i < t; ++i) {
      x = mod_exp(x, e, p);
    }

    return x;
  }
}
