'use strict';

const Jimp = require("jimp");

const checkPixel = (p1, p2) => {
  const c1 = Jimp.intToRGBA(p1);
  const c2 = Jimp.intToRGBA(p2);
  if (c1.a == c2.a && c1.a == 0) {
    return true;
  }
  return c1.r == c2.r && c1.g == c2.g && c1.b == c2.b && c2.a == c2.a
}

exports.loadImageAsync = async (path) => {
  return new Promise((resolve, reject) => {
    Jimp.read(path, (err, image) => {
      if (err) {
        return reject(err);
      } else {
        resolve(image);
      }
    })
  });
}

exports.newImageAsync = async (width, height) => {
  return new Promise((resolve, reject) => {
    new Jimp(width, height, (err, image) => {
      if (err) {
        return reject(err);
      } else {
        resolve(image);
      }
    });
  })
}

exports.getPngBase64Async = async (image) => {
  return image.getBase64Async(Jimp.MIME_PNG);
}

exports.cloneImage = (image) => {
  return image.clone();
}

exports.check = (image) => {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  // Editor.log("check image", image.bitmap);
  const bitmap = image.bitmap;
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
  return { x1, x2, y1, y2 };
}

exports.drawPreviewLine = (image, x1, x2, y1, y2) => {
  const hex = 0x00ff0099;
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  for (let x = 0; x < width; x++) {
    image.setPixelColor(hex, x, y1);
    image.setPixelColor(hex, x, y2);
  }
  for (let y = 0; y < height; y++) {
    image.setPixelColor(hex, x1, y);
    image.setPixelColor(hex, x2, y);
  }
}

exports.cutImage = async (rawImage, x1, x2, y1, y2, retainWidth, retainHeight, path) => {
  const rawWidth = rawImage.bitmap.width;
  const rawHeight = rawImage.bitmap.height;
  if (x1 > x2) {
    x1 = Math.floor(rawWidth);
    x2 = x1;
  }
  if (y1 > y2) {
    y1 = Math.floor(rawHeight);
    y2 = y1;
  }
  var newWidth = x1 + (rawWidth - x2) + retainWidth;
  var newHeight = y1 + (rawHeight - y2) + retainHeight;
  if (newWidth > rawWidth) {
    newWidth = rawWidth;
  }
  if (newHeight > rawHeight) {
    newHeight = rawHeight;
  }
  Editor.log("cut image", x1, x2, y1, y2, retainWidth, retainHeight, newWidth, newHeight);
  return new Promise((resolve, reject) => {
    new Jimp(newWidth, newHeight, (err, newImage) => {
      Editor.log("newImage", err, newImage);
      for (let x = 0; x < newWidth; x++) {
        for (let y = 0; y < newHeight; y++) {
          let rawX, rawY;
          if (x >= rawWidth - x2) {
            rawX = x + rawWidth - newWidth;
          } else {
            rawX = x;
          }
          if (y >= rawHeight - y2) {
            rawY = y + rawHeight - newHeight;
          } else {
            rawY = y;
          }
          Editor.log(rawX, rawY, "=>", x, y);
          newImage.setPixelColor(x, y, rawImage.getPixelColor(rawX, rawY));
        }
      }
      resolve(newImage);
    });
  });
}