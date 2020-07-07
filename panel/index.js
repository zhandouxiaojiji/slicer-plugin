
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
      // this.$img.src = info.path;

      (async () => {
        const rawImage = await Slicer.loadImageAsync(info.path);
        const previewImage = Slicer.cloneImage(rawImage);
        const {x1, x2, y1, y2} = Slicer.check(rawImage);
        Slicer.drawPreviewLine(previewImage, x1, x2, y1, y2);
        this.$img.src = await Slicer.getPngBase64Async(previewImage);
        Editor.log("check", x1, x2, y1, y2);
      })();
    });
  },
});