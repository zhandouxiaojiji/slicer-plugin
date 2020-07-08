'use strict';

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
        this.drawPreview(this.rawImage);
      })();
    });
  },

  drawPreview(rawImage) {
    const previewImage = Slicer.cloneImage(rawImage);
    const sliced = Slicer.check(rawImage);
    this.sliced = sliced;
    Slicer.drawPreviewLine(previewImage, sliced.x1, sliced.x2, sliced.y1, sliced.y2);
    Slicer.getPngBase64Async(previewImage).then((data) => {
      this.$previewImg.src = data;
    })
    Editor.log("check", sliced);
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
    Editor.log("#### before cut", sliced);
    Slicer.cutImage(this.rawImage, sliced.x1, sliced.x2, sliced.y1,
      sliced.y2, retain.width, retain.height, this.curPath).then((newImage) => {
        Editor.log("new", newImage);
        this.rawImage = newImage;
        this.drawPreview(newImage);
      });
  }
});