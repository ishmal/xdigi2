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
'use strict';

import {Complex} from './complex';

function createCossinTable(): Complex[] {
    let twopi = Math.PI * 2.0;
    let two16 = 65536;
    let delta = twopi / two16;
    let xs = new Array(two16);
    let angle = 0;

    for (let idx = 0; idx < two16; idx++) {
        xs[idx] = { r: Math.cos(angle), i: Math.sin(angle) };
        angle += delta;
    }
    return xs;
}

const ncoTable = createCossinTable();

export interface Nco {
    setFrequency(v: number): void;
    setError(v: number): void;
    next(): Complex;
    mixNext(v: number): Complex;
    mixBuf(inb: number[]): number[];
}

/**
 * A sine generator with a 31-bit accumulator and a 16-bit
 * lookup table.  Much faster than Math.whatever
 */
export function NcoCreate(frequency, sampleRate): Nco {

    const TWO32 = 4294967296.0;
    let hzToInt = TWO32 / sampleRate;
    let freq = 0 | 0;
    let phase = 0 | 0;
    let table = ncoTable;
    let err = 0;
    let maxErr = (50 * hzToInt) | 0;  // in hertz
    console.log('NCO maxErr: ' + maxErr);
    let minErr = -(50 * hzToInt) | 0;  // in hertz
    setFrequency(frequency);

    function setFrequency(v: number): void {
        freq = (v * hzToInt) | 0;
    }


    function setError(v: number): void {
        err = (err * 0.9 + v * 100000.0) | 0;
        // console.log('err:' + err + '  v:' + v);
        if (err > maxErr) {
            err = maxErr;
        } else if (err < minErr) {
            err = minErr;
        }
    }

    function next(): Complex {
        phase += freq + err;
        return table[phase >>> 16];
    }

    function mixNext(v: number): Complex {
        phase += freq + err;
        let cs = table[phase >>> 16];
        return { r: v * cs.r, i: -v * cs.i };
    }

    function mixBuf(inb: number[]): number[] {
        let len = inb.length;
        let xs = new Array(len);
        for (let i=0 ; i < len ; i++) {
          let v = inb[i];
          phase += freq + err;
          let cs = table[phase >>> 16];
          xs[i] = v * cs.r - v * cs.i;
        }
        return xs;
    }

    return {
        setFrequency: setFrequency,
        setError: setError,
        next: next,
        mixNext: mixNext,
        mixBuf: mixBuf
    };
}

/**
 * A simpler Nco for transmitting, etc
 */
export function NcoCreateSimple(frequency, sampleRate): Nco {

    const TWO32 = 4294967296.0;
    let hzToInt = TWO32 / sampleRate;
    let freq = 0 | 0;
    let phase = 0 | 0;
    let table = ncoTable;
    setFrequency(frequency);

    function setFrequency(v: number): void {
        freq = (v * hzToInt) | 0;
    }

    function setError(v: number): void {
    }

    function next(): Complex {
        phase += freq;
        return table[phase >>> 16];
    }

    function mixNext(v: number): Complex {
        phase += freq;
        let cs = table[phase >>> 16];
        return { r: v * cs.r, i: -v * cs.i };
    }

    function mixBuf(inb: number[]): number[] {
        let len = inb.length;
        let xs = new Array(len);
        for (let i=0 ; i < len ; i++) {
          let v = inb[i];
          phase += freq;
          let cs = table[phase >>> 16];
          xs[i] = v * cs.r - v * cs.i;
        }
        return xs;
    }


    return {
        setFrequency: setFrequency,
        setError: setError,
        next: next,
        mixNext: mixNext,
        mixBuf: mixBuf
    };
}
