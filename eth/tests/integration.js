const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect } = chai;

const Sloth_Test_Harness = artifacts.require('Sloth_Test_Harness');
const VerifiableDelayFunction = require('../../js/src/index');

const fixtures = require('../../js/tests/fixtures/sloth.json');

let contractInstance = null;

contract('Integration (JS Build, Solidity Verify)', async (accounts) => {
  before(async () => {
    contractInstance = await Sloth_Test_Harness.deployed();
  });

  afterEach(() => contractInstance.set('0'));

  describe('Single', () => {
    fixtures.single
      .filter(({ invalid }) => !invalid)
      .forEach(({ x, p, t }) => {
        it('should verify sloth modular root y.', async () => {
          const options = { type: 'sloth', prime: BigInt(p) };
          const y = VerifiableDelayFunction.proveDelay(BigInt(x), BigInt(t), options);
          expect(await contractInstance.verify(y.toString(), x, p, t)).to.be.true;
        });
      });
  });

  describe('Intermediates', () => {
    fixtures.intermediates
      .filter(({ invalid }) => !invalid)
      .forEach(({ x, p, t, size }) => {
        it('should verify intermediate sloth modular roots y[].', async () => {
          const options = { type: 'sloth', prime: BigInt(p) };
          const beacons = VerifiableDelayFunction.proveDelayWithIntermediates(
            BigInt(x),
            BigInt(t),
            BigInt(size),
            options
          );

          let seed = x;

          for (let i = 0; i < size; i++) {
            expect(await contractInstance.verify(beacons[i].toString(), seed, p, t / size)).to.be.true;
            seed = beacons[i].toString();
          }
        });
      });
  });
});
