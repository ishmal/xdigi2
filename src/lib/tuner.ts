/**
 * Jdigi
 *
 * Copyright 2016, Bob Jamison
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http:// www.gnu.org/licenses/>.
 */

import {Constants} from './constants';
import {Digi} from './digi';

const BINS = Constants.BINS;

function trace(msg) {
    if (typeof console !== 'undefined') {
        console.log('Tuner: ' + msg);
    }
}

function error(msg) {
    if (typeof console !== 'undefined') {
        console.log('Tuner error : ' + msg);
    }
}

export interface Tuner {

    frequency: number;

    showScope(data: number): void;

    update(data: number[]): void;

}

export class TunerDummy implements Tuner {
    constructor() {

    }

    get frequency(): number { return 0; }

    showScope(data: number): void { }

    update(data: number[]): void { }
}

//add some things to the api
interface Window {
    msRequestAnimationFrame: any;
    requestAnimationFrame: any;
    addEventListener: any;
};

declare var window: Window;

/**
 * Provides a Waterfall display and tuning interactivity
 * @param par the parent Digi of this waterfall
 * @canvas the canvas to use for drawing
 */
export class TunerImpl implements Tuner {

    _par: Digi;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _waterfallCanvas: HTMLCanvasElement;
    _waterfallCtx: CanvasRenderingContext2D;
    _tempCanvas: HTMLCanvasElement;
    _tempCtx: CanvasRenderingContext2D;
    _MAX_FREQ: number;
    _dragging: boolean;
    _frequency: number;
    _indices: number[];
    _width: number;
    _height: number;
    _scopeData: number[];
    _palette: string[];

    constructor(par: Digi, canvas: HTMLCanvasElement) {

        window.requestAnimationFrame = window.requestAnimationFrame
            || window.msRequestAnimationFrame;
        //  || window.mozRequestAnimationFrame
        //  || window.webkitRequestAnimationFrame;

        this._par = par;
        this._canvas = canvas;
        this._MAX_FREQ = par.sampleRate * 0.5;
        this._dragging = false;
        this._frequency = 1000;
        this._indices = null;
        this._width = 100;
        this._height = 100;
        this._ctx = null;
        this._scopeData = [];

        this.setupCanvas();

        canvas.setAttribute('tabindex', '1');

        this._palette = this.makePalette();

        this.setupEvents(canvas);
    }

    // note that this is different from the public method
    set frequency(freq: number) {
        this._frequency = freq;
        this._par.frequency = freq;
    }

    get frequency(): number {
        return this._frequency;
    }

    createIndices(targetsize: number, sourcesize: number): number[] {
        let xs = new Array(targetsize);
        let ratio = sourcesize / targetsize;
        for (let i = 0; i < targetsize; i++) {
            xs[i] = Math.floor(i * ratio);
        }
        return xs;
    }

    setupCanvas(): void {
      let canvas = this._canvas;
      this._ctx = canvas.getContext('2d');
      this._width = canvas.width;
      this._height = canvas.height;
      // this._par.status('resize w:' + this._width + '  h:' + this._height);
      this._indices = this.createIndices(this._width, BINS);
      this._waterfallCanvas = document.createElement("canvas");
      this._waterfallCanvas.width = this._width;
      this._waterfallCanvas.height = this._height;
      this._waterfallCtx = this._waterfallCanvas.getContext('2d');
      this._tempCanvas = document.createElement("canvas");
      this._tempCanvas.width = this._width;
      this._tempCanvas.height = this._height;
      this._tempCtx = this._tempCanvas.getContext('2d');
    }

    // ####################################################################
    // #   MOUSE and KEY EVENTS
    // ####################################################################

    setupEvents(canvas) {

        // hate to use 'self' here, but it's a safe way
        let self = this;

        let FINE_INCR = 2;

        function mouseFreq(event) {
            let pt = getMousePos(canvas, event);
            let x = pt.x;
            let freq = self._MAX_FREQ * pt.x / self._width;
            self.frequency = freq;
        }

        function getMousePos(cnv, evt) {
            let touches = evt.touches;
            let cx = (touches) ? touches[0].clientX : evt.clientX;
            let cy = (touches) ? touches[0].clientY : evt.clientY;
            let rect = cnv.getBoundingClientRect();
            let x = (cx - rect.left) * cnv.width / rect.width;
            let y = (cy - rect.top) * cnv.height / rect.height;
            return { x: x, y: y };
        }

        canvas.onclick = (event) => {
            mouseFreq(event);
        };
        canvas.onmousedown = (event) => {
            self._dragging = true;
        };
        canvas.onmouseup = (event) => {
            self._dragging = false;
        };
        canvas.onmousemove = (event) => {
            if (self._dragging) {
                mouseFreq(event);
            }
        };
        canvas.ontouchstart = (event) => {
            self._dragging = true;
            event.preventDefault();
        };
        canvas.ontouchend = (event) => {
            self._dragging = false;
            event.preventDefault();
        };
        canvas.ontouchmove = (event) => {
            if (self._dragging) {
                mouseFreq(event);
            }
            event.preventDefault();
        };
        // fine tuning, + or - one hertz
        canvas.onkeydown = (evt) => {
            let key = evt.which;
            if (key === 37 || key === 40) {
                self.frequency += 1;
            } else if (key === 38 || key === 39) {
                self.frequency -= 1;
            }
            evt.preventDefault();
            return false;
        };

        function handleWheel(evt) {
            let delta = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
            self.frequency += (delta * 1); // or other increments here
            evt.preventDefault();
            return false;
        }

        canvas.onmousewheel = handleWheel;
        canvas.addEventListener('DOMMouseScroll', handleWheel, false);
    }

