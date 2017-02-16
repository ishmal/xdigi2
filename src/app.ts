declare var require: any

import Vue = require('vue')
var App = require('./app.vue').default

document.addEventListener("DOMContentLoaded", function() {

  new Vue({
    el: '#app',
    components: { App },
    render: h => h('app')
  });

});
