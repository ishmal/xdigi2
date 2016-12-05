<template>
  <canvas width='600' height='200'></canvas>
</template>

<script>

import {TunerImpl} from './lib/tuner';

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    let tuner = new TunerImpl(this.digi, elem);
    this.digi.tuner = tuner;
  }
}

</script>

<style>

</style>
