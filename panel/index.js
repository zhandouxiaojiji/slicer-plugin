
const Jimp = Editor.require("packages://slicer-plugin/core/jimp.js");

Editor.Panel.extend({
  style: `
    :host { margin: 5px; }
    h2 { 
      color: #f90; 
    }
    input {
      width: 50;
    }
    .preview {
      width: auto;
      height: 300;
    }
    .input-layout {
      height:25;
      margin-top:10;
      margin-bottom:10;
    }
  `,

  template: `
    <h2>保留像素</h2>
    <div class="layout horizontal input-layout">
      <ui-input id="width" class="big" placeholder="width"></ui-input>
      <ui-input id="height" class="big" placeholder="height"></ui-input>
    </div>
    <ui-button id="btn">裁减</ui-button>
    <hr />
    <img id="img" class="preview"></img>
    `,

  $: {
    img: '#img',
    btn: '#btn',
    label: '#label',
    width: '#width',
    height: '#height',
  },

  message: {
  },

  curPath: '',

  ready() {
    this.updateImg();
    setInterval(() => {
      this.updateImg();
    }, 100);
  },

  updateImg() {
    const uuids = Editor.Selection.curSelection('asset');
    const uuid = uuids[0];
    if (this.curUuid == uuid) {
      return;
    }
    // Editor.log(uuid);
    Editor.assetdb.queryInfoByUuid(uuid, (err, info) => {
      if (!info) {
        return;
      }
      if (this.curPath == info.path) {
        return;
      }
      this.$width.value = "10";
      this.$height.value = "10";

      this.curPath = info.path;
      Editor.log(info.path);
      this.$img.src = info.path;

      Jimp.read(info.path, (err, image) => {
        Editor.log("err", err);
        Editor.log("image", image);
      })
      // var Jimp = require('../jimp');
      // Jimp.read(info.path, (err, image) => {
      //   Editor.log("err", err);
      //   Editor.log("image", image);
      // })

      // Editor.log("document", document);
      // const canvas = document.createElement('canvas');
      // Editor.log("canvas", canvas);
      // const ctx = canvas.getContext('2d');
      // Editor.log("ctx", ctx);
      // img.onload = () => {
      //   canvas.height = img.height;
      //   canvas.width = img.width;
      //   Editor.log(canvas.width, canvas.height);
      //   ctx.drawImage(img, 0, 0);
      //   var dataURL = canvas.toDataURL('image/png');
      //   Editor.log(dataURL);
      // };
    });
  },
});