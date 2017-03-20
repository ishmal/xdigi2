/**
 * Xdigi
 *
 * Copyright 2017, Bob Jamison
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
import {FFT, FFTSR} from './fft';
import {AudioInput, AudioOutput, AudioFactory} from './audio';
import {Mode} from './mode/mode';
import {PskMode} from './mode/psk';
import {RttyMode} from './mode/rtty';
import {PacketMode} from './mode/packet';
import {NavtexMode} from './mode/navtex';
import {Watcher} from './watch';
import {Tuner, TunerBase} from './tuner';


/**
 * Interface for a text output widget, which the UI should overload
 */
export class OutText {

    /**
     * @param par parent instance of a Digi
     * @param elem {HTMLElement}
     */
    constructor(par, elem) {

    }

    /**
     *
     */
    clear() {

    }

    /**
     *
     */
    putText(str) {

    }
}

/**
 * Interface for a text input/output widget, which the UI should overload
 */
export class Terminal {

   /**
    * @param par instance of parent Digi
    * @param elem {HTMLElement}
    */
   constructor(par, elem) {
   }

    /**
     *
     */
    clear() {

    }

    /**
     * @param str {string}
     */
    putText(str) {

    }

    /**
     * @return {string}
     */
    getText() {
        return '';
    }

}


/**
 * This is the top-level GUI-less app.  Extend this with a GUI.
 */
export class Digi {

    /**
    _isRunning: boolean;
    _audioInput: AudioInput;
    _audioOutput: AudioOutput;
    _watcher: Watcher;
    _txmode: boolean;
    pskMode: Mode;
    rttyMode: Mode;
    packetMode: Mode;
    navtexMode: Mode;
    _mode: Mode;
    _modes: Mode[];
    _tuner: Tuner;
    _terminal: Terminal;
    _stattext: OutText;
    _fft:  FFT;
    */

    /**
     * @param canvas {HTMLCanvasElement} optional
     */
    constructor(canvas) {
        this.isRunning = false;
        this._audioInput = AudioFactory.getInput(this);
        this._audioOutput = AudioFactory.getOutput(this);
        this._watcher = new Watcher(this);
        this._txmode = false;
        /**
         * Add our modes here and set the default
         */
        this.pskMode = new PskMode(this);
        this.rttyMode = new RttyMode(this);
        this.packetMode = new PacketMode(this);
        this.navtexMode = new NavtexMode(this);
        this._mode = this.pskMode;
        this.modes = [
          this.pskMode,
          this.rttyMode,
          this.packetMode,
          this.navtexMode
        ];

        this.tuner = (canvas) ? new Tuner(this, canvas) : new TunerBase();
        this.terminal = {
          clear: () => { },
          putText: (string) => { },
          getText: () => { return ''; }
        };
        this.statText = { clear: () => { }, putText: (string) => { } };
        this._fft = FFTSR(Constants.FFT_SIZE, 800);
    }


    /**
     * @param data {number[]}
     */
    receive2(data) {
      this._mode.receiveData(data);
      this._fft.powerSpectrumStream(data, (psbuf) => {
        //this._tuner.update(psbuf);
        this._mode.receiveFft(psbuf);
      });
    }

    /**
     * @param data {number[]}
     */
    receive(data) {
      this._mode.receiveData(data);
      let psbuf = this._audioInput.getFftData();
        this._tuner.update(psbuf);
        //this.mode.receiveFft(psbuf);
    }

    /**
     * @param msg {string}
     */
    log(msg) {
        if (typeof console !== 'undefined') {
            console.log('Digi: ' + msg);
        }
    }

    /**
     * @param str {string}
     */
    trace(msg) {
        this.log('Digi: ' + msg);
    }

    /**
     * @param msg {string}
     */
    error(msg) {
        if (this.statText) {
            this.statText.putText(msg + "\n");
        } else {
            this.log('Digi error: ' + msg);
        }
    }

    /**
     * @param str {string}
     */
    status(str) {
        if (this.statText) {
            this.statText.putText(str + "\n");
        } else {
            this.log('status: ' + str);
        }
    }

    /**
     * @return {number}
     */
    get sampleRate() {
        return this._audioInput.sampleRate;
    }

    /**
     * @param v {Mode}
     */
    set mode(v) {
        this._mode = v;
        let name = v.getProperties().name;
        let fs = this.sampleRate.toFixed(1);
        let msg = `mode : ${name}  fs: ${fs}  rate: ${v.rate}`;
        this.status(msg);
    }

    /**
     * @return {Mode}
     */
    get mode() {
        return this._mode;
    }

    /**
     * @return {number}
     */
    get bandwidth() {
        return this._mode.bandwidth;
    }

    /**
     * @param freq {number}
     */
    set frequency(freq) {
        this._mode.frequency = freq;
    }

    /**
     * setting the frequency from UI
     * @param freq {number}
     */
    setFrequency(freq) {
      this.tuner.frequency = freq;
    }

    /**
     * @return {number}
     */
    get frequency() {
        return this._mode.frequency;
    }

    /**
     *
     */
    toggleUseAfc() {
        this._mode.useAfc = !this._mode.useAfc;
    }

    /**
     * @return {boolean}
     */
    get useAfc() {
        return this._mode.useAfc;
    }

    /**
     * @param v {number}
     */
    set useAfc(v) {
        this._mode.useAfc = v;
    }

    /**
     * @return {boolean}
     */
    get useQrz() {
        return this._watcher.useQrz;
    }

    /**
     * @param v {boolean}
     */
    set useQrz(v) {
        this._watcher.useQrz = v;
    }

    /**
     * @return {boolean}
     */
    get txMode() {
        return this._txmode;
    }

    /**
     * @param v {boolean}
     */
    set txMode(v) {
        this._txmode = v;
        if (v) {
            this._audioInput.stop();
            this._audioOutput.start();
        } else {
            this._audioOutput.stop();
            this._audioInput.start();
        }
    }

    /**
     *
     */
    txModeToggle() {
      this.txMode = !this.txMode;
    }

    /**
     * Override this in the GUI
     * @param data
     */
    showScope(data) {
        this._tuner.showScope(data);
    }

    /**
     * Output text to the gui
     * @param str {string}
     */
    putText(str) {
        this._terminal.putText(str);
        this._watcher.update(str);
    }

    /**
     * Input text from the gui
     * @return {string}
     */
    getText() {
        return this._terminal.getText();
    }

    /**
     *
     */
    clear() {
        this._terminal.clear();
    }


    /**
     * @return {number[]}
     */
    transmit() {
        return this._mode.getTransmitData();
    }

    /**
     *
     */
    onOffToggle() {
      if (this._isRunning) {
        this.stop();
      } else {
        this.start();
      }
    }

    /**
     *
     */
    start() {
		    this._audioInput.open();
		    this._audioOutput.open();
        this._isRunning = true;
    }

    /**
     *
     */
    stop() {
        this._audioInput.close();
        this._audioOutput.close();
        this._isRunning = false;
    }


} // Digi
