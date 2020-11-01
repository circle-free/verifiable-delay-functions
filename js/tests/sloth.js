'strict';

const chai = require('chai');
const { expect } = chai;

const { SlothDelay } = require('../');
const slothFixtures = require('./fixtures/sloth.json');

describe('Verifiable Delay Function', () => {
  describe('Compute Delays', () => {
    slothFixtures.single
      .filter(({ invalid }) => !invalid)
      .forEach(({ x, p, t, y, timeout = 20000 }) => {
        it('Generates valid sloth delays', async () => {
          const options = { iterations: BigInt(t), prime: BigInt(p) };
          const slothDelay = new SlothDelay(options);

          const beacons = await slothDelay
            .compute(BigInt(x))
            .on('beacon', (index, beacon) => {
              expect(index).to.equal(0);
              expect(beacon.toString()).to.equal(y);
            })
            .on('computed', (beacons) => {
              expect(beacons.length).to.equal(1);
              expect(beacons[0].toString()).to.equal(y);
            });

          expect(beacons.length).to.equal(1);
          expect(beacons[0].toString()).to.equal(y);
        }).timeout(timeout);
      });
  });

  describe('Verifies Delays', () => {
    slothFixtures.single.forEach(({ x, p, t, y, invalid, timeout = 20000 }) => {
      it('Verifies sloth delays', async () => {
        const options = { iterations: BigInt(t), prime: BigInt(p) };
        const slothDelay = new SlothDelay(options);

        const { valid, invalidBeaconIndex } = await slothDelay
          .verify([BigInt(y)], BigInt(x))
          .on('verified', ({ valid, invalidBeaconIndex }) => {
            expect(valid).to.equal(!invalid);
            expect(invalidBeaconIndex).to.equal(invalid ? 0 : undefined);
          });

        expect(valid).to.equal(!invalid);
        expect(invalidBeaconIndex).to.equal(invalid ? 0 : undefined);
      }).timeout(timeout);
    });
  });

  describe('Compute Delays with Intermediates', () => {
    slothFixtures.intermediates
      .filter(({ invalid }) => !invalid)
      .forEach(({ x, p, t, size, y, timeout = 20000 }) => {
        it('Generates valid sloth delays with intermediates', async () => {
          const options = { iterations: BigInt(t), prime: BigInt(p), intermediates: BigInt(size) };
          const slothDelay = new SlothDelay(options);
          let lastIndex = 0;

          const beacons = await slothDelay
            .compute(BigInt(x))
            .on('beacon', (index, beacon) => {
              expect(index).to.equal(lastIndex);
              expect(beacon.toString()).to.equal(y[lastIndex]);
              lastIndex += 1;
            })
            .on('computed', (beacons) => {
              expect(beacons.length.toString()).to.equal(size);
              expect(beacons.map((b) => b.toString())).to.deep.equal(y);
            });

          expect(beacons.length.toString()).to.equal(size);
          expect(beacons.map((b) => b.toString())).to.deep.equal(y);
        }).timeout(timeout);
      });
  });

  describe('Verifies Delays', () => {
    slothFixtures.intermediates.forEach(({ x, p, t, y, invalid, invalidIndex, timeout = 20000 }) => {
      it('Verifies sloth delays with intermediates', async () => {
        const options = { iterations: BigInt(t), prime: BigInt(p), intermediates: BigInt(y.length) };
        const slothDelay = new SlothDelay(options);

        const { valid, invalidBeaconIndex } = await slothDelay
          .verify(
            y.map((v) => BigInt(v)),
            BigInt(x)
          )
          .on('verified', ({ valid, invalidBeaconIndex }) => {
            expect(valid).to.equal(!invalid);
            expect(invalidBeaconIndex).to.equal(invalid ? invalidIndex : undefined);
          });

        expect(valid).to.equal(!invalid);
        expect(invalidBeaconIndex).to.equal(invalid ? invalidIndex : undefined);
      }).timeout(timeout);
    });
  });
});
