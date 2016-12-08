<template>
  <textarea class='terminal' rows='4'></textarea>
</template>

<script>

import {Terminal} from './lib/digi';

function setupTerminal(digi: Digi, txt: HTMLTextAreaElement) {

  let textWidget = {
      clear : () => {
        txt.value = "";
      },
      putText : (str: string) => {
        let s = txt.value
        txt.value = s + str;
        txt.scrollTop = txt.scrollHeight;
      },
      getText : ():string => {
        return txt.value
      }
  };
  digi.terminal = textWidget;
}



export default {
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
}
</style>
