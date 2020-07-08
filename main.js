'use strict';

module.exports = {
  load() {
    // 当 package 被正确加载的时候执行
  },

  unload() {
    // 当 package 被正确卸载的时候执行
  },

  messages: {
    'slicer-plugin:panel'() {
      const uuids = Editor.Selection.curSelection('asset');
      let obj = Editor.assetdb.assetInfoByUuid(uuids[0]);
      Editor.Panel.open('slicer-plugin');
    }
  },
};