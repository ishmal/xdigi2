<template>
  <div class='tuner'>
    <canvas class='tuner-canvas' width='1024' height='150'></canvas>
    <div class='row tuner-buttons'>
      <a class='col-xs-2 fa fa-2x fa-backward' href='#' v-on:click='fastDown()'></a>
      <a class='col-xs-2 fa fa-2x fa-step-backward' href='#' v-on:click='down()'></a>
      <span class='col-xs-1'></span>
      <a class='col-xs-2 fa fa-2x' :class='useAfcClass' href='#' v-on:click='toggleUseAfc()'></a>
      <span class='col-xs-1'></span>
      <a class='col-xs-2 fa fa-2x fa-step-forward' href='#' v-on:click='up()'></a>
      <a class='col-xs-2 fa fa-2x fa-forward' href='#' v-on:click='fastUp()'></a>
    </div>
  </div>
</template>

<script>

import {TunerImpl} from './lib/tuner';

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el.children[0];
    let tuner = new TunerImpl(this.digi, elem);
    this.digi.tuner = tuner;
  },
  methods: {
    fastDown: function() {
      this.digi.setFrequency(this.digi.frequency - 5);
    },
    down: function() {
      this.digi.setFrequency(this.digi.frequency - 1);
    },
    toggleUseAfc: function() {
      this.digi.toggleUseAfc();
    },
    up: function() {
      this.digi.setFrequency(this.digi.frequency + 1);
    },
    fastUp: function() {
      this.digi.setFrequency(this.digi.frequency + 5);
    }
  },
  computed: {
    useAfcClass: function() {
      let isOn = this.digi.useAfc;
      return {
        "running" : isOn,
        "fa-dot-circle-o": isOn,
        "not-running": !isOn,
        "fa-circle-o": !isOn
      }
    }
  }
}

</script>

<style>
.tuner {
  height: 25%;
}
.tuner-canvas {
  width: 100%;
  height: 80%;
}
.tuner-buttons {
  width: 100%;
  height: 20%;
}
</style>
