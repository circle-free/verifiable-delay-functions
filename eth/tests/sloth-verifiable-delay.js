const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect } = chai;

const Sloth_Test_Harness = artifacts.require('Sloth_Test_Harness');

const fixtures = require('./fixtures/vdfs.json');

let contractInstance = null;

contract('Test Harness', async (accounts) => {
  before(async () => {
    contractInstance = await Sloth_Test_Harness.deployed();
  });

  afterEach(() => contractInstance.set('0'));

  describe('Stateful', () => {
    fixtures.stateful.compute.forEach(({ x, p, t, y, computeGasUsed }) => {
      it('should compute sloth modular root y and store it.', async () => {
        const { receipt } = await contractInstance.compute_and_store(x, p, t);
        expect((await contractInstance.y()).toString(10)).to.equal(y);
        expect(receipt.gasUsed.toString()).to.equal(computeGasUsed);
      });
    });

    fixtures.stateful.verify.forEach(({ x, p, t, y, verifyGasUsed }) => {
      it('should verify a 10000-t vdf and store bool.', async () => {
        await contractInstance.set(y);
        const { receipt } = await contractInstance.verify_and_store(x, p, t);
        expect(await contractInstance.valid()).to.be.true;
        expect(receipt.gasUsed.toString()).to.equal(verifyGasUsed);
      });
    });
  });

  describe('Stateless', () => {
    fixtures.stateless.compute.forEach(({ x, p, t, y }) => {
      it('should compute sloth modular root y.', async () => {
        expect((await contractInstance.compute(x, p, t)).toString(10)).to.equal(y);
      });
    });

    fixtures.stateless.verify.forEach(({ x, p, t, y, valid }) => {
      it('should verify sloth modular root y.', async () => {
        expect(await contractInstance.verify(y, x, p, t)).to.equal(valid);
      });
    });
  });

  describe('Intermediated Stateless', () => {
    fixtures.intermediates.compute.forEach(({ x, p, t, size, y }) => {
      it('should compute intermediate sloth modular roots y[].', async () => {
        let seed = x;

        for (let i = 0; i < size; i++) {
          expect((await contractInstance.compute(seed, p, t / size)).toString(10)).to.equal(y[i]);
          seed = y[i];
        }
      });
    });

    fixtures.intermediates.verify.forEach(({ x, p, t, size, y, valid }) => {
      it('should verify intermediate sloth modular roots y[].', async () => {
        let seed = x;

        for (let i = 0; i < size; i++) {
          expect(await contractInstance.verify(y[i], seed, p, t / size)).to.equal(valid);
          seed = y[i];
        }
      });
    });
  });
});
