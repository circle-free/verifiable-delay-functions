'strict';

const chai = require('chai');
const { expect } = chai;

const VerifiableDelayFunction = require('../src/index');
const slothFixtures = require('./fixtures/sloth.json');

describe('Verifiable Delay Function', () => {
  describe('Compute Delays', () => {
    slothFixtures.single
      .filter(({ invalid }) => !invalid)
      .forEach(({ x, p, t, y, timeout = 20000 }) => {
        it('Generates valid sloth delays', () => {
          const options = { type: 'sloth', prime: BigInt(p) };
          const beacon = VerifiableDelayFunction.proveDelay(BigInt(x), BigInt(t), options);

          expect(beacon.toString()).to.equal(y);
        }).timeout(timeout);
      });
  });

  describe('Verifies Delays', () => {
    slothFixtures.single.forEach(({ x, p, t, y, invalid, timeout = 20000 }) => {
      it('Verifies sloth delays', () => {
        const options = { type: 'sloth', prime: BigInt(p) };
        const isValid = VerifiableDelayFunction.verifyDelay(BigInt(y), BigInt(x), BigInt(t), options);

        expect(isValid).to.equal(!invalid);
      }).timeout(timeout);
    });
  });

  describe('Compute Delays with Intermediates', () => {
    slothFixtures.intermediates
      .filter(({ invalid }) => !invalid)
      .forEach(({ x, p, t, size, y, timeout = 20000 }) => {
        it('Generates valid sloth delays with intermediates', () => {
          const options = { type: 'sloth', prime: BigInt(p) };
          const beacons = VerifiableDelayFunction.proveDelayWithIntermediates(
            BigInt(x),
            BigInt(t),
            BigInt(size),
            options
          );

          expect(beacons.map((b) => b.toString())).to.deep.equal(y);
        }).timeout(timeout);
      });
  });

  describe('Verifies Delays', () => {
    slothFixtures.intermediates.forEach(({ x, p, t, y, invalid, invalidIndex, timeout = 20000 }) => {
      it('Verifies sloth delays with intermediates', () => {
        const options = { type: 'sloth', prime: BigInt(p) };
        const beacons = y.map((b) => BigInt(b));
        const result = VerifiableDelayFunction.verifyDelayWithIntermediates(beacons, BigInt(x), BigInt(t), options);
        const { valid, invalidBeaconIndex } = result;

        expect(valid).to.equal(!invalid);

        if (invalid) {
          expect(invalidBeaconIndex).to.equal(invalidIndex);
        }
      }).timeout(timeout);
    });
  });
});
