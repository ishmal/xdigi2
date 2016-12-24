<template>
  <textarea readonly class='status' rows='3'></textarea>
</template>

<script>

import {Digi, OutText} from './lib/digi';

function setupStatus(digi: Digi, txt: HTMLTextAreaElement) {
  let textWidget = {
      clear : () => {
        txt.value = "";
      },
      putText : (str: string) => {
        let s = txt.value
        txt.value = s + str;
        txt.scrollTop = txt.scrollHeight;
      }
  };
  digi.statText = textWidget;
}

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    setupStatus(this.digi, elem);
  }
}

</script>

<style>

.status {
  background: #aaaaaa;
  height: 10%;
}

</style>
