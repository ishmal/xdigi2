<template>
  <canvas class='tuner' width='1024' height='150'></canvas>
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
.tuner {
  height: 25%;
}
</style>
