'use strict';

module.exports = {
  load() {
    // 当 package 被正确加载的时候执行
  },

  unload() {
    // 当 package 被正确卸载的时候执行
  },

  messages: {
    'say-hello'() {
      const uuids = Editor.Selection.curSelection('asset');
      Editor.log(uuids[0]);
      let obj = Editor.assetdb.assetInfoByUuid(uuids[0]);
      Editor.log(obj);
    }
  }
};