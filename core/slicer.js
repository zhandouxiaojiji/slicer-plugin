const Jimp = require("jimp");

const checkPixel = (p1, p2) => {
  const c1 = Jimp.intToRGBA(p1);
  const c2 = Jimp.intToRGBA(p2);
  if (c1.a == c2.a && c1.a == 0) {
    return true;
  }
  return c1.r == c2.r && c1.g == c2.g && c1.b == c2.b && c2.a == c2.a
}

exports.check = async (path) => {
  return new Promise((resolve, reject) => {
    let x1, x2, y1, y2;
    Jimp.read(path, (err, image) => {
      Editor.log("err", err);
      Editor.log("image", image.bitmap);
      const bitmap = image.bitmap;
      Editor.log(image.getPixelColor(0, 0));
      Editor.log(image.getPixelColor(50, 50));
      let width = bitmap.width;
      let height = bitmap.height;
      let x0 = Math.floor(width / 2);
      let y0 = Math.floor(height / 2);

      for (let x = x0; x > 1; x--) {
        let same = true;
        for (let y = 0; y < height; y++) {
          let p1 = image.getPixelColor(x, y);
          let p2 = image.getPixelColor(x - 1, y);
          if (!checkPixel(p1, p2)) {
            same = false;
            break;
          }
        }
        if (!same) {
          x1 = x;
          break;
        }
      }

      for (let x = x0; x < width - 1; x++) {
        let same = true;
        for (let y = 0; y < height; y++) {
          let p1 = image.getPixelColor(x, y);
          let p2 = image.getPixelColor(x + 1, y);
          if (!checkPixel(p1, p2)) {
            same = false;
            break;
          }
        }
        if (!same) {
          x2 = x;
          break;
        }
      }

      for (let y = y0; y > 1; y--) {
        let same = true;
        for (let x = 0; x < height; x++) {
          let p1 = image.getPixelColor(x, y);
          let p2 = image.getPixelColor(x, y - 1);
          if (!checkPixel(p1, p2)) {
            same = false;
            break;
          }
        }
        if (!same) {
          y1 = y;
          break;
        }
      }

      for (let y = y0; y < height - 1; y++) {
        let same = true;
        for (let x = 0; x < width; x++) {
          let p1 = image.getPixelColor(x, y);
          let p2 = image.getPixelColor(x, y + 1);
          if (!checkPixel(p1, p2)) {
            same = false;
            break;
          }
        }
        if (!same) {
          y2 = y;
          break;
        }
      }

      resolve({ x1, x2, y1, y2 });
    })
  })
}