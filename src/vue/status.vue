<template>
  <textarea readonly class='status' rows='3'></textarea>
</template>

<script>

import {Digi, OutText} from '../lib/digi';

/**
 * @param digi instance of parent {Digi}
 * @param txt {HTMLTextAreaElement}
 */
function setupStatus(digi, txt) {
  let textWidget = {
      clear : () => {
        txt.value = "";
      },
      putText : (str) => {
        let s = txt.value
        txt.value = s + str;
        txt.scrollTop = txt.scrollHeight;
      }
  };
  digi.statText = textWidget;
}

export default {
  name: 'status',
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
  width: 100%;
}

</style>
