function Promise(executor) {
    // Promise 必须处于这三种状态之一: pending,fulfilled,rejected
    this.state = "pending";
    // 如果Promise处于 fulfilled 状态，所有相应的 onFulfilled 回调必须按照它们对应的 then 的原始调用顺序来执行
    this.onFulfilledCallback = [];
    // 如果Promise处于 rejected 状态，所有相应的 onRejected 回调必须按照它们对应的 then 的原始调用顺序来执行
    this.onRejectedCallback = [];

    const self = this;

    function resolve(value) {
        setTimeout(() => {
            /**
             *  当Promise处于 pending 状态时 可以转换到 fulfilled 或 rejected 状态
             *  当Promise处于 fulfilled 状态时，不得过渡到其他任何状态，必须有一个不能改变的值
             */
            if(self.state === "pending") {
                self.state = "fulfilled";
                self.data = value;

                // 如果Promise处于 fulfilled 状态所有相应的 onFulfilled 回调必须按照它们对应的 then 的原始调用顺序来执行
                for(let i = 0; i < self.onFulfilledCallback.length; i++) {
                    self.onFulfilledCallback[i](value)
                }
            }
        })
    }

    function reject(err) {
        setTimeout(() => {
            /**
             *  当Promise处于 pending 状态时 可以转换到 fulfilled 或 rejected 状态
             *  当Promise处于 rejected 状态时，不得过渡到其他任何状态，必须有一个不能改变的值
             */
            if(self.state === "pending") {
                self.state = "rejected";
                self.data = err;

                // 如果Promise处于 rejected 状态所有相应的 onRejected 回调必须按照它们对应的 then 的原始调用顺序来执行
                for(let i = 0; i < self.onRejectedCallback.length; i++) {
                    self.onRejectedCallback[i](err);
                }
            }
        })
    }

    // 用户传入的函数也可能执行异常，所以用try...catch捕获异常 执行reject
    try {
        executor(resolve, reject);
    } catch (err) {
        reject(err)
    }
}

/**
 *  then 方法
 *  一个promise 必须提供一个 then 方法来访问其当前值或最终值或 rejected 的原因
 *  一个promise 的 then 方法接受两个参数
 *  promise.then(onFulfilled, onRejected)
 */
