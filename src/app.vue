<template>

<div>

  <nav class="row navbar navbar-light bg-faded">

    <a class="col-xs-3 navbar-brand octicon octicon.radio-tower"
     :class='{"txon" : digi.isRunning, "txoff": !digi.isRunning }'
     v-on:click='digi.onOffToggle()' href="#">Xdigi</a>

    <select class='col-xs-3' v-model='digi.mode'>
        <option v-for="m in digi.modes" :value="m">{{ m._properties.name }}</option>
    </select>

    <button class='col-xs-3 octicon octicon.broadcast'
      :class='{"txon" : digi.txMode, "txoff": !digi.txMode }'
      v-on:click='digi.txModeToggle()'></button>

  </nav>

  <tuner class='col-xs-12' :digi='digi'></tuner>
</div>

</template>

<script>

import {Digi} from './lib/digi';
declare var require: any;
var tuner = require('./tuner.vue').default;

const digi = new Digi();

export default {
  components: {
    tuner
  },
  data() {
    return {
      digi: digi
    };
  }
}
</script>

<style>

  .txon {
      color: red
  }
  .txoff {
    color: green
  }

</style>
