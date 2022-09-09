// Audio worklet processor for mic check
// source: https://www.webrtc-developers.com/how-to-know-if-my-microphone-works/#detect-noise-or-silence

const SMOOTHING_FACTOR = 0.99;
const SCALING_FACTOR = 5;

class MicCheckProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._volume = 0;
        this._micChecked = false;
        this.port.onmessage = (event) => {
            if (event.data && event.data.micChecked && event.data.micChecked == true) {
                this._micChecked = true;
            }
        }
    }

    process(inputs, outputs, params) { // eslint-disable-line no-unused-vars
        if (this._micChecked) {
            return false;
        } else {
            const input = inputs[0];
            const samples = input[0];
            const sumSquare = samples.reduce((p,c) => p + (c * c), 0);
            const rms = Math.sqrt(sumSquare / (samples.length || 1)) * SCALING_FACTOR;
            this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);
            this.port.postMessage({volume: this._volume});
            return true;
        }
    }
}

registerProcessor('mic-check-processor', MicCheckProcessor);