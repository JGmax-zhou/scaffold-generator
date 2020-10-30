const path = require('path');
const fse = require('fs-extra');
const sylvanas = require('sylvanas');
const glob = require('glob');

const getFileList = (patterns, options) => {
  let fileList = [];
  patterns.forEach((pattern) => {
    fileList = [...fileList, ...glob.sync(pattern, options)];
  });
  return fileList;
};

module.exports = (api, typescript) => {
  const { context } = api;
  const lintFile = typescript ? '_eslintrcts.js' : '_eslintrcjs.js';
  if (!typescript) {
    api.onHook('afterCleanUp', () => {
      // complie ts -> ts
      const fileList = getFileList(['**/*.tsx', '**/*.ts'], {
        cwd: context.rootDir,
        ignore: ['**/*.d.ts', 'node_modules/**/*'],
      });
      sylvanas(fileList, {
        cwd: context.rootDir,
        action: 'overwrite',
      });
    });
    api.addTemplate({ source: 'jsconfig.json'});
  }
  api.addTemplate({ source: 'tsconfig.json'});
  const lintCode = fse.readFileSync(path.join(context.templateDir, lintFile), 'utf-8');
  api.writeToProject('./_eslintrc.js', lintCode);
};