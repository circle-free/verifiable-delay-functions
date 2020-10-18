const assert = require('assert');

class VerifiableDelayFunction {
  constructor(options = {}) {
    const { prime, type = 'sloth' } = options;

    assert(prime, 'Prime number required');
    assert(type === 'sloth', 'VDF type not supported');

    this._prime = prime;
    this._type = type;
  }

  static modulusExponent(base, exponent, modulus) {
    let result = 1n;

    for (; exponent > 0n; exponent >>= 1n) {
      if (exponent & 1n) {
        result = (result * base) % modulus;
      }

      base = (base * base) % modulus;
    }

    return result;
  }

  static proveDelay(seed, iterations, options = {}) {
    const { prime, type = 'sloth' } = options;

    assert(prime, 'Prime number required');
    assert(type === 'sloth', 'VDF type not supported');

    const exponent = (prime + 1n) >> 2n;
    let beacon = seed % prime;

    for (let i = 0n; i < iterations; ++i) {
      beacon = VerifiableDelayFunction.modulusExponent(beacon, exponent, prime);
    }

    return beacon;
  }

  static proveDelayWithIntermediates(seed, iterations, intermediates, options = {}) {
    assert(iterations % intermediates === 0n, 'Iterations must be multiple of intermediates.');

    const beacons = [];
    const iterationsPerIntermediate = iterations / intermediates;
    let lastSeed = seed;

    for (let i = 0n; i < intermediates; ++i) {
      const beacon = VerifiableDelayFunction.proveDelay(lastSeed, iterationsPerIntermediate, options);
      beacons.push(beacon);
      lastSeed = beacon;
    }

    return beacons;
  }

  static verifyDelay(beacon, seed, iterations, options = {}) {
    const { prime, type = 'sloth' } = options;

    assert(prime, 'Prime number required');
    assert(type === 'sloth', 'VDF type not supported');

    for (let i = 0n; i < iterations; ++i) {
      beacon = (beacon * beacon) % prime;
    }

    seed %= prime;

    if (seed == beacon) return true;

    if (prime - seed === beacon) return true;

    return false;
  }

  static verifyDelayWithIntermediates(beacons, seed, iterations, options = {}) {
    assert(iterations % BigInt(beacons.length) === 0n, 'Iterations must be multiple of intermediates.');

    const iterationsPerIntermediate = iterations / BigInt(beacons.length);
    let lastSeed = seed;

    for (let i = 0; i < beacons.length; ++i) {
      const isValid = VerifiableDelayFunction.verifyDelay(beacons[i], lastSeed, iterationsPerIntermediate, options);

      if (!isValid) return { valid: false, invalidBeaconIndex: i };

      lastSeed = beacons[i];
    }

    return { valid: true };
  }

  get prime() {
    return this._prime;
  }

  get type() {
    return this._type;
  }

  delay(seed, iterations) {
    const options = { type: this._type, prime: this._prime };
    return VerifiableDelayFunction.proveDelay(seed, iterations, options);
  }

  delayWithIntermediates(seed, iterations, intermediates) {
    const options = { type: this._type, prime: this._prime };
    return VerifiableDelayFunction.proveDelayWithIntermediates(seed, iterations, intermediates, options);
  }

  verify(beacon, seed, iterations) {
    const options = { type: this._type, prime: this._prime };
    return VerifiableDelayFunction.verifyDelay(beacon, seed, iterations, options);
  }

  verifyWithIntermediates(beacons, seed, iterations) {
    const options = { type: this._type, prime: this._prime };
    return VerifiableDelayFunction.verifyDelayWithIntermediates(beacon, seed, iterations, options);
  }
}

module.exports = VerifiableDelayFunction;
