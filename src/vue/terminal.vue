<template>
  <textarea class='terminal' rows='4'></textarea>
</template>

<script>

import {Digi, Terminal} from '../lib/digi';

/**
 * @param digi instance of parent {Digi}
 * @param txt {HTMLTextAreaElement}
 */
function setupTerminal(digi, txt) {

  let textWidget = {
      clear : () => {
        txt.value = "";
      },
      putText : (str) => {
        let s = txt.value
        txt.value = s + str;
        txt.scrollTop = txt.scrollHeight;
      },
      getText : () => {
        return txt.value
      }
  };
  digi.terminal = textWidget;
}

export default {
  name: 'terminal',
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    setupTerminal(this.digi, elem);
  }
}

</script>

<style>
.terminal {
  background: #aaffaa;
  height: 55%;
  width: 100%;
}
</style>
