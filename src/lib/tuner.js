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


class Draggable {

    /**
    pos0: Point;
    */

    /**
     * @param p {Point}
     */
    constructor(p) {
        this.pos0 = pos0;
    }

    /**
     * @param p {Point}
     */
    drag(p) {
    }

    /**
     * @param p {Point}
     */
    end(p) {
    }
}

export class TunerBase {

    constructor() {
    }

    /**
     * @return {number}
     */
    get frequency() { return 0; }

    /**
     * @param data {number}
     */
    showScope(data) { }

    /**
     * @param data {Uint8Array}
     */
    update(data) { }
}




/**
 * Provides a Waterfall display and tuning interactivity
 * @param par the parent Digi of this waterfall
 * @canvas the canvas to use for drawing
 */
export class Tuner extends TunerBase {

    /**
    _par: Digi;
    _canvas: HTMLCanvasElement;
    _MAX_FREQ: number;
    _draggable: Draggable;
    _frequency: number;
    _indices: number[];
    _width: number;
    _height: number;
    _ctx: CanvasRenderingContext2D;
    _imgData: ImageData;
    _imglen: number;
    _buf8: Uint8ClampedArray;
    _rowsize: number;
    _lastRow: number;
    _scopeData: number[];
    _palette: number[];
    _tuningRate: number;
    */

    /**
     * @param par parent instance of a Digi api
     * @param canvas {HTMLCanvasElement}
     */
    constructor(par, canvas) {

        window.requestAnimationFrame = window.requestAnimationFrame ||
          window.msRequestAnimationFrame;
        //  || window.mozRequestAnimationFrame
        //  || window.webkitRequestAnimationFrame;
        super();
        this._par = par;
        this._canvas = canvas;
        this._MAX_FREQ = par.sampleRate * 0.5;
        this._draggable = null;
        this._frequency = 1000;
        this._indices = null;
        this._width = 100;
        this._height = 100;
        this._ctx = null;
        this._imgData = null;
        this._imglen = null;
        this._buf8 = null;
        this._rowsize = null;
        this._lastRow = null;
        this._scopeData = [];
        this.tuningRate = 1.0;

        this.setupBitmap();

        canvas.setAttribute('tabindex', '1');

        this._palette = this.makePalette();

        this.setupEvents(canvas);
    }

    /**
     * note that this is different from the public method
     * @param frequency {number}
     */
    set frequency(freq) {
        this._frequency = freq;
        this._par.frequency = freq;
    }

    /**
     * @return {number}
     */
    get frequency() {
        return this._frequency;
    }

    /**
     * @param targetsize {number}
     * @param sourcesize {number}
     * @return {number[]}
     */
    createIndices(targetsize, sourcesize) {
        let xs = new Array(targetsize);
        let ratio = sourcesize / targetsize;
        for (let i = 0; i < targetsize; i++) {
            xs[i] = Math.floor(i * ratio);
        }
        return xs;
    }


