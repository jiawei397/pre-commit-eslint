var exec = require('child_process').exec;
var errTip = '存在错误，将尝试为您自动fix！';
var errTip2 = '依然存在错误，需要您手动处理后再提交！';
var errTip3 = '错误已被修复，需要您再提交一次！';

var execPromise = function (cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (error, stdout, stderr) { // 通过node子进程执行命令
      if (error) {
        // console.error(error);
        reject(stdout);
        return;
      }
      resolve(stdout);
    });
  });
};

var eslintFun = function (arr) {
  return execPromise('eslint  --cache --quiet ' + arr.join(' '));
};

var eslintFixFun = function (arr) {
  return execPromise('eslint  --cache --quiet --fix ' + arr.join(' '));
};

var eslintArr = [];

var lint = function (path) {
  return execPromise('git diff HEAD --name-only --diff-filter=ACMR ' + path)
    .then(function (stdout) {
      if (stdout) {
        eslintArr = stdout.split('\n');
        eslintArr.pop();
        return eslintFun(eslintArr);
      }
    })
    .catch(function (err) {
      console.warn(errTip);
      console.log('\x1B', err);//输出eslint错误信息
      return eslintFixFun(eslintArr);
    })
    .then(function () {
      console.warn(errTip3);
      return Promise.reject(errTip3);
    }, function (err) {
      console.error(errTip2);
      console.log('\x1B', err);//输出eslint错误信息
      return Promise.reject(errTip2);
    });
};

module.exports = function (path) {
  console.log('开始检查代码！');
  lint(path).catch(function () {
    process.exit(1);
  });
};
