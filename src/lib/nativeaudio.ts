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


/* global window, navigator*/
/* jslint node: true */


import {Digi} from './digi';
import {Resampler} from './resample';
import {AudioInput, AudioOutput} from './audio';


export class NativeAudioInput extends AudioInput {


    constructor(par: Digi) {
        super(par);
    }

    start(): boolean {
        return true;
    }

    stop(): boolean {
        return true;
    }


}

export class NativeAudioOutput extends AudioOutput {


    constructor(par: Digi) {
        super(par);
    }

    start(): boolean {
        return true;
    }

    stop(): boolean {
        return true;
    }

}
