Editor.Panel.extend({
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  template: `
    <h2>九宫格</h2>
    <img id="img"></img>
    <ui-button id="btn">点击</ui-button>
    <hr />
    <div>状态: <span id="label">--</span></div>
  `,

  $: {
    img: '#img',
    btn: '#btn',
    label: '#label',
  },

  ready() {
    this.updateImg();

    this.$btn.addEventListener('confirm', () => {
      this.$label.innerText = '你好';
      setTimeout(() => {
        this.$label.innerText = '--';
      }, 500);
    });
  },

  updateImg() {
    const uuids = Editor.Selection.curSelection('asset');
    const uuid = uuids[0];
    Editor.log(uuid);
    // let obj = Editor.assetdb.assetInfoByUuid(uuids[0]);
    Editor.assetdb.queryInfoByUuid(uuid, (err, info) => { 
      // info.path// info.url // info.type
      Editor.log(info.path);
      this.$img.src = info.path;
    });
    // Editor.log(obj);
  },
});