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

/* global window, navigator*/
/* jslint node: true */

import {Digi} from './digi';
import {Resampler} from './resample';
import {Constants} from './constants';



//######################################################################
//# T Y P E S C R I P T    D E C L A R A T I O N S
//######################################################################

interface MediaStream {
    //id: string;
    // active: boolean;
}

interface MediaStreamAudioSourceNode extends AudioNode {

}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

interface AudioContext {
    new (): AudioContext;
    sampleRate: number;
    //state: string;
    close: () => void;
    createMediaStreamSource: (MediaStream) => MediaStreamAudioSourceNode;
    createMediaStreamDestination: () => any;
    createScriptProcessor: any;
    createBuffer: (channels:number, frames:number, sampleRate: number) => any;
    createBufferSource: () => any;
    createBiquadFilter: () => any;
    createAnalyser: () => any;
    destination: any;
    resume: () => void;
    suspend: () => void;
}

interface Window {
    AudioContext: AudioContext;
    webkitAudioContext: AudioContext;
    audioinput: any;
    addEventListener: any;
}

declare var window: Window;


interface ConstrainBooleanParameters {
    //exact?: boolean;
    //ideal?: boolean;
}

interface NumberRange {
    max?: number;
    min?: number;
}

interface ConstrainNumberRange extends NumberRange {
    exact?: number;
    ideal?: number;
}

interface ConstrainStringParameters {
    exact?: string | string[];
    ideal?: string | string[];
}

interface MediaStreamConstraints {
    //video?: boolean | MediaTrackConstraints;
    //audio?: boolean | MediaTrackConstraints;
}

declare module W3C {
    type LongRange = NumberRange;
    type DoubleRange = NumberRange;
    type ConstrainBoolean = boolean | ConstrainBooleanParameters;
    type ConstrainNumber = number | ConstrainNumberRange;
    type ConstrainLong = ConstrainNumber;
    type ConstrainDouble = ConstrainNumber;
    type ConstrainString = string | string[] | ConstrainStringParameters;
}

interface MediaTrackConstraints extends MediaTrackConstraintSet {
    //advanced?: MediaTrackConstraintSet[];
}

interface MediaTrackConstraintSet {
    //width?: W3C.ConstrainLong;
    //height?: W3C.ConstrainLong;
    //aspectRatio?: W3C.ConstrainDouble;
    //frameRate?: W3C.ConstrainDouble;
    //facingMode?: W3C.ConstrainString;
    //volume?: W3C.ConstrainDouble;
    //sampleRate?: W3C.ConstrainLong;
    //sampleSize?: W3C.ConstrainLong;
    echoCancellation?: W3C.ConstrainBoolean;
    latency?: W3C.ConstrainDouble;
    //deviceId?: W3C.ConstrainString;
    //groupId?: W3C.ConstrainString;
}

interface MediaTrackSupportedConstraints {
    //width?: boolean;
    //height?: boolean;
    //aspectRatio?: boolean;
    //frameRate?: boolean;
    //facingMode?: boolean;
    //volume?: boolean;
    //sampleRate?: boolean;
    //sampleSize?: boolean;
    //echoCancellation?: boolean;
    latency?: boolean;
    //deviceId?: boolean;
    //groupId?: boolean;
}

interface MediaStream extends EventTarget {
    //BOB id: string;
    //BOB active: boolean;

    //onactive: EventListener;
    //oninactive: EventListener;
    //onaddtrack: (event: MediaStreamTrackEvent) => any;
    //onremovetrack: (event: MediaStreamTrackEvent) => any;

    clone(): MediaStream;
    stop(): void;

    getAudioTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
    getTracks(): MediaStreamTrack[];

    getTrackById(trackId: string): MediaStreamTrack;

    addTrack(track: MediaStreamTrack): void;
    removeTrack(track: MediaStreamTrack): void;
}

interface MediaStreamTrackEvent extends Event {
    //track: MediaStreamTrack;
}

declare enum MediaStreamTrackState {
    "live",
    "ended"
}

interface MediaStreamTrack extends EventTarget {
    //id: string;
    //kind: string;
    //label: string;
    //enabled: boolean;
    //muted: boolean;
    //remote: boolean;
    //readyState: MediaStreamTrackState;

    //onmute: EventListener;
    //onunmute: EventListener;
    //onended: EventListener;
    //onoverconstrained: EventListener;

