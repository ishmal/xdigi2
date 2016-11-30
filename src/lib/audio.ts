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


/**
 * Base class for any audio input devices
 */
export class AudioInput {

    par: Digi;
    public sampleRate: number;
    public enabled: boolean;

    constructor(par: Digi) {
        this.par = par;
        this.sampleRate = 8000;
        this.enabled = true;
    }
    receive(data: number[]) {
        this.par.receive(data);
    }

		/**
		 * Called to connect with the device and start processing.
		 */
		open(): boolean {
			return true
		}

		/**
		 * Called to disconnect from input device and cease operations
		 */
		close(): boolean {
			return true;
		}

		/**
		 * Called to resume input processing
		 */
    start(): boolean {
        return true;
    }

		/**
		 * Called to pause input processing
		 */
    stop(): boolean {
        return true;
    }


}


/**
 * Base clase for any audio output devices.
 */
export class AudioOutput {

    par: Digi;
    public sampleRate: number;
    public enabled: boolean;

    constructor(par: Digi) {
        this.par = par;
        this.sampleRate = 8000;
        this.enabled = true;
    }

    transmit(): number[] {
        return this.par.transmit();
    }

		/**
		 * Called to connect with the device and start processing.
		 */
		open(): boolean {
			return true
		}

		/**
		 * Called to disconnect from input device and cease operations
		 */
		close(): boolean {
			return true;
		}

		/**
		 * Called to resume output processing
		 */
    start(): boolean {
        return true;
    }

		/**
		 * Called to pause output processing
		 */
    stop(): boolean {
        return true;
    }


}
