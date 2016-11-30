/**
 * Simple decimator / interpolator for a deeimation level of 7
 * Used for converting audio between 6-8khz to 44.1, 48, etc
 */
export class RS7 {

    decimate(inb: number[], outb: number[]) {
        let r0 = 0;
        let r1 = 0;
        let r2 = 0;
        let r3 = 0;
        let r4 = 0;
        let r5 = 0;
        let r6 = 0;
        let r7 = 0;
        let r8 = 0;
        let len = inb.length;
        let idx = 0;
        let outp = 0;
        for (let i=0 ; i < len ; i++) {
          // r0 = r1; // not used
          r1 = r2;
          r2 = r3;
          r3 = r4;
          r4 = r5;
          r5 = r6;
          r6 = r7;
          r7 = r8;
          r8 = inb[i];
          if (++idx >= 7) {
              idx = 0;
              outb[outp++] = r1 * 0.03499 + r2 * 0.11298 + r3 * 0.19817 + r4 * 0.24057 +
                  r5 * 0.19817 + r6 * 0.11298 + r7 * 0.03499;
              }
        }
    }


    interpolate(inb: number[], outb: number[]) {
        let r0 = 0;
        let r1 = 0;
        let r2 = 0;
        let len = inb.length;
        outb.fill(0);
        let outp = 0;
        for (let i=0 ; i < len ; i++) {
          //r0 = r1;
          //r1 = r2;
          r2 = inb[i];
          /*
          outb[outp++] = r1 * 0.03420 + r2 * -0.02115;
          outb[outp++] = r0 * 0.00079 + r1 * 0.13135 + r2 * -0.02904;
          outb[outp++] = r0 * 0.00278 + r1 * 0.22721 + r2 * -0.01341;
          outb[outp++] = r1 * 0.26740;
          outb[outp++] = r0 * -0.01341 + r1 * 0.22721 + r2 * 0.00278;
          outb[outp++] = r0 * -0.02904 + r1 * 0.13135 + r2 * 0.00079;
          outb[outp++] = r0 * -0.02115 + r1 * 0.03420;
          */
          /*
          outb[outp++] = r2 * 0.000282 + r1 * 0.036379 + r0 * -0.022555;
          outb[outp++] = r2 * 0.002250 + r1 * 0.139917 + r0 * -0.031411;
          outb[outp++] = r2 * 0.004274 + r1 * 0.242554 + r0 * -0.015080;
          outb[outp++] = r1 * -0.285714;
          outb[outp++] = r2 * -0.015080 + r1 * 0.242554 + r0 * 0.004274;
          outb[outp++] = r2 * -0.031411 + r1 * 0.139917 + r0 * 0.002250;
          outb[outp++] = r2 * -0.022555 + r1 * 0.036379 + r0 * 0.000282;
          */
          outb[outp] = r2;
          outp += 7;
        }
    }

}