    clone(): MediaStreamTrack;

    stop(): void;

    getCapabilities(): MediaTrackCapabilities;
    getConstraints(): MediaTrackConstraints;
    getSettings(): MediaTrackSettings;
    applyConstraints(constraints: MediaTrackConstraints): Promise<void>;
}

interface MediaTrackCapabilities {
    //width: number | W3C.LongRange;
    //height: number | W3C.LongRange;
    //aspectRatio: number | W3C.DoubleRange;
    //frameRate: number | W3C.DoubleRange;
    //facingMode: string;
    //volume: number | W3C.DoubleRange;
    //sampleRate: number | W3C.LongRange;
    //sampleSize: number | W3C.LongRange;
    //echoCancellation: boolean[];
    latency: number | W3C.DoubleRange;
    //deviceId: string;
    //groupId: string;
}

interface MediaTrackSettings {
    //width: number;
    //height: number;
    //aspectRatio: number;
    //frameRate: number;
    //facingMode: string;
    //volume: number;
    //sampleRate: number;
    //sampleSize: number;
    //echoCancellation: boolean;
    latency: number;
    //deviceId: string;
    //groupId: string;
}

interface MediaStreamError {
    name: string;
    message: string;
    //constraintName: string;
}

interface NavigatorGetUserMedia {
    (constraints: MediaStreamConstraints,
        successCallback: (stream: MediaStream) => void,
        errorCallback: (error: MediaStreamError) => void): void;
}

interface Navigator {

    getUserMedia: NavigatorGetUserMedia;

    webkitGetUserMedia: NavigatorGetUserMedia;

    mozGetUserMedia: NavigatorGetUserMedia;

    msGetUserMedia: NavigatorGetUserMedia;

    mediaDevices: MediaDevices;
}
declare var navigator: Navigator;

interface MediaDevices {
    getSupportedConstraints(): MediaTrackSupportedConstraints;

    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
}

interface MediaDeviceInfo {
    //label: string;
    id: string;
    //kind: string;
    facing: string;
}

//######################################################################
// E N D    D E F I N I T I O N S
//######################################################################

//######################################################################
// A U D I O    I N P U T
//######################################################################

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

    getFftData(): Uint8Array {
        return new Uint8Array(0);
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

//######################################################################
// A U D I O    O U T P U T
//######################################################################

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

//######################################################################
//# W E B    A U D I O    I N P U T
//######################################################################




const AudioContext: AudioContext = window.AudioContext || window.webkitAudioContext;

navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;


export class WebAudioInput extends AudioInput {

    actx: AudioContext;
    decimation: number;
    source: MediaStreamAudioSourceNode;
    stream: MediaStream;
    inputNode: ScriptProcessorNode;
	isRunning: boolean;
    analyser: any;

    constructor(par: Digi) {
        super(par);
        this.par = par;
        this.actx = new AudioContext();
        this.decimation = 8;
        this.sampleRate = this.actx.sampleRate / this.decimation;
        this.source = null;
        this.stream = null;
        this.inputNode = null;
        this.isRunning = false;
        this.analyser = { // dummy until audio started
            getByteFrequencyData: function(d: Uint8Array) {
            }
        };
    }

    getFftData(): Uint8Array {
        let dataArray = new Uint8Array(Constants.BINS);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    setupSource() {
      let outBufSize = 1024;
      let outPtr = 0;
      let outCtr = 0;
      let outBuf = [];
      let bufferSize = 8192;
      //let decimator = Resampler.create(this.decimation);
      this.inputNode = this.actx.createScriptProcessor(bufferSize, 1, 1);
      this.inputNode.onaudioprocess = (e) => {
          if (!this.isRunning) {
              return;
          }
          let input = e.inputBuffer.getChannelData(0);
          let len = input.length;
          //let d = decimator;
          for (let i = 0; i < len; i++) {
              outCtr++;
              if (outCtr >= 8) {
                outBuf[outPtr++] = input[i];
                outCtr = 0;
                if (outPtr >= outBufSize) {
                  this.receive(outBuf)
                  outBuf = [];
                  outPtr = 0;
                }
              }
          }
      };

      this.analyser = this.actx.createAnalyser();
      this.analyser.fftSize = Constants.FFT_SIZE * this.decimation;
      this.source.connect(this.analyser);
      this.analyser.connect(this.inputNode);
      this.inputNode.connect(this.actx.destination);
      this.isRunning = true;
    }

    startStream(newstream: MediaStream) {
        this.stream = newstream;
        this.source = this.actx.createMediaStreamSource(newstream);
        this.setupSource();
    }

    open(): boolean {
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                { audio: true },
                stream => {
                    this.startStream(stream);
                },
                userMediaError => {
                    this.par.error(userMediaError.name + ' : ' + userMediaError.message);
                }
            );
        } else if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => this.startStream(stream))
                .catch(err => {
                    console.log('audioInput: ' + err);
                });
        }
        return true;
    }

    close(): boolean {
        this.isRunning = false;
        if (this.inputNode) {
          this.inputNode.disconnect();
        }
        return true;
    }

		start(): boolean {
			this.isRunning = true;
			return true;
		}

		stop() {
			this.isRunning = false;
			return true;
		}


}

