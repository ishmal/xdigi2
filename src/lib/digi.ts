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
import {FFT, FFTSR} from './fft';
import {AudioInput, AudioOutput, AudioFactory} from './audio';
import {Mode} from './mode/mode';
import {PskMode} from './mode/psk';
import {RttyMode} from './mode/rtty';
import {PacketMode} from './mode/packet';
import {NavtexMode} from './mode/navtex';
import {Watcher} from './watch';
import {Tuner, TunerImpl, TunerDummy} from './tuner';


/**
 * Interface for a text output widget, which the UI should overload
 */
export class OutText {

    constructor(par: Digi, elem: HTMLElement) {

    }

    clear(): void {

    }

    putText(str: string): void {

    }
}

/**
 * Interface for a text input/output widget, which the UI should overload
 */
export class Terminal {
    constructor(par: Digi, elem: HTMLElement) {

    }

    clear(): void {

    }

    putText(str: string): void {

    }
    getText(): string {
        return '';
    }

}


/**
 * This is the top-level GUI-less app.  Extend this with a GUI.
 */
export class Digi {

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


    constructor(canvas?: HTMLCanvasElement) {
        this._isRunning = false;
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
        this._modes = [this.pskMode, this.rttyMode, this.packetMode, this.navtexMode];

        this._tuner = (canvas) ? new TunerImpl(this, canvas) : new TunerDummy();
        this._terminal = {
          clear: () => { },
          putText: (string) => { },
          getText: () => { return ''; }
        };
        this._stattext = { clear: () => { }, putText: (string) => { } };
        this._fft = FFTSR(Constants.FFT_SIZE, 800);
    }


    receive2(data: number[]) {
      this._mode.receiveData(data);
      this._fft.powerSpectrumStream(data, (psbuf) => {
        //this._tuner.update(psbuf);
        this._mode.receiveFft(psbuf);
      });
    }

    receive(data: number[]) {
      this._mode.receiveData(data);
      let psbuf = this._audioInput.getFftData();
        this._tuner.update(psbuf);
        //this.mode.receiveFft(psbuf);
    }

    log(msg) {
        if (typeof console !== 'undefined') {
            console.log('Digi: ' + msg);
        }
    }

    trace(msg) {
        this.log('Digi: ' + msg);
    }

    error(msg) {
        if (this._stattext) {
            this._stattext.putText(msg + "\n");
        } else {
            this.log('Digi error: ' + msg);
        }
    }

    status(str) {
        if (this._stattext) {
            this._stattext.putText(str + "\n");
        } else {
            this.log('status: ' + str);
        }
    }

    get sampleRate() {
        return this._audioInput.sampleRate;
    }


    set mode(v: Mode) {
        this._mode = v;
        let name = v.getProperties().name;
        let fs = this.sampleRate.toFixed(1);
        let msg = `mode : ${name}  fs: ${fs}  rate: ${v.rate}`; 
        this.status(msg);
    }

    get mode(): Mode {
        return this._mode;
    }

    get modes(): Mode[] {
        return this._modes;
    }


    get bandwidth(): number {
        return this._mode.bandwidth;
    }

    set frequency(freq: number) {
        this._mode.frequency = freq;
    }

    //setting the frequency from UI
    setFrequency(freq: number) {
      this.tuner.frequency = freq;
    }

    get frequency(): number {
        return this._mode.frequency;
    }

    toggleUseAfc() {
        this._mode.useAfc = !this._mode.useAfc;
    }

    get useAfc(): boolean {
        return this._mode.useAfc;
    }

    set useAfc(v: boolean) {
        this._mode.useAfc = v;
    }

    get useQrz(): boolean {
        return this._watcher.useQrz;
    }

    set useQrz(v: boolean) {
        this._watcher.useQrz = v;
    }

    get txMode(): boolean {
        return this._txmode;
    }

    set txMode(v: boolean) {
        this._txmode = v;
        if (v) {
            this._audioInput.stop();
            this._audioOutput.start();
        } else {
            this._audioOutput.stop();
            this._audioInput.start();
        }
    }

    txModeToggle() {
      this.txMode = !this.txMode;
    }

    get tuner(): Tuner {
        return this._tuner;
    }

    set tuner(tuner: Tuner) {
        this._tuner = tuner;
    }

    /**
     * Override this in the GUI
     */
    showScope(data) {
        this._tuner.showScope(data);
    }

    /**
     * Make this an interface, so we can add things later.
     * Let the GUI override this.
     */
    get terminal(): Terminal {
        return this._terminal;
    }

    set terminal(val: Terminal) {
        this._terminal = val;
    }

    get statText(): OutText {
        return this._stattext;
    }

    set statText(v: OutText) {
        this._stattext = v;
    }

    /**
     * Output text to the gui
     */
    putText(str: string) {
        this._terminal.putText(str);
        this._watcher.update(str);
    }

    /**
     * Input text from the gui
     */
    getText(): string {
        return this._terminal.getText();
    }

    clear() {
        this._terminal.clear();
    }


    transmit(): number[] {
        return this._mode.getTransmitData();
    }

    get isRunning(): boolean {
      return this._isRunning;
    }

    onOffToggle() {
      if (this._isRunning) {
        this.stop();
      } else {
        this.start();
      }
    }

    start(): void {
		this._audioInput.open();
		this._audioOutput.open();
        this._isRunning = true;
    }

    stop(): void {
        this._audioInput.close();
        this._audioOutput.close();
        this._isRunning = false;
    }


} // Digi
