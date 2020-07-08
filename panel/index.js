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
    <h2>边界</h2>
    <h3 id="borderLabel"></h3>
    <h2>保留像素</h2>
    <div class="layout horizontal input-layout">
      <ui-input id="retain-width" class="big" placeholder="width"></ui-input>
      <ui-input id="retain-height" class="big" placeholder="height"></ui-input>
    </div>
    <ui-button id="sliceBtn">设置九宫格</ui-button>
    <ui-button id="cutBtn">裁切并设置九宫格</ui-button>
    <hr />
    <img id="previewImg" class="preview"></img>
    `,

  $: {
    cutBtn: '#cutBtn',
    sliceBtn: '#sliceBtn',
    sizeLabel: '#sizeLabel',
    borderLabel: '#borderLabel',
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

    this.$cutBtn.addEventListener('confirm', () => {
      this.cutImage();
      this.changeMeta();
      // Editor.assetdb.refresh(this.curPath);
      // Editor.log("cut done!");
    });

    this.$sliceBtn.addEventListener('click', () => {
      this.changeMeta();
      // Editor.assetdb.refresh(this.curPath);
    })
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
    // Editor.log("check", sliced);
    this.sliced = sliced;
    Slicer.drawPreviewLine(previewImage, sliced.left, sliced.right, sliced.bottom, sliced.top);
    Slicer.getPngBase64Async(previewImage).then((data) => {
      this.$previewImg.src = data;
    });
    this.$sizeLabel.innerText = `${rawImage.bitmap.width} * ${rawImage.bitmap.height}`;
    this.$borderLabel.innerText = `上:${sliced.top}px 下:${sliced.bottom}px 左:${sliced.left}px 右:${sliced.right}px`
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
    if (!this.curUuid) {
      return;
    }
    Editor.assetdb.queryMetaInfoByUuid(this.curUuid, (err, info) => {
      const sliced = this.sliced;
      const meta = JSON.parse(info.json);
      const border = meta.subMetas.border;
      border.borderLeft = sliced.left;
      border.borderRight = sliced.right;
      border.borderBottom = sliced.bottom;
      border.borderTop = sliced.top;
      Editor.assetdb.saveMeta(this.curUuid, JSON.stringify(meta, null, 2));
    });
  }
});