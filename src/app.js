
import Vue from 'vue';

import MainApp from './vue/main.vue';

document.addEventListener("DOMContentLoaded", function() {

  new Vue({
    el: '#app',
    render: h => h(MainApp)
  });

});
