const { spawn, Thread, Worker } = require('threads');
const assert = require('assert');
const Web3PromiEvent = require('web3-core-promievent');

class SlothDelay {
  constructor(options = {}) {
    const { iterations, prime, intermediates = 1n } = options;
    assert(prime, 'Prime number required');
    assert(iterations > 0n, 'Minimum of 1 iterations required.');
    assert(intermediates > 0n, 'Minimum of 1 intermediates required.');
    assert(iterations % intermediates === 0n, 'Iterations must be multiple of intermediates.');

    this._prime = prime;
    this._iterations = iterations;
    this._intermediates = intermediates;
    this._iterationsPerIntermediate = this._iterations / this._intermediates;
  }

  get prime() {
    return this._prime;
  }

  get iterations() {
    return this._iterations;
  }

  get intermediates() {
    return this._intermediates;
  }

  get iterationsPerIntermediate() {
    return this._iterationsPerIntermediate;
  }

  compute(seed) {
    const prime = this._prime;
    const intermediates = this._intermediates;
    const iterationsPerIntermediate = this._iterationsPerIntermediate;
    const promiEvent = Web3PromiEvent();

    spawn(new Worker('./sloth')).then(async (sloth) => {
      const beacons = [];

      for (let i = 0n; i < intermediates; ++i) {
        const beacon = await sloth.computeBeacon(seed, prime, iterationsPerIntermediate);
        beacons.push(beacon);
        seed = beacon;
        promiEvent.eventEmitter.emit('beacon', Number(i), beacon);
      }

      promiEvent.eventEmitter.emit('computed', beacons);
      await Thread.terminate(sloth);
      promiEvent.resolve(beacons);
    });

    return promiEvent.eventEmitter;
  }

  verify(beacons, seed) {
    const prime = this._prime;
    const intermediates = this._intermediates;
    const iterationsPerIntermediate = this._iterationsPerIntermediate;
    const promiEvent = Web3PromiEvent();

    spawn(new Worker('./sloth')).then(async (sloth) => {
      if (BigInt(beacons.length) !== intermediates) {
        const result = { valid: false };
        promiEvent.eventEmitter.emit('verified', result);
        await Thread.terminate(sloth);
        promiEvent.resolve(result);

        return;
      }

      for (let i = 0; i < beacons.length; ++i) {
        if (await sloth.verifyBeacon(beacons[i], seed, prime, iterationsPerIntermediate)) {
          seed = beacons[i];
          continue;
        }

        const result = { valid: false, invalidBeaconIndex: i };
        promiEvent.eventEmitter.emit('verified', result);
        await Thread.terminate(sloth);
        promiEvent.resolve(result);

        return;
      }

      const result = { valid: true };
      promiEvent.eventEmitter.emit('verified', result);
      await Thread.terminate(sloth);
      promiEvent.resolve(result);

      return;
    });

    return promiEvent.eventEmitter;
  }
}

module.exports = SlothDelay;
