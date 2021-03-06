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
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
/* jslint node: true */

import {Complex} from './complex';
import {Biquad} from './filter';

function createCossinTable() {
    let twopi = Math.PI * 2.0;
    let two16 = 65536;
    let delta = twopi / two16;
    let xs = [];

    for (let idx = 0; idx < two16; idx++) {
        let angle = delta * idx;
        xs[idx] = {cos: Math.cos(angle), sin: Math.sin(angle)};
    }
    return xs;
}


const cossinTable = createCossinTable();


/**
 * @param frequency {number}
 * @param dataRate {number}
 * @param sampleRate {number}
 */
function Costas(frequency, dataRate, sampleRate) {
    let err = 0;
    let bw = 2.0 * Math.PI / 200;
    let damp = 0.707;
    let alpha = (4 * damp * bw) / (1 + 2 * damp * bw + bw * bw);
    let beta = (4 * bw * bw) / (1 + 2 * damp * bw + bw * bw);
    let freq0 = 0;
    let freq = 0;
    let minFreq = 0;
    let maxFreq = 0;
    let phase = 0;
    let twopi = 2.0 * Math.PI;
    let omega = twopi / sampleRate;
    let tabRate = 65536 / twopi;
    let counter = 0;

    let table = cossinTable;
    let ilp, qlp, dlp;
    let agcint1 = 0, agcint2 = 0;
    let agcgain = 0.001;

    function toRad(f) {
        return twopi * f / sampleRate;
    }

    function setFrequency(v) {
        freq0 = v * omega;
        freq = freq0;
        minFreq = freq0 - dataRate * omega;
        maxFreq = freq0 + dataRate * omega;
    }

    this.setFrequency = setFrequency;
    setFrequency(frequency);


    function setDataRate(rate) {
        ilp = Biquad.lowPass(rate * 0.5, sampleRate);
        qlp = Biquad.lowPass(rate * 0.5, sampleRate);
        dlp = Biquad.lowPass(rate * 4.0, sampleRate);
        minFreq = freq0 - dataRate * omega;
        maxFreq = freq0 + dataRate * omega;
    }

    this.setDataRate = setDataRate;
    setDataRate(dataRate);

    this.update = function (v) {
        v = v * agcint1;
        let agcerr = 1.0 - Math.abs(v);
        agcint2 = agcint1;
        agcint1 = agcint2 + agcgain * agcerr;

        freq = freq + beta * err;
        if (freq < minFreq) {
            freq = minFreq;
        } else if (freq > maxFreq) {
            freq = maxFreq;
        }
        phase = phase + freq + alpha * err;
        while (phase > twopi) {
          phase -= twopi;
        }
        let cs = table[(phase * tabRate) & 0xffff];
        let i = v * cs.cos;
        let q = v * cs.sin;
        let iz = ilp.update(i);
        let qz = qlp.update(q);
        // console.log('qz: ' + qz);
        let angle = -Math.atan2(qz, iz);
        err = dlp.update(angle);
        // console.log('' + iz + ' ' + qz + ' ' + angle + ' ' + err);
        // if (++counter % 10 === 0)
        //    plotter.update([iz, qz, angle, err, freq, minFreq, maxFreq]);
        // console.log('iq: ' + iz + ', ' + qz);
        return {r: iz, i: qz};
    };
}


export {Costas};
