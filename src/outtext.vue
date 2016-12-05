<template>
  <textarea class='outtext' rows='5'></textarea>
</template>

<script>

import {OutText} from './lib/digi';

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    let outtext = new OutText(this.digi, elem);
    this.digi.outtext = outtext;
  }
}

</script>

<style>

.outtext {
  background: #aaaaff;
  height: 30%;
}

</style>
