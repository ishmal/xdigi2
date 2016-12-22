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
/* jslint node: true */

import {Digi} from '../digi';
import {Complex} from '../complex';
import {Nco, NcoCreate, NcoCreateSimple} from '../nco';
import {Constants} from '../constants';
import {Filter, Biquad} from '../filter';

export interface Control {
    name: string;
    type: string;
    tooltip?: string;
    value: any;
    options?: Object;
}

export interface Properties {
    name: string;
    description: string;
    tooltip: string;
    controls: Control[];
}

export class Afc {
    adjust() {
    }
    compute(ps: number[]) {
    }
}


export class Mode {

    par: Digi;
    _frequency: number;
    _afcFilter: Filter;
    _loBin: number;
    _freqBin: number;
    _hiBin: number;
    _afc: Afc;
    _useAfc: boolean;
    _rate: number;
    _nco: Nco;
    _txNco: Nco;
    _obuf: Float32Array;
    _optr: number;
    _ibuf: number[];
    _ilen: number;
    _iptr: number;
    _cwBuffer: number[];


    constructor(par: Digi) {
        this.par = par;
        this._frequency = 1000;
        this.setupAfc();
        this._useAfc = false;
        this._rate = 31.25;
        this._nco = NcoCreateSimple(this._frequency, par.sampleRate);
        this._txNco = NcoCreateSimple(this._frequency, par.sampleRate);
        this._cwBuffer = new Array(1024)
        this._cwBuffer.fill(1.0);
    }

    /**
     * Override this
     */
    getProperties(): Properties {
        return {
            name: 'mode',
            description: 'Base mode class.  Please override this method',
            tooltip: 'Base mode class.  Please override this method',
            controls: []
        };
    }

    set frequency(freq: number) {
        this._frequency = freq;
        this._nco.setFrequency(freq);
        this._txNco.setFrequency(freq);
        this._afc.adjust();
    }

    get frequency(): number {
        return this._frequency;
    }

    get bandwidth() {
        return 0;
    }

    setupAfc() {
        let a = new Afc();
        let afcFilter = Biquad.lowPass(1.0, 100.0);
        let loBin, freqBin, hiBin;
        a.adjust = () => {
            let freq = this._frequency;
            let fs = this.par.sampleRate;
            let bw = this.bandwidth;
            let binWidth = fs * 0.5 / Constants.BINS;
            loBin = Math.round((freq - bw) / binWidth);
            freqBin = Math.round(freq / binWidth);
            hiBin = Math.round((freq + bw) / binWidth);
        };
        a.compute = (ps: number[]) => {
            let sum = 0;
            let sumScale = 0;
            for (let i = loBin, j = freqBin + 1; i < freqBin; i++, j++) {
                sum += ps[j] - ps[i];
                sumScale += ps[j] + ps[i];
            }
            let normalized = sum / sumScale;
            this.frequency -= normalized;
        };
        this._afc = a;
    }

    get useAfc(): boolean {
        return this._useAfc;
    }

    set useAfc(v: boolean) {
        this._useAfc = v;
    }

    status(msg) {
        this.par.status(this.getProperties().name + ' : ' + msg);
    }

    /**
     * There is a known bug in Typescript that will not allow
     * calling a super property setter.  The work around is to delegate
     * the setting to s parent class method, and override that.  This
     * works in ES6.
     */
    _setRate(v: number) {
        this._rate = v;
        this._afc.adjust();
        console.log('Fs: ' + this.par.sampleRate + ' rate: ' + v +
            ' sps: ' + this.samplesPerSymbol);
    }

    set rate(v: number) {
        this._setRate(v);
    }

    get rate(): number {
        return this._rate;
    }


    get samplesPerSymbol(): number {
        return this.par.sampleRate / this._rate;
    }


    // #######################
    // # R E C E I V E
    // #######################

    receiveFft(ps: number[]): void {
        if (this._useAfc) {
            this._afc.compute(ps);
        }
    }

    receiveData(data: number[]): void {
        let len = data.length;
        for (let i=0 ; i < len ; i++) {
          let v = data[i];
          let cs = this._nco.next();
          this.receive({ r: v * cs.r, i: -v * cs.i });
        }
    }

    /**
     * Overload this for each mode.
     */
    receive(v: Complex): void {
    }

    // #######################
    // # T R A N S M I T
    // #######################

    txStart(): Promise<boolean> {
      return Promise.resolve(true);
    }

    txStop(): Promise<boolean> {
      return Promise.resolve(true);
    }

    getTransmitData(): number[] {
        let abs = Math.hypot;
        let baseBand = this.getBasebandData();
        let xs = this._txNco.mixBuf(baseBand);
        return xs;
    }

    /**
     * Override this for each mode
     * Retrieve a buffer of baseband-modlated data
     * (or idle tones) from each band
     */
    getBasebandData(): number[] {
      return this._cwBuffer; //default to cw tone
    }

}
