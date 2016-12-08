<template>
  <textarea readonly class='status' rows='3'></textarea>
</template>

<script>

import {Digi, OutText} from './lib/digi';

function setupStatus(digi: Digi, text: HTMLTextAreaElement) {
  let textWidget = {
      clear : () => {
        text.textContent = "";
      },
      putText : (str: string) => {
        text.textContent += '\n';
        text.textContent += str;
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
