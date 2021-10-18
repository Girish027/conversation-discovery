import chai, {
  expect
} from 'chai';

import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import TimerUtils from '../TimerUtils';

chai.use(sinonChai);
const sandbox = sinon.createSandbox();

describe('TimerUtils:', () => {
  let clock;

  beforeAll(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(() => {
    clock.restore();
  });

  describe('Timer Functions: - _requestWorker & requestAnimationFrame is unavailable', () => {
    let timeoutId;
    let intervalId;

    afterEach(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
      window.mozRequestAnimationFrame = undefined;
    });

    it('requestTimeout: should set a timeout using setTimeout - animation frame is not supported', () => {
      expect(timeoutId).to.be.undefined;
      timeoutId = TimerUtils.requestTimeout(() => {}, 200);
      expect(Number.isNaN(timeoutId)).to.be.false;
    });

    it('requestTimeout: should set a timeout using setTimeout -(Firefox 5)', () => {
      window.mozRequestAnimationFrame = true;
      window.mozCancelRequestAnimationFrame = undefined;
      const setTimeoutSpy = sandbox.spy(window, 'setTimeout');
      timeoutId = TimerUtils.requestTimeout(() => {});
      clock.tick(15);
      expect(setTimeoutSpy.callCount).to.equal(0);
    });

    it('requestTimeout: should use the default time delay', () => {
      window.requestAnimationFrame = false;
      window.webkitRequestAnimationFrame = false;
      window.mozRequestAnimationFrame = false;
      window.mozCancelRequestAnimationFrame = false;
      window.oRequestAnimationFrame = false;
      window.msRequestAnimationFrame = false; 
      const setTimeoutSpy = sandbox.spy(window, 'setTimeout');
      timeoutId = TimerUtils.requestTimeout(() => {});
      clock.tick(15);
      expect(setTimeoutSpy.getCall(0).args[1]).to.equal(10);
    });

    it('requestTimeout: should call the passed function after the time delay', (done) => {
      const fn = () => {
        expect(Number.isNaN(timeoutId)).to.be.false;
        done();
      };
      timeoutId = TimerUtils.requestTimeout(fn, 200);
      clock.tick(201);
    });

    it('requestInterval: should use setInterval - animation frame is not supported', () => {
      expect(intervalId).to.be.undefined;
      intervalId = TimerUtils.requestInterval(() => {}, 200);
      expect(Number.isNaN(intervalId)).to.be.false;
    });

    it('requestInterval: should use the given time delay', () => {
      const setIntervalSpy = sandbox.spy(window, 'setInterval');
      intervalId = TimerUtils.requestInterval(() => {}, 200);
      clock.tick(210);
      expect(setIntervalSpy.getCall(0).args[1]).to.equal(200);
    });

    it('requestInterval: should call the passed function at specidifed intervals', () => {
      const fn = sandbox.stub();
      intervalId = TimerUtils.requestInterval(fn, 200);
      clock.tick(410);
      expect(fn).to.be.calledTwice;
    });

    it('requestInterval: should use setInterval -(Firefox 5)', () => {
      window.mozRequestAnimationFrame = true;
      window.mozCancelRequestAnimationFrame = undefined;
      const setIntervalSpy = sandbox.spy(window, 'setInterval');
      intervalId = TimerUtils.requestInterval(() => {}, 200);
      clock.tick(210);
      expect(setIntervalSpy).to.be.called;
    });
  });

  describe('Timer Functions:- requestAnimationFrame is available:', () => {
    describe('requestTimeout & requestInterval:', () => {
      let timeoutIds = [];
      let callback;
      let _requestAnimFrameStub;
      const loopInterval = Math.floor(1000 / 60);

      afterEach(() => {
        timeoutIds.forEach((id) => {
          window.clearTimeout(id);
        });
        timeoutIds = [];
      });

      beforeEach(() => {
        callback = sandbox.stub();
        _requestAnimFrameStub = sandbox.stub();
        _requestAnimFrameStub.callsFake((loop) => {
          // Use: clear the timeout using the ids in the array.
          timeoutIds.push(TimerUtils.__get__('_setTimeoutProxy')(loop));
          return timeoutIds[timeoutIds.length - 1];
        });
        TimerUtils.__Rewire__('_requestAnimFrame', _requestAnimFrameStub);
      });

      beforeAll(() => {
        window.msRequestAnimationFrame = true;
      });

      afterAll(() => {
        window.msRequestAnimationFrame = undefined;
      });

      it('requestTimeout: should call requestAnimationframe immediately', () => {
        TimerUtils.requestTimeout(callback, 2000);
        expect(_requestAnimFrameStub).to.be.called;
        expect(callback).to.not.be.called;
      });

      it('requestTimeout: should call requestAnimation frame at set time periods', () => {
        //= > callCount = timepassed/16
        const timePassedBy = 300;
        const delay = 360;
        TimerUtils.requestTimeout(callback, delay);
        clock.tick(timePassedBy);
        expect(_requestAnimFrameStub.callCount).to.equal(Math.ceil(timePassedBy / loopInterval));
        expect(callback).to.not.be.called;
      });

      it('requestTimeout: should stop calling requestAnimationFrame after the delay', () => {
        //= > callCount = delay/16
        const timePassedBy = 1000;
        const delay = 360;
        TimerUtils.requestTimeout(callback, delay);
        clock.tick(timePassedBy);
        expect(_requestAnimFrameStub.callCount).to.equal(Math.ceil(delay / loopInterval));
      });

      it('requestTimeout: should call callback once after the delay', () => {
        const timePassedBy = 370;
        const delay = 360;
        TimerUtils.requestTimeout(callback, delay);
        clock.tick(timePassedBy);
        expect(callback).to.be.calledOnce;
      });

      it('requestInterval: should call requestAnimationframe immediately', () => {
        TimerUtils.requestInterval(callback, 200);
        expect(_requestAnimFrameStub).to.be.called;
        expect(callback).to.not.be.called;
      });

      it('requestInterval: should call requestAnimation frame at set time periods', () => {
        //= > callCount = timepassed/loopInterval
        const timePassedBy = 300;
        const interval = 20;
        TimerUtils.requestInterval(callback, interval);
        clock.tick(timePassedBy);
        expect(_requestAnimFrameStub.callCount).to.equal(Math.ceil(timePassedBy / loopInterval));
      });

      it('requestInterval: should call callback at the given interval', () => {
        //= > callCount = timepassed/actualInterval
        const timePassedBy = 300;
        const interval = 20;
        const actualInterval = loopInterval * Math.ceil(interval / loopInterval);
        TimerUtils.requestInterval(callback, interval);
        clock.tick(timePassedBy);
        expect(_requestAnimFrameStub.callCount).to.equal(Math.ceil(timePassedBy / loopInterval));
        expect(callback.callCount).to.equal(Math.floor(timePassedBy / actualInterval));
      });
    });
  });

  describe('Timer Functions - _requestWorker is available', () => {
    let requestWorker;
    const callback = () => {};

    beforeEach(() => {
      requestWorker = {
        setInterval: sandbox.stub(),
        clearInterval: sandbox.stub(),
        setTimeout: sandbox.stub(),
        clearTimeout: sandbox.stub()
      };
      TimerUtils.__Rewire__('_requestWorker', requestWorker);
    });

    afterAll(() => {
      TimerUtils.__ResetDependency__('_requestWorker');
    });

    it('requestInterval: should call requestWorker\'s setInterval', () => {
      TimerUtils.requestInterval(callback, 200);
      expect(requestWorker.setInterval).to.be.calledWith(callback, 200);
    });

    it('clearRequestInterval: should call requestWorker\'s clearInterval', () => {
      TimerUtils.clearRequestInterval(6);
      expect(requestWorker.clearInterval).to.be.calledWith(6);
    });

    it('requestTimeout: should call requestWorker\'s setTimeout', () => {
      TimerUtils.requestTimeout(callback, 200);
      expect(requestWorker.setTimeout).to.be.calledWith(callback, 200);
    });

    it('clearRequestTimeout: should call requestWorker\'s clearTimeout', () => {
      TimerUtils.clearRequestTimeout(6);
      expect(requestWorker.clearTimeout).to.be.calledWith(6);
    });
  });

  describe('RequestWorker: ', () => {
    describe('_getFakeId:', () => {
      const fakeIdToCallback = {
        1: 'callback1',
        2: 'callback2',
        3: 'callback3',
        4: 'callback4',
        5: 'callback5'
      };
      it('should return the next id but less than maxFake Id', () => {
        TimerUtils.__set__('lastFakeId', 0);
        const maxFakeId = 10;
        expect(TimerUtils.__get__('_getFakeId')(maxFakeId, fakeIdToCallback)).to.equal(6);
      });

      it('should return 0, if next id is equal to maxFakeId', () => {
        TimerUtils.__set__('lastFakeId', 0);
        const maxFakeId = 4;
        expect(TimerUtils.__get__('_getFakeId')(maxFakeId, fakeIdToCallback)).to.equal(0);
      });
    });

    describe('_getRequestWorker', () => {
      let createObjectURL;
      let requestWorker;
      let workerPostMessageSpy;
      let callback;
      let urlStub;

      beforeAll(() => {
        class WorkerMock {
          constructor(value) {
            if (value === 'error') {
              throw new Error('FAKE ERROR');
            }
          }

          postMessage() {
          }
        }
        global.window.Worker = WorkerMock;
        global.Worker = WorkerMock;
      });

      beforeEach(() => {
        createObjectURL = sandbox.stub();
        urlStub = sandbox.stub(window, 'URL');
        urlStub.value({
          createObjectURL
        });

        callback = sandbox.stub();
        requestWorker = TimerUtils.__get__('_getRequestWorker')();
        workerPostMessageSpy = sandbox.spy(TimerUtils.__get__('worker'), 'postMessage');
      });

      afterEach(() => {
        urlStub.restore();
      });

      afterAll(() => {
        global.window.Worker = undefined;
        global.Worker = undefined;
      });

      it('should create a new blob with the right data', () => {
        TimerUtils.__get__('_getRequestWorker')();
        expect(createObjectURL).to.be.called;
        expect(createObjectURL.getCall(0).args[0] instanceof Blob).to.be.true;
      });

      it('should return the request worker with Timer Functions', () => {
        expect(requestWorker).to.have.ownProperty('setInterval');
        expect(requestWorker).to.have.ownProperty('clearInterval');
        expect(requestWorker).to.have.ownProperty('setTimeout');
        expect(requestWorker).to.have.ownProperty('clearTimeout');
      });

      it('worker.onmessage: should call the callback at the given id', () => {
        const worker = TimerUtils.__get__('worker');
        const fakeId = requestWorker.setInterval(callback, 20);
        worker.onmessage({
          data: {
            fakeId
          }
        });
        expect(callback).to.be.called;
      });

      it('worker.onmessage: should not call callback for a different/absent id', () => {
        const worker = TimerUtils.__get__('worker');
        const fakeId = requestWorker.setInterval(callback, 20);
        worker.onmessage({
          data: {
            fakeId: fakeId * 1000 // a random id
          }
        });
        expect(callback).to.not.be.called;
      });

      it('worker.onmessage: should remove the id when setTimeout callback is to be called', () => {
        const worker = TimerUtils.__get__('worker');
        const fakeId = requestWorker.setTimeout(callback, 20);
        worker.onmessage({
          data: {
            fakeId
          }
        });
        expect(callback).to.be.calledOnce;
        callback.resetHistory();
        // the id is removed, hence the callback is not to be called,
        // even if onmessage is called again with same data
        worker.onmessage({
          data: {
            fakeId
          }
        });
        expect(callback).to.not.be.called;
      });

      it('worker.onmessage: should not call the callback if it is not a function', () => {
        const worker = TimerUtils.__get__('worker');
        const fakeId = requestWorker.setInterval('callback', 20);
        expect(() => worker.onmessage({
          data: {
            fakeId
          }
        })).to.not.throw;
      });

      it('_requestWorker.setInterval: should send message to worker with necessary data', () => {
        const fakeId = requestWorker.setInterval(callback, 20);
        expect(workerPostMessageSpy).to.be.calledWith({
          name: 'setInterval',
          fakeId,
          time: 20
        });
      });

      it('_requestWorker.clearInterval: should clear the existing interval', () => {
        const fakeId = requestWorker.setInterval(callback, 20);
        requestWorker.clearInterval(fakeId);
        expect(workerPostMessageSpy).to.be.calledWith({
          name: 'clearInterval',
          fakeId
        });
      });

      it('_requestWorker.clearInterval: should not try to clear twice', () => {
        const fakeId = requestWorker.setInterval(callback, 20);
        workerPostMessageSpy.resetHistory();
        requestWorker.clearInterval(fakeId);
        requestWorker.clearInterval(fakeId);
        expect(workerPostMessageSpy).to.be.calledOnce;
      });

      it('_requestWorker.setTimeout: should send message to worker with necessary data', () => {
        const fakeId = requestWorker.setTimeout(callback, 20);
        expect(workerPostMessageSpy).to.be.calledWith({
          name: 'setTimeout',
          fakeId,
          time: 20
        });
      });

      it('_requestWorker.clearTimeout: should clear the existing timeout', () => {
        const fakeId = requestWorker.setTimeout(callback, 20);
        requestWorker.clearTimeout(fakeId);
        expect(workerPostMessageSpy).to.be.calledWith({
          name: 'clearTimeout',
          fakeId
        });
      });

      it('_requestWorker.clearTimeout: should not try to clear twice', () => {
        const fakeId = requestWorker.setTimeout(callback, 20);
        workerPostMessageSpy.resetHistory();
        requestWorker.clearTimeout(fakeId);
        requestWorker.clearTimeout(fakeId);
        expect(workerPostMessageSpy).to.be.calledOnce;
      });
    });
  });
});