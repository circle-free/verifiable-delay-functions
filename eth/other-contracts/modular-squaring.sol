// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

library Modular_Squaring {
  // It is faster to pass in the parameters then to store them in the contract
  // u is precomputed as in http://cacr.uwaterloo.ca/hac/about/chap14.pdf 14.42
  // https://www.lirmm.fr/arith18/papers/hasenplaugh-FastModularReduction.pdf
  // result = x % modulus
  // u = (base^(2*k))/modulus (base is radix, k is bits)
  function square_mod(
    uint128[] memory a,
    uint128[] memory p,
    uint128[] memory u
  ) internal pure returns (uint128[] memory) {
    return reduce(square(a), p, u);
  }

  function reduce(
    uint128[] memory x,
    uint128[] memory p,
    uint128[] memory u
  ) internal pure returns (uint128[] memory result_array) {
    uint256 k = p.length;
    uint128[] memory q2 = multiply(x, (k - 1), x.length, u);
    result_array = new uint128[](k + 1);

    multiply(q2, k + 1, q2.length, p, result_array);

    subtract(x, k + 1, result_array, result_array);

    if (compare(result_array, p) > 0) {
      subtract(result_array, result_array.length, p, result_array);
    }
  }

  function multiply(uint128[] memory a, uint128[] memory b) internal pure returns (uint128[] memory result) {
    result = new uint128[](a.length + b.length);
    uint256 i;
    uint256 j;
    uint128 carry;
    uint256 a_i;
    uint256 temp;

    for (; i < a.length; ++i) {
      carry = 0;
      a_i = uint256(a[i]);

      for (j = 0; j < b.length; ++j) {
        temp = carry + a_i * b[j] + result[i + j];
        result[i + j] = uint128(temp);
        carry = uint128(temp >> 128);
      }

      result[i + b.length] = carry;
    }
  }

  function multiply(
    uint128[] memory a,
    uint256 a_start,
    uint256 a_end,
    uint128[] memory b
  ) internal pure returns (uint128[] memory result) {
    result = new uint128[](a_end - a_start + b.length);

    uint256 i = a_start;
    uint256 j;
    uint128 carry;
    uint256 a_i;
    uint256 result_index;
    uint256 temp;

    for (; i < a_end; ++i) {
      carry = 0;
      a_i = uint256(a[i]);

      for (j = 0; j < b.length; ++j) {
        result_index = i + j - a_start;
        temp = carry + a_i * b[j] + result[result_index];
        result[result_index] = uint128(temp);
        carry = uint128(temp >> 128);
      }

      result[i + b.length - a_start] = carry;
    }
  }

  function multiply(
    uint128[] memory a,
    uint256 a_start,
    uint256 a_end,
    uint128[] memory b,
    uint128[] memory result
  ) internal pure {
    uint256 i = a_start;
    uint256 j;
    uint128 carry;
    uint256 a_i;
    uint256 result_index;
    uint256 temp;
    uint256 final_index;

    for (; i < a_end; ++i) {
      carry = 0;
      a_i = uint256(a[i]);

      for (j = 0; j < b.length; ++j) {
        result_index = i + j - a_start;

        if (result_index < result.length) {
          temp = carry + a_i * b[j] + result[result_index];
          result[result_index] = uint128(temp);
          carry = uint128(temp >> 128);
        }
      }

      final_index = i + b.length - a_start;

      if (final_index < result.length) {
        result[final_index] = carry;
      }
    }
  }

  function square(uint128[] memory a) internal pure returns (uint128[] memory) {
    return multiply(a, a);
  }

  function compare(uint128[] memory a, uint128[] memory b) internal pure returns (int8) {
    uint256 a_length = a.length;
    uint256 b_length = b.length;

    // TODO: can be reused as a_val or b_val
    uint256 max_length = a_length > b_length ? a_length : b_length;

    uint128 a_val;
    uint128 b_val;

    for (uint256 i = max_length - 1; i >= 0; --i) {
      a_val = i >= a_length ? 0 : a[i];
      b_val = i >= b_length ? 0 : b[i];

      if (a_val > b_val) return 1;

      if (b_val > a_val) return -1;
    }

    return 0;
  }

  // Where a > b
  function subtract(uint128[] memory a, uint128[] memory b) internal pure returns (uint128[] memory result) {
    result = new uint128[](a.length);
    uint8 carry;
    int256 b_val;
    int256 result_buf;

    for (uint256 i = 0; i < a.length; ++i) {
      b_val = i >= b.length ? 0 : b[i];
      result_buf = a[i] - b_val - carry;
      result[i] = uint128(result_buf);
      carry = result_buf < 0 ? 1 : 0;
    }
  }

  // Where a > b
  function subtract(
    uint128[] memory a,
    uint256 a_length,
    uint128[] memory b
  ) internal pure returns (uint128[] memory result) {
    result = new uint128[](a_length);
    uint8 carry = 0;
    int256 b_val;
    int256 result_buf;

    for (uint256 i = 0; i < a_length; ++i) {
      b_val = i >= b.length ? 0 : b[i];
      result_buf = a[i] - b_val - carry;
      result[i] = uint128(result_buf);
      carry = result_buf < 0 ? 1 : 0;
    }
  }

  // Where a > b
  function subtract(
    uint128[] memory a,
    uint256 a_length,
    uint128[] memory b,
    uint128[] memory result
  ) internal pure {
    uint8 carry = 0;
    int256 b_val;
    int256 result_buf;

    for (uint256 i = 0; i < a_length; ++i) {
      b_val = i >= b.length ? 0 : b[i];
      result_buf = a[i] - b_val - carry;
      result[i] = uint128(result_buf);
      carry = result_buf < 0 ? 1 : 0;
    }
  }
}
