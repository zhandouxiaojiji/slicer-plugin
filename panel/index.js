'use strict';

const fs = require('fs');
const Slicer = Editor.require("packages://slicer-plugin/core/slicer.js");

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
    <h2>当前尺寸</h2>
    <h3 id="sizeLabel"></h3>
    <h2>保留像素</h2>
    <div class="layout horizontal input-layout">
      <ui-input id="retain-width" class="big" placeholder="width"></ui-input>
      <ui-input id="retain-height" class="big" placeholder="height"></ui-input>
    </div>
    <ui-button id="btn">裁减</ui-button>
    <hr />
    <img id="previewImg" class="preview"></img>
    `,

  $: {
    btn: '#btn',
    sizeLabel: '#sizeLabel',
    previewImg: '#previewImg',
    retainWidth: '#retain-width',
    retainHeight: '#retain-height',
  },

  rawImage: undefined,
  curUuid: 0,
  sliced: undefined,

  message: {
  },

  curPath: '',

  ready() {
    this.curUuid = this.getSelectUuid();
    this.updateImg();
    setInterval(() => {
      let uuid = this.getSelectUuid()
      if (this.curUuid != uuid) {
        this.curUuid = uuid;
        this.updateImg();
      }
    }, 100);

    this.$btn.addEventListener('confirm', () => {
      this.cutImage();
    });
  },

  getSelectUuid() {
    const uuids = Editor.Selection.curSelection('asset');
    return uuids[0];
  },

  updateImg() {
    if (!this.curUuid) {
      return;
    }

    Editor.assetdb.queryInfoByUuid(this.curUuid, (err, info) => {
      if (!info) {
        return;
      }
      if (this.curPath == info.path) {
        return;
      }
      this.$retainWidth.value = "10";
      this.$retainHeight.value = "10";

      this.curPath = info.path;
      Editor.log(info.path);

      (async () => {
        this.rawImage = await Slicer.loadImageAsync(info.path);
        this.drawPreview();
      })();
    });
  },

  drawPreview() {
    const rawImage = this.rawImage;
    const previewImage = Slicer.cloneImage(rawImage);
    const sliced = Slicer.check(rawImage);
    Editor.log("check", sliced);
    this.sliced = sliced;
    Slicer.drawPreviewLine(previewImage, sliced.left, sliced.right, sliced.bottom, sliced.top);
    Slicer.getPngBase64Async(previewImage).then((data) => {
      this.$previewImg.src = data;
    });
    this.changeMeta();
  },

  getRetainRange() {
    let width = this.$retainWidth.value;
    let height = this.$retainHeight.value;
    return {
      width: parseInt(width),
      height: parseInt(height),
    }
  },

  cutImage() {
    if (!this.rawImage) {
      return;
    }
    const retain = this.getRetainRange();
    const sliced = this.sliced;
    Slicer.cutImage(this.rawImage, sliced.left, sliced.right, sliced.bottom,
      sliced.top, retain.width, retain.height, this.curPath).then((newImage) => {
        this.rawImage = newImage;
        this.drawPreview();
      });
  },

  changeMeta() {
    const sliced = this.sliced;
    const metaPath = this.curPath + ".meta";
    const meta = JSON.parse(fs.readFileSync(metaPath));
    const border = meta.subMetas.border;
    border.borderLeft = sliced.left;
    border.borderRight = sliced.right;
    border.borderBottom = sliced.bottom;
    border.borderTop = sliced.top;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  }
});