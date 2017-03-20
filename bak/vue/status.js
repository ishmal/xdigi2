
import {Digi, OutText} from '../lib/digi';
import Vue from 'vue';


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

Vue.component('status', {
  template: `
    <textarea readonly class='status' rows='3'></textarea>
  `,
  props: ['digi'],
  mounted: function() {
    let elem = this.$el;
    setupStatus(this.digi, elem);
  }
});