Promise.prototype.then = function (onFulfilled, onRejected) {
    const self = this;

    let promise2;
    // then 方法必须返回一个promise
    return (promise2 = new Promise(function (resolve, reject) {
        /**
         *  如果 onFulfilled 是一个函数
         *  它必须在 promise 状态变为 fulfilled 后被调用，并将 promise 的值作为它的第一个参数
         *  它一定不能在 promise 状态变 filfilled 前调用， 最多只能调用一次
         */
        if(self.state === "fulfilled") {
            /**
             *  onFulfilled 或 onRejected 在执行上下文堆栈仅包含平台代码之前不得调用
             *  可以通过“宏任务”机制（例如 setTimeout 或 setImmediate）或“微任务”机制（例如 MutationObserver 或 process.nextTick）来实现
             */
            setTimeout(() => {
                /**
                 *  onFulfilled 和 onRejected 都是可选参数
                 *  如果 onFulfilled 不是一个函数，则它必须被忽略
                 */
                if(typeof onFulfilled === "function") {
                    try {
                        /**
                         *  它必须在 promise 的状态变为 fulfilled 后被调用，并将 promise 的值作为它的第一个参数
                         *  onFulfilled 和 onRejected 必须作为函数调用
                         */
                        const res = onFulfilled(self.data);
                        // 如果 onFulfilled 或 onRejected 返回了一个值 res，则运行 Promise 处理程序 [[Resolve]](promise2, res)
                        promiseResolutionProcedure(promise2, res, resolve, reject);
                    } catch (err) {
                        // 如果 onFulfilled 或 onRejected 抛出了一个异常，promise2 必须用 err 作为 err 来变为 rejected 状态
                        reject(err)
                    }
                } else {
                    // 如果 onFulfilled 不是一个函数且 promise1 为 fulfilled 状态，promise2 必须用和 promise1 一样的值来变为 fulfilled 状态
                    resolve(self.data)
                }
            })
        } else if(self.state === "rejected") {
            /**
             *  onFulfilled 或 onRejected 在执行上下文堆栈仅包含平台代码之前不得调用
             *  这可以通过“宏任务”机制（例如 setTimeout 或 setImmediate）或“微任务”机制（例如 MutationObserver 或 process.nextTick）来实现
             */
            setTimeout(() => {
                /**
                 *  onFulfilled 和 onRejected 都是可选参数
                 *  如果 onRejected 不是一个函数，它必须被忽略
                 */
                if(typeof onRejected === "function") {
                    try {
                        /**
                         *  它必须在 promise 的状态变为 rejected 后被调用，并将 promise 的 err 作为它的第一个参数
                         *  onFulfilled 和 onRejected 必须作为函数调用
                         */
                        const res = onRejected(self.data);
                        // 如果 onFulfilled 或 onRejected 返回了一个值 res，则运行 Promise 处理程序 [[Resolve]](promise2, res)
                        promiseResolutionProcedure(promise2, res, resolve, reject)
                    } catch (err) {
                        // 如果 onFulfilled 或 onRejected 抛出了一个异常，promise2 必须用 err 作为 err 来变为 rejected 状态c
                        reject(err)
                    }
                } else {
                    // 如果 onRejected 不是一个函数且 promise1 为 rejected 状态，promise2 必须用和 promise1 一样的 err 来变为 rejected 状态
                    resolve(self.data)
                }
            })
        } else if(self.state === "pending") {
            /**
             *  then 可能会被同一个 promise 多次调用
             *  如果 promise 处于 fulfilled 状态，所有相应的 onFulfilled 回调必须按照它们对应的 then 的原始调用顺序来执行
             */
            self.onFulfilledCallback.push(function(promise1Value) {
                if(typeof onFulfilled === "function") {
                    try {
                        /**
                         *  它必须在 promise 的状态变为 fulfilled 后被调用，并将 promise 的值作为它的第一个参数
                         *  onFulfilled 和 onRejected 必须作为函数调用
                         */
                        const res = onFulfilled(self.data);
                        // 如果 onFulfilled 或 onRejected 返回了一个值 x，则运行 Promise 处理程序 [[Resolve]](promise2, x)
                        promiseResolutionProcedure(promise2, res, resolve, reject);
                    } catch (err) {
                        // 如果 onFulfilled 或 onRejected 抛出了一个异常，promise2 必须用 e 作为 reason 来变为 rejected 状态
                        reject(err)
                    }
                } else {
                    // 如果 onFulfilled 不是一个函数且 promise1 为 fulfilled 状态，promise2 必须用和 promise1 一样的值来变为 fulfilled 状态
                    resolve(promise1Value);
                }
            })

            // 如果 promise 处于 rejected 状态，所有相应的 onRejected 回调必须按照它们对应的 then 的原始调用顺序来执行
            self.onRejectedCallback.push(function(promise1err) {
                if(typeof onRejected === "function") {
                    try {
                        /**
                         *  它必须在 promise 的状态变为 rejected 后被调用，并将 promise 的 reason 作为它的第一个参数
                         *  onFulfilled 和 onRejected 必须作为函数调用
                         */
                        const res = onRejected(self.data)
                        // 如果 onFulfilled 或 onRejected 返回了一个值 x，则运行 Promise 处理程序 [[Resolve]](promise2, x)
                        promiseResolutionProcedure(promise2, res, resolve, reject)
                    } catch (err) {
                        // 如果 onFulfilled 或 onRejected 抛出了一个异常，promise2 必须用 err 作为 err 来变为 rejected 状态
                        reject(err)
                    }
                } else {
                    // 如果 onRejected 不是一个函数且 promise1 为 rejected 状态，promise2 必须用和 promise1 一样的 reason 来变为 rejected 状态
                    reject(promise1err)
                }
            })
        }
    }))
}

/**
 *  promise 处理程序
 *  Promise 处理程序是一个将 promise 和 value 作为输入的抽象操作，我们将其表示为 [[Resolve]](promise, x)
 *  这里我们将 resolve 和 reject 也传入进来，因为后续要根据不同的逻辑对 promise 执行 fulfill 或 reject 操作
 */
function promiseResolutionProcedure(promise2, res, resolve, reject) {
    // 如果 promise 和 res 引用的是同一个对象，promise 将以一个 TypeError 作为 err 来进行 reject
    if(promise2 === res) {
        return reject(new TypeError("Chaining cycle detected for promise"))
    }
    // 如果 res 是一个 promise，根据它的状态
    if(res instanceof Promise) {
        // 如果 res 的状态为 pending，promise 必须保持 pending 状态直到 res 的状态变为 fulfilled 或 rejected
        if(res.state === "pending") {
            res.then(function (value) {
                promiseResolutionProcedure(promise2, value, resolve, reject);
            }, reject);
        } else if(res.state === "fulfilled") {
            // 如果 res 的状态为 fulfilled，那么 promise 也用同样的值来执行 fulfill 操作
            resolve(res.data);
        } else if(res.state === "rejected") {
            // 如果 res 的状态为 rejected，那么 promise 也用同样的 reason 来执行 reject 操作
            reject(res.data);
        }
        return;
    }
    // 除此之外，如果 res 是一个对象或者函数
    if(res && (typeof res === "object" || typeof res === "function")) {
        // 如果 resolvePromise 和 rejectPromise 都被调用，或者多次调用同样的参数，则第一次调用优先，任何之后的调用都将被忽略
        let isCalled = false;

        try {
            // 声明一个 then 变量来保存 then
            let then = res.then;
            // 如果 then 是一个函数，将 res 作为 this 来调用它，第一个参数为 resolvePromise，第二个参数为 rejectPromise，其中
            if(typeof then === "function") {
                then.call(
                    res, 
                    // 假设 resolvePromise 使用一个名为 y 的值来调用，运行 promise 处理程序 [[Resolve]](promise, y)
                    function resolvePromise(y) {
                        // 如果 resolvePromise 和 rejectPromise 都被调用，或者多次调用同样的参数，则第一次调用优先，任何之后的调用都将被忽略
                        if(isCalled) return;
                        isCalled = true;
                        return promiseResolutionProcedure(promise2, y, resolve, reject);
                    },
                    // 假设 rejectPromise 使用一个名为 r 的 reason 来调用，则用 r 作为 reason 对 promise 执行 reject 操作
                    function rejectPromise(r) {
                        // 如果 resolvePromise 和 rejectPromise 都被调用，或者多次调用同样的参数，则第一次调用优先，任何之后的调用都将被忽略
                        if(isCalled) return;
                        isCalled = true;
                        return reject(r);
                    }
                )
            } else {
                // 如果 then 不是一个函数，使用 res 作为值对 promise 执行 fulfill 操作
                resolve(res)
            }
        } catch (err) {
            /**
             *  如果检索 res.then 的结果抛出异常 err，使用 err 作为 reason 对 promise 执行 reject 操作
             *  如果调用 then 时抛出一个异常 err
             *  如果 resolvePromise 或 rejectPromise 已经被调用过了，则忽略异常
             */
            if (isCalled) return;
            isCalled = true;
            // 否则，使用 err 作为 reason 对 promise 执行 reject 操作。
            reject(err);
        }
    }
    else {
        // 如果 res 不是一个对象或者函数，使用 res 作为值对 promise 执行 fulfill 操作
        resolve(res);
    }
}

module.exports = Promise