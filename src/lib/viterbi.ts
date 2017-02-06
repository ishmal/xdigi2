
const PATHMEM = 256;


/*
 * Hamming weight (number of bits that are ones).
 */
function hweight32(w: number): number {
    w = (w & 0x55555555) + ((w >> 1) & 0x55555555);
    w = (w & 0x33333333) + ((w >> 2) & 0x33333333);
    w = (w & 0x0F0F0F0F) + ((w >> 4) & 0x0F0F0F0F);
    w = (w & 0x00FF00FF) + ((w >> 8) & 0x00FF00FF);
    w = (w & 0x0000FFFF) + ((w >> 16) & 0x0000FFFF);
    return w;
}

/*
 * Parity function. Return one if `w' has odd number of ones, zero otherwise.
 */

function parity(w: number): number {
    return hweight32(w) & 1;
}


export class Viterbi {

    outsize: number;
    nstates: number;
    _k: number;
    _traceback: number;
    _chunksize: number;
    _poly1: number;
    _poly2: number;
    output: number[];
    metrics: number[][];
    metric: number;
    history: number[][];
    mettab: number[][];
    sequence: number[];
    ptr: number;


    constructor(k: number, poly1: number, poly2: number) {
        this.outsize = 1 << k;
        this.nstates = 1 << (k - 1);
        this._k = k;
        this._poly1 = poly1;
        this._poly2 = poly2;

        this.output = new Array(this.outsize).fill(0);
        this.metrics = [];
        this.history = [];
        for (let i = 0; i < PATHMEM; i++) {
            this.metrics[i] = new Array(this.nstates).fill(0);
            this.history[i] = new Array(this.nstates).fill(0);
        }
        this.metric = 0;
        this.init();
    }

    init() {
        let mettab = this.mettab;
        this._traceback = this._k * 12; // takes >= 12 constraint lengths to calculate from an arbitrary state, when punctured
        this._chunksize = 8;

        for (let i = 0; i < this.outsize; i++) {
            this.output[i] = parity(this._poly1 & i) | (parity(this._poly2 & i) << 1);
        }

        mettab[0] = [];
        mettab[1] = [];
        for (let i = 0; i < 256; i++) {
            mettab[0][i] = 128 - i;
            mettab[1][i] = i - 128;
        }

        this.sequence = new Array(PATHMEM).fill(0);
        this.reset();
    }


    reset() {
        for (let i = 0; i < PATHMEM; i++) {
            this.metrics[i] = new Array(this.nstates).fill(0);
            this.history[i] = new Array(this.nstates).fill(0);
        }
        this.ptr = 0;
    }

    settraceback(trace: number) {
        if (trace < 0 || trace > PATHMEM - 1)
            return -1;
        this._traceback = trace;
        return 0;
    }

    setchunksize(chunk: number) {
        if (chunk < 1 || chunk > this._traceback)
            return -1;
        this._chunksize = chunk;
        return 0;
    }

    traceback(metric: number): number {

        let c = 0;

        let p = (this.ptr - 1) % PATHMEM;

        // Find the state with the best metric
        let bestmetric = Number.MIN_VALUE;
        let beststate = 0;

        let metrics = this.metrics;
        for (let i = 0, len = this.nstates; i < len; i++) {
            if (metrics[p][i] > bestmetric) {
                bestmetric = metrics[p][i];
                beststate = i;
            }
        }

        // Trace back 'traceback' steps, starting from the best state
        let sequence = this.sequence;
        this.sequence[p] = beststate;

        for (let i = 0; i < this._traceback; i++) {
            let prev = (p - 1) % PATHMEM;

            sequence[prev] = history[p][sequence[p]];
            p = prev;
        }

        if (metric) {
            metric = metrics[p][sequence[p]];
        }

        // Decode 'chunksize' bits
        for (let i = 0; i < this._chunksize; i++) {
            // low bit of state is the previous input bit
            c = (c << 1) | (sequence[p] & 1);
            p = (p + 1) % PATHMEM;
        }

        if (metric) {
            metric = metrics[p][sequence[p]] - metric;
        }

        return c;
    }

    decode(sym: string) {

        let currptr = this.ptr;
        let prevptr = (currptr - 1) % PATHMEM;
        //	if (prevptr < 0) prevptr = PATHMEM - 1;

        let met = [];
        let mettab = this.mettab;
        met[0] = mettab[0][sym[1]] + mettab[0][sym[0]];
        met[1] = mettab[0][sym[1]] + mettab[1][sym[0]];
        met[2] = mettab[1][sym[1]] + mettab[0][sym[0]];
        met[3] = mettab[1][sym[1]] + mettab[1][sym[0]];

        //	met[0] = 256 - sym[1] - sym[0];
        //	met[1] = sym[0] - sym[1];
        //	met[2] = sym[1] - sym[0];
        //	met[3] = sym[0] + sym[1] - 256;

        for (let n = 0, count = this.nstates; n < count; n++) {

            let s0 = n;
            let s1 = n + this.nstates;

            let p0 = s0 >> 1;
            let p1 = s1 >> 1;

            let m0 = this.metrics[prevptr][p0] + met[this.output[s0]];
            let m1 = this.metrics[prevptr][p1] + met[this.output[s1]];

            if (m0 > m1) {
                this.metrics[currptr][n] = m0;
                this.history[currptr][n] = p0;
            } else {
                this.metrics[currptr][n] = m1;
                this.history[currptr][n] = p1;
            }
        }

        this.ptr = (this.ptr + 1) % PATHMEM;

        if ((this.ptr % this._chunksize) == 0)
            return this.traceback(this.metrics);

        let INT_MIN = Math.round(Number.MIN_SAFE_INTEGER)
        if (this.metrics[currptr][0] > Number.MAX_SAFE_INTEGER / 2) {
            for (let i = 0; i < PATHMEM; i++)
                for (let j = 0; j < this.nstates; j++)
                    this.metrics[i][j] -= Number.MAX_SAFE_INTEGER / 2;
        }

        if (this.metrics[currptr][0] < Number.MIN_SAFE_INTEGER / 2) {
            for (let i = 0; i < PATHMEM; i++)
                for (let j = 0; j < this.nstates; j++)
                    this.metrics[i][j] += Number.MIN_SAFE_INTEGER / 2;
        }

        return -1;
    }

}



export class Encoder {

    output: number[];
    _k: number;
    _poly1: number;
    _poly2: number;
    shreg: number;
    shregmask: number;

    constructor(k: number, poly1: number, poly2: number) {
        let size = 1 << k;	/* size of the output table */
        this.output = new Array(size);
        this._k = k;
        this._poly1 = poly1;
        this._poly2 = poly2;
        this.init();
    }


    encode(bit: number): number {
        this.shreg = (this.shreg << 1) | bit;
        return this.output[this.shreg & this.shregmask];
    }

    init() {
        let size = 1 << this._k;	/* size of the output table */

        /**
               * output contains 2 bits in positions 0 and 1 describing the state machine
               * for each bit delay, ie: for k = 7 there are 128 possible state pairs.
               * the modulo-2 addition for polynomial 1 is in bit 0
               * the modulo-2 addition for polynomial 2 is in bit 1
               * the allowable state outputs are 0, 1, 2 and 3
         */
        for (let i = 0; i < size; i++) {
            this.output[i] = parity(this._poly1 & i) | (parity(this._poly2 & i) << 1);
        }
        this.shreg = 0;
        this.shregmask = size - 1;
    }


}
