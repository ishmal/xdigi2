import Vue from 'vue';

Vue.component('prefs', {
  template: `
  <div>
    <div class='row'>
      <button v-on:click='save()'>Ok</button>
    </div>
    <div class='row'>
      <span class='col-xs-2'>Msg0</span>
      <textarea class='col-xs-10' v-model='config.msg0'></textarea>
    </div>
    <div class='row'>
      <span class='col-xs-2'>Msg1</span>
      <textarea class='col-xs-10' v-model='config.msg1'></textarea>
    </div>
    <div class='row'>
      <span class='col-xs-2'>Msg2</span>
      <textarea class='col-xs-10' v-model='config.msg2'></textarea>
    </div>
  </div>
  `,
  props: ['digi', 'config'],
  methods: {
    save: function() {
      let str = JSON.stringify(this.config);
      localStorage.setItem('xdigi', str);
    }
  }
});
