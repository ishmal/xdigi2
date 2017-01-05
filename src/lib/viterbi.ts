
const PATHMEM = 256;


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
    history: number[][];
    ptr: number;


constructor(k: number, poly1: number, poly2: number) {
	this.outsize = 1 << k;
	this.nstates = 1 << (k - 1);
	this._k = k;
	this._poly1 = poly1;
	this._poly2 = poly2;

    this.output = new Array(this.outsize);
    this.metrics = [];
    this.history = [];
	for (let i = 0; i < PATHMEM; i++) {
        this.metrics[i] = new Array(this.nstates);
		this.history[i] =  new Array(this.nstates);
	}

	this.init();
}



init() {

		this._traceback = this._k * 12; // takes >= 12 constraint lengths to calculate from an arbitrary state, when punctured
		this._chunksize = 8;

		for (let i = 0; i < this.outsize; i++) {
			this.output[i] = parity(this._poly1 & i) | (parity(this._poly2 & i) << 1);
		}

		for (let i = 0; i < 256; i++) {
			mettab[0][i] = 128 - i;
			mettab[1][i] = i - 128;
		}

		memset(sequence, 0, sizeof(sequence));

		this.reset();

}


reset() {
	for (let i = 0; i < PATHMEM; i++) {
		memset(metrics[i], 0, nstates * sizeof(int));
		memset(history[i], 0, nstates * sizeof(int));
	}
	this.ptr = 0;
}

settraceback(trace: number) {
	if (trace < 0 || trace > PATHMEM - 1)
		return -1;
	_traceback = trace;
	return 0;
}

setchunksize(chunk: number) {
	if (chunk < 1 || chunk > _traceback)
		return -1;
	_chunksize = chunk;
	return 0;
}

traceback(int *metric): number {
	int bestmetric, beststate;
	unsigned int p, c = 0;

	p = (ptr - 1) % PATHMEM;

	// Find the state with the best metric
	bestmetric = INT_MIN;
	beststate = 0;

	for (int i = 0; i < nstates; i++) {
		if (metrics[p][i] > bestmetric) {
			bestmetric = metrics[p][i];
			beststate = i;
		}
	}

	// Trace back 'traceback' steps, starting from the best state
	sequence[p] = beststate;

	for (int i = 0; i < _traceback; i++) {
		unsigned int prev = (p - 1) % PATHMEM;

		sequence[prev] = history[p][sequence[p]];
		p = prev;
	}

	if (metric)
		*metric = metrics[p][sequence[p]];

	// Decode 'chunksize' bits
	for (int i = 0; i < _chunksize; i++) {
		// low bit of state is the previous input bit
		c = (c << 1) | (sequence[p] & 1);
		p = (p + 1) % PATHMEM;
	}

	if (metric)
		*metric = metrics[p][sequence[p]] - *metric;

	return c;
}

decode(unsigned char *sym, int *metric) {
	unsigned int currptr, prevptr;
	int met[4];

	currptr = ptr;
	prevptr = (currptr - 1) % PATHMEM;
	//	if (prevptr < 0) prevptr = PATHMEM - 1;

	met[0] = mettab[0][sym[1]] + mettab[0][sym[0]];
	met[1] = mettab[0][sym[1]] + mettab[1][sym[0]];
	met[2] = mettab[1][sym[1]] + mettab[0][sym[0]];
	met[3] = mettab[1][sym[1]] + mettab[1][sym[0]];

	//	met[0] = 256 - sym[1] - sym[0];
	//	met[1] = sym[0] - sym[1];
	//	met[2] = sym[1] - sym[0];
	//	met[3] = sym[0] + sym[1] - 256;

	for (int n = 0; n < nstates; n++) {
		int p0, p1, s0, s1, m0, m1;

		m0 = 0;
		m1 = 0;
		s0 = n;
		s1 = n + nstates;

		p0 = s0 >> 1;
		p1 = s1 >> 1;

		m0 = metrics[prevptr][p0] + met[output[s0]];
		m1 = metrics[prevptr][p1] + met[output[s1]];

		if (m0 > m1) {
			metrics[currptr][n] = m0;
			history[currptr][n] = p0;
		} else {
			metrics[currptr][n] = m1;
			history[currptr][n] = p1;
		}
	}

	ptr = (ptr + 1) % PATHMEM;

	if ((ptr % _chunksize) == 0)
		return traceback(metric);

	if (metrics[currptr][0] > INT_MAX / 2) {
		for (int i = 0; i < PATHMEM; i++)
			for (int j = 0; j < nstates; j++)
				metrics[i][j] -= INT_MAX / 2;
	}

	if (metrics[currptr][0] < INT_MIN / 2) {
		for (int i = 0; i < PATHMEM; i++)
			for (int j = 0; j < nstates; j++)
				metrics[i][j] += INT_MIN / 2;
	}

	return -1;
}

}



export class Encoder {

    output: number[];
    k: number;
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
	this.shreg = (this.shreg << 1) | !!bit;
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
