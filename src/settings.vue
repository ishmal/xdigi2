<template>
  <div>

  <a href='#' :click='exitApp()'>Exit</a>

  <div class='settings-header row' >
    <div class='row'>
      <span class='col-xs-12'>{{ props.description }}</span>
    </div>
  </div>

  <div class='row' v-for='c in props.controls'>
    <span class='col-xs-2'>{{ c.name }}</span>
    <div class='col-xs-6' v-if='c.type==="choice"'>
      <select v-model='c.value'>
        <option v-for='(v, k) in c.options' :value='v'>{{ k }}</option>
      </select>
    </div>
    <div class='col-xs-6' v-else-if='c.type==="boolean"'>
      <input type="checkbox" v-model="c.value"/>
    </div>
  </div>
  </div>
</template>

<script>

import {OutText} from './lib/digi';

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    let outtext = new OutText(this.digi, elem);
    this.digi.outtext = outtext;
  },
  methods: {
    exitApp: function() {
      if (navigator.app) {
        navigator.app.exitApp();
      }
    }
  },
  data() {
    return {
      props: this.digi.mode.getProperties()
    };
  }

}

</script>

<style>

.settings-header {
  background: #aaaaff;
}

</style>
