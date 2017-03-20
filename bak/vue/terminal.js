
import {Digi, Terminal} from '../lib/digi';
import Vue from 'vue';

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

Vue.component('terminal', {
  template: `
    <textarea class='terminal' rows='4'></textarea>
  `,
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    setupTerminal(this.digi, elem);
  }
});
