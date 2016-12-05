<template>
  <textarea class='terminal' rows='10'></textarea>
</template>

<script>

import {Terminal} from './lib/digi';

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    let term = new Terminal(this.digi, elem);
    this.digi.terminal = term;
  }
}

</script>

<style>
.terminal {
  background: #aaffaa;
}
</style>
