var exec = require('child_process').exec;
var errTip = '存在错误，将尝试为您自动fix！';
var errTip2 = '依然存在错误，需要您手动处理后再提交！';
var errTip3 = '错误已被修复，需要您再提交一次！';
var errTip4 = 'eslint安装有问题，请重新安装依赖，然后检查node_modules/.bin目录下是否有eslint！';

var execPromise = function (cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (error, stdout, stderr) { // 通过node子进程执行命令
      if (error) {
        // console.error(error);
        if (stdout) {
          reject(stdout);
        } else {
          reject(false);//意义着git或eslint命令有问题
        }
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
    .then(function () {
      return 'ok';
    }, function (err) {
      if (err === false) {
        return Promise.reject(err);
      }
      console.warn(errTip);
      console.log('\x1B', err);//输出eslint错误信息
      return eslintFixFun(eslintArr);
    })
    .then(function (result) {
      if (result !== 'ok') {
        console.warn(errTip3);
        return Promise.reject(errTip3);
      }
    }, function (err) {
      if (err === false) {
        console.error(errTip4);
        return Promise.reject(errTip4);
      }
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
