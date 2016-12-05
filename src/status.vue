<template>
  <textarea class='status' rows='10'></textarea>
</template>

<script>

import {OutText} from './lib/digi';

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    let outtext = new OutText(this.digi, elem);
    this.digi.statText = outtext;
  }
}

</script>

<style>

.status {
  background: #aaaaaa;
}

</style>