    // ####################################################################
    // #  R E N D E R I N G
    // ####################################################################

    /**
     * Make a palette. tweak this often
     * TODO:  consider using an HSV heat map
     */
    makePalette(): string[] {
        function decimalToHex(d) {
          let hex = d.toString(16);
          while (hex.length < 6) {
            hex = "0" + hex;
          }
          return hex;
        }

        let xs = new Array(256);
        for (let i = 0; i < 256; i++) {
            let r = (i < 170) ? 0 : (i - 170) * 3;
            let g = (i < 85) ? 0 : (i < 170) ? (i - 85) * 3 : 255;
            let b = (i < 85) ? i * 3 : 255;
            let col = (r << 16) + (g << 8) + b;
            xs[i] = '#' + decimalToHex(col);
        }
        return xs;
    }

    /**
     * Make a palette. tweak this often
     * TODO:  consider using an HSV heat map
     */
    makePalette2(): number[] {
        let xs = new Array(256);
        for (let i = 0; i < 256; i++) {
            let r = (i < 170) ? 0 : (i - 170) * 3;
            let g = (i < 85) ? 0 : (i < 170) ? (i - 85) * 3 : 255;
            let b = (i < 85) ? i * 3 : 255;
            let col = [r, g, b, 255];
            xs[i] = col;
        }
        return xs;
    }



    drawSpectrum(data) {
        let width = this._width;
        let height = this._height;

        let ctx = this._ctx;
        let indices = this._indices;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        let base = height - 1; // move this around
        ctx.moveTo(0, base);
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = log(1.0 + data[indices[x]]) * 12.0;
            let y = base - v;
            // trace('x:' + x + ' y:' + y);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(0, base);
        ctx.closePath();
        ctx.stroke();
    }


    drawWaterfall(data) {
      let w = this._width;
      let h = this._height;
      let indices = this._indices;
       let wfCanvas = this._waterfallCanvas;
       let wfCtx = this._waterfallCtx;
       let tmpCanvas = this._tempCanvas;
       let tempCtx = this._tempCtx;
       let palette = this._palette;
       let abs = Math.abs;
       let log = Math.log;
       let top = h - 1;

       tempCtx.drawImage(wfCanvas, 0, 0, w, h);

       // Each pixel is 4500/1024 = 4.39Hz wide
       // iterate over the elements from the array
       let last = '';
       for (let x = 0; x < w; x++) {
           // draw each pixel with the specific color
           let v = abs(data[indices[x]]);
           // if (x==50) trace('v:' + v);
           let p = Math.floor(Math.min(log(1.0 + v) * 30, 255));
           // if (x==50)trace('x:' + x + ' p:' + p);
           let pix = palette[p];
           if (last !== pix) {
             wfCtx.fillStyle = pix;
           }

           // draw the line on top:
           wfCtx.fillRect(x, top, 1, 1);
           last = pix;
       }
       // draw the cached (previous) image one line down
       wfCtx.drawImage(tmpCanvas, 0, 0, w, h, 0, -1, w, h);
       this._ctx.drawImage(wfCanvas, 0, 0, w, h);
    }


    drawTuner() {
        let MAX_FREQ = this._MAX_FREQ;
        let width = this._width;
        let height = this._height;
        let frequency = this._frequency;
        let ctx = this._ctx;

        let pixPerHz = 1 / MAX_FREQ * width;

        let x = frequency * pixPerHz;
        let bw = this._par.bandwidth;
        let bww = bw * pixPerHz;
        let bwlo = (frequency - bw * 0.5) * pixPerHz;

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(bwlo, 0, bww, height);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        let top = height - 15;

        for (let hz = 0; hz < MAX_FREQ; hz += 100) {
            if ((hz % 1000) === 0) {
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top);
                ctx.lineTo(x, height);
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                x = hz * pixPerHz;
                ctx.moveTo(x, top + 10);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        ctx.fillStyle = 'cyan';
        for (let hz = 0; hz < MAX_FREQ; hz += 500) {
            x = hz * pixPerHz - 10;
            ctx.fillText(hz.toString(), x, top + 14);
        }
    }

    /**
     * Plot mode-specific decoder graph data.
     * This method expects the data to be an array of [x,y] coordinates,
     * with x and y ranging from -1.0 to 1.0.  It is up to the mode generating
     * this array to determine how to draw it, and what it means.
     */
    drawScope() {
        let len = this._scopeData.length;
        if (len < 1) {
            return;
        }
        let ctx = this._ctx;
        let boxW = 100;
        let boxH = 100;
        let boxX = this._width - boxW;
        let boxY = 0;
        let centerX = boxX + (boxW >> 1);
        let centerY = boxY + (boxH >> 1);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.rect(boxX, boxY, boxW, boxH);
        ctx.stroke();
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(centerX, boxY);
        ctx.lineTo(centerX, boxY + boxH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX, centerY);
        ctx.lineTo(boxX + boxW, centerY);
        ctx.stroke();

        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        let pt = this._scopeData[0];
        let x = centerX + pt[0] * 50.0;
        let y = centerY + pt[1] * 50.0;
        ctx.moveTo(x, y);
        for (let i = 1; i < len; i++) {
            pt = this._scopeData[i];
            x = centerX + pt[0] * 50.0;
            y = centerY + pt[1] * 50.0;
            // console.log('pt:' + x + ':' + y);
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.restore();
    }

    updateData(data: number[]) {
        this.drawWaterfall(data);
        this.drawSpectrum(data);
        this.drawTuner();
        this.drawScope();
    }

    showScope(data) {
        this._scopeData = data;
    }

    update(data: number[]) {
        requestAnimationFrame(() => {
            this.updateData(data);
        });
    }

} // Tuner