//######################################################################
// C O R D O V A    A U D I O    I N P U T
//######################################################################

export class CordovaAudioInput extends AudioInput {

    audioInput: any;
		isRunning: boolean;

    constructor(par: Digi) {
        super(par);
        this.par = par;
        this.sampleRate = 8000;
        this.audioInput = null;
        this.isRunning = false;
        let that = this;
        window.addEventListener('audioinput', function(evt) {
          that.receive(evt.data);
        }, false);
        window.addEventListener('audioinputerror', function(error){
          console.log( "onAudioInputError event recieved: " + JSON.stringify(error) );
        }, false);
    }

    open(): boolean {
        //try cordova plugin first
        let audioInput = window.audioinput;
        if (!audioInput) {
          return;
        }
        try {
          this.audioInput = audioInput;
          if (!audioInput.isCapturing()) {
            audioInput.start({
                sampleRate: audioInput.SAMPLERATE.TELEPHONE_8000Hz
            });
            this.isRunning = true;
          }
        return true;
        } catch (ex) {
          console.log("open: " + ex);
          return false;
        }
    }

    close(): boolean {
        this.isRunning = false;
        this.audioInput.stop();
        return true;
    }

		start(): boolean {
			this.isRunning = true;
			return true;
		}

		stop() {
			this.isRunning = false;
			return true;
		}


}


//######################################################################
// W E B    A U D I O    O U T P U T
//######################################################################



/**
 * Getting this to work with interpolation isn't easy
 */
export class WebAudioOutput extends AudioOutput {

    actx: AudioContext;
    isRunning: boolean;
    source: any;
    lpf: any;

    constructor(par: Digi) {
        super(par);
        this.actx = new AudioContext();
        this.sampleRate = this.actx.sampleRate;
        this.isRunning = false;
        this.enabled = false;
    }

    open(): boolean {

        let that = this;
        let bufferSize = 4096;
        let decimation = 8;
        let iptr = 0;
        let ibuf = [];
        let ilen = 0;
				let outPtr = 0;
        this.source = this.actx.createScriptProcessor(bufferSize, 0, 1);
        this.source.onaudioprocess = (e) => {
					let outBuf = e.outputBuffer.getChannelData(0);
					let len = outBuf.length;
					outBuf.fill(0);
          if (!that.isRunning) {
                return;
            }
						while (outPtr < len) {
							if (iptr >= ilen) {
								ibuf = this.par.transmit();
								ilen = ibuf.length;
								iptr = 0;
							}
							outBuf[outPtr] = ibuf[iptr++];
							outPtr += decimation;
						}
						outPtr -= len;
        };

        //this.outputNode.connect(this.actx.destination);

				let lpf = this.actx.createBiquadFilter();
        lpf.type = "lowpass";
        lpf.frequency.value = 3000.0;
        lpf.gain.value = 5;
        lpf.Q.value = 20;
        this.source.connect(lpf);

        this.isRunning = false;  //by default
        return true;
    }


    close(): boolean {
        this.isRunning = false;
        if (this.source) {
          this.source.disconnect();
        }
        return true;
    }


		start(): boolean {
			this.isRunning = true;
			return true;
		}

		stop(): boolean {
			this.isRunning = false;
			return true;
		}


}



export class AudioFactory {

    static getInput(par: Digi): AudioInput {
            return new WebAudioInput(par);
    }

    static getOutput(par: Digi): AudioOutput {
            return new WebAudioOutput(par);
    }

}
