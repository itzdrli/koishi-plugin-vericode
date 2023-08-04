import { Context, h, Schema } from "koishi";
import {} from "koishi-plugin-skia-canvas";
export const name = "vericode";

export interface Config {
  type: string;
  codeLen: number;
  width: number;
  height: number;
}

export const Config: Schema<Config> = Schema.object({
  type: Schema.union(["default", "number", "letter"]).default("default"),
  codeLen: Schema.number().default(4),
  width: Schema.number().default(200),
  height: Schema.number().default(200),
});

export function apply(ctx: Context, config: Config) {
  ctx.on("guild-member-added", async (member) => {
    const canvas = ctx.canvas.createCanvas(config.width, config.height);
    const context = canvas.getContext("2d");

    // define number and letters for generating the code
    // some of numbers and letters may look alike in sans-serif font
    // they are:
    // numbers: 0, 1
    // letters: i, l, o, I, L, O, Q, S
    // feel free to delete them from the string
    const numberArr = "0123456789".split("");
    const letterArr =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    let codeText = "";
    let targetArr = [];

    // define final characters set
    if (config.type === "default") {
      targetArr = numberArr.concat(letterArr);
    } else if (config.type === "number") {
      targetArr = numberArr;
    } else {
      targetArr = letterArr;
    }

    // set fill color for the canvas rectangle
    // color between RGB 180 ~ 255 is relatively light
    // so that it won't conflict with foreground chars
    context.fillStyle = randomColor(180, 255);
    // set background opacity
    context.globalAlpha = 0.7;
    // fill rectangle
    context.fillRect(0, 0, config.width, config.height);
    // reset alpha value for text
    context.globalAlpha = 1;

    // generation code chars
    for (let i = 0; i < config.codeLen; i++) {
      // randomly pick a character
      const textIndex = randomInt(0, targetArr.length - 1);
      const targetChar = targetArr[textIndex];

      // set style for the char
      context.font = "bold 38px serif";
      // set baseline alignment
      context.textBaseline = "middle";
      // fill the char
      // color between RGB 1 ~ 100 is relatively dark
      // so that your char stands out from the background
      context.fillStyle = randomColor(1, 100);

      // translate positions
      const transX = (config.width / config.codeLen) * (i + 0.2);
      const transY = config.height / 2;
      // random scale sizes
      const scaleX = randomArbitrary(0.8, 1);
      const scaleY = randomArbitrary(0.8, 1);
      // random rotate degree
      const deg = Math.PI / 180;
      const rotate = randomArbitrary(-60, 60);

      // DO NOT put rotate before translate
      // SEQUENCE DOES MATTER !!!
      context.translate(transX, transY);
      context.scale(scaleX, scaleY);
      context.rotate(deg * rotate);

      // fill the char
      context.fillText(targetChar, 0, 0);
      // reset all transforms for next char
      context.setTransform(1, 0, 0, 1, 0, 0);

      // save the char into string
      codeText += targetChar;
    }

    return h.image(context.canvas.toBuffer('image/png'), 'image/png');
  });
}

/**
 * Get a random number between [min, max)
 * @param {number} min minimun value
 * @param {number} max maximun value
 */
const randomArbitrary = (min, max) => Math.random() * (max - min) + min;

/**
 * Get a random integer between  [min, max]
 * @param {number} min minimun value
 * @param {number} max maximun value
 */
const randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Get a random color value between [min, max]
 * @param {number} min minimun value
 * @param {number} max maximun value
 */
const randomColor = (min, max) => {
  const r = randomInt(min, max);
  const g = randomInt(min, max);
  const b = randomInt(min, max);
  return `rgb(${r}, ${g}, ${b})`;
};
