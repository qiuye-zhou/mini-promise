// test.js

// 导入我们写好的 promise
const Promise = require("./promise.js");

// 根据官方文档暴露一个 deferred 方法，返回一个包含 promise、resolve、reject 的对象
Promise.deferred = function () {
  const obj = {};

  obj.promise = new Promise(function (resolve, reject) {
    obj.resolve = resolve;
    obj.reject = reject;
  });

  return obj;
};

module.exports = Promise;