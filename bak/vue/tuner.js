import {Tuner} from '../lib/tuner';
import Vue from 'vue';

Vue.component('tuner', {
  template: `
  <div class='tuner'>
    <canvas class='tuner-canvas' width='1024' height='150'></canvas>
    <div class='row tuner-buttons'>
      <a class='col-xs-2 fa fa-2x' :class='useAfcClass' href='#' v-on:click='toggleUseAfc()'></a>
      <span class='col-xs-2'>{{ digi.frequency.toFixed(1) }}</span>
      <a class='col-xs-2' href='#' v-on:click='setTuningRate(1.0)'>1:1</a>
      <a class='col-xs-2' href='#' v-on:click='setTuningRate(0.5)'>1:2</a>
      <a class='col-xs-2' href='#' v-on:click='setTuningRate(0.1)'>1:10</a>
      <a class='col-xs-2' href='#' v-on:click='setTuningRate(0.01)'>1:100</a>
    </div>
  </div>
  `,
  props: ['digi'],
  mounted: function() {
    let elem = this.$el.children[0];
    let tuner = new Tuner(this.digi, elem);
    this.digi.tuner = tuner;
  },
  methods: {
    setTuningRate: function(rate) {
      this.digi.tuner.tuningRate = rate;
    },
    toggleUseAfc: function() {
      this.digi.toggleUseAfc();
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
});