    setupBitmap() {
        let canvas = this._canvas;
        this._width = canvas.width;
        this._height = canvas.height;
        // this._par.status('resize w:' + this._width + '  h:' + this._height);
        this._indices = this.createIndices(this._width, BINS);
        this._ctx = canvas.getContext('2d');
        let imgData = this._imgData = this._ctx.createImageData(this._width, this._height);
        let imglen = this._imglen = imgData.data.length;
        let buf8 = this._buf8 = imgData.data;
        for (let i = 0; i < imglen;) {
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 255;
        }
        // imgData.data.set(buf8);
        this._ctx.putImageData(imgData, 0, 0);
        this._rowsize = imglen / this._height;
        this._lastRow = imglen - this._rowsize;
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

        let didDrag = false;

        function onClick(event) {
            if (!didDrag) {
                mouseFreq(event);
            }
            self._draggable = null;
            event.preventDefault();
        }

        function onMouseDown(event) {
            didDrag = false;
            let pos = getMousePos(canvas, event);
            let freq0 = self.frequency;
            let d = new Draggable(pos);
            d.drag = (p) => {
                let dx = p.x - d.pos0.x;
                dx *= self._tuningRate; //cool!
                let freqDiff = self._MAX_FREQ * dx / self._width;
                self.frequency = freq0 + freqDiff;
            };
            self._draggable = d;
            event.preventDefault();
        }

        function onMouseUp(event) {
            if (self._draggable) {
                let pos = getMousePos(canvas, event);
                self._draggable.end(pos);
            }
            self._draggable = null;
            event.preventDefault();
        }

        function onMouseMove(event) {
            let d = self._draggable;
            if (d) {
                didDrag = true;
                let pos = getMousePos(canvas, event);
                d.drag(pos);
            }
            event.preventDefault();
        }

        canvas.onclick = onClick;
        canvas.onmousedown = onMouseDown;
        canvas.onmouseup = onMouseUp;
        canvas.onmousemove = onMouseMove;
        canvas.ontouchstart = onMouseDown;
        canvas.ontouchend = onMouseUp;
        canvas.ontouchmove = onMouseMove;

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
     * @return {number[]}
     */
    makePalette() {
        let xs = [];
        for (let i = 0; i < 256; i++) {
            let r = (i < 170) ? 0 : (i - 170) * 3;
            let g = (i < 85) ? 0 : (i < 170) ? (i - 85) * 3 : 255;
            let b = (i < 85) ? i * 3 : 255;
            let col = [r, g, b, 255];
            xs[i] = col;
        }
        return xs;
    }

    /**
     * Alternate palette
     * @return {number[]}
     */
    makePalette2() {
        let size = 65536;
        let xs = [];
        let range1 = {
            start: 0,
            end: size/2,
            r0: 0.0,
            g0: 0.0,
            b0: 0.0,
            r1: 0.0,
            g1: 255,
            b1: 255
        };
        let range2 = {
            start: size/2 + 1,
            end: size-1,
            r0: 0,
            g0: 255,
            b0: 255,
            r1: 255,
            g1: 0,
            b1: 255
        };
        let ranges = [ range1, range2 ];

        for (let i=0 ; i < size ; i++) {
            xs[i] = [ 0, 0, 0 ];
        }
        ranges.forEach( r => {
            let d = 1.0 / (r.end - r.start + 1);
            let tween = 0;
            let rr = r.r1 - r.r0;
            let gr = r.g1 - r.g0;
            let br = r.b1 - r.b0;
            for (let i = r.start; i <= r.end ; i++) {
                xs[i] = [
                     r.r0 + rr * tween,
                     r.g0 + gr * tween,
                     r.b0 + br * tween
                ];
                tween += d;
            }
        });

         return xs;
    }


    drawSpectrum(data) {
        let width = this._width;
        let height = this._height;
        let ctx = this._ctx;
        let indices = this._indices;

        ctx.lineWidth = 1;
        ctx.beginPath();
        let base = height - 1;
        ctx.moveTo(0, base);
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = data[indices[x]] * 0.25;
            let y = base - v;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }


    drawWaterfall(data) {
        let buf8 = this._buf8;
        let rowsize = this._rowsize;
        let imglen = this._imglen;
        let imgData = this._imgData;
        let width = this._width;
        let indices = this._indices;
        let palette = this._palette;

        buf8.set(buf8.subarray(rowsize, imglen)); // <-cool, if this works
        // trace('data:' + data[50]);

        let idx = this._lastRow;
        for (let x = 0; x < width; x++) {
            let v = data[indices[x]];
            let pix = palette[v];
            // if (x==50)trace('p:' + p + '  pix:' + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = 255;
        }
        imgData.data.set(buf8);
        this._ctx.putImageData(imgData, 0, 0);
    }

    drawWaterfall2(data) {
        let width = this._width;
        let lastRow = this._lastRow;
        let palette = this._palette;
        let buf8 = this._buf8;
        let rowsize = this._rowsize;
        let imgData = this._imgData;
        let indices = this._indices;
        let imglen = this._imglen;
        let ctx = this._ctx;

        buf8.set(buf8.subarray(rowsize, imglen)); //scroll up one row
        let idx = lastRow;
        let log = Math.log;
        for (let x = 0; x < width; x++) {
            let v = data[indices[x]];
            // if (x==50) trace('v:' + v);
            let p = log(1.0 + v) * 30;
            // if (x==50)trace('x:' + x + ' p:' + p);
            let pix = palette[p & 255];
            // if (x==50)trace('p:' + p + '  pix:' + pix.toString(16));
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = pix[3];
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
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

        // all done
        ctx.restore();
    }

    /**
     * @param data {Uint8Array}
     */
    updateData(data) {
        this.drawWaterfall(data);
        //this.drawSpectrum(data);
        this.drawTuner();
        this.drawScope();
    }

    showScope(data) {
        this._scopeData = data;
    }

    /**
     * @param data {Uint8Array}
     */
    update(data) {
        requestAnimationFrame(() => {
            this.updateData(data);
        });
    }

} // Tuner
