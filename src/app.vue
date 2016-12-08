<template>

<div class='app'>

  <nav class="appnav row navbar navbar-light bg-faded">

    <a class="navbar-brand"
     v-on:click='page="home"' href="#">Xdigi</a>

    <ul class='nav navbar-nav'>

    <li class='nav-item dropdown'>
      <select class='dropdown-toggle' v-model='digi.mode'>
        <option v-for="m in digi.modes" :value="m">{{ m.getProperties().name }}</option>
      </select>
    </li>

    <li class='nav-item'>
      <a class="nav-link fa fa-wrench" v-on:click='page="settings"' href="#"></a>
    </li>

    <li class='nav-item'>
      <a class="nav-link fa fa-pencil-square-o" v-on:click='page="prefs"' href="#"></a>
    </li>

    <li class='nav-item'>
      <a class="nav-link fa" :class='runningClass'
        v-on:click='digi.onOffToggle()' href="#"></a>
    </li>

    <li class='nav-item'>
      <a class='nav-link fa' :class='txClass'
        v-on:click='digi.txModeToggle()'></a>
    </li>

  </ul>

  </nav>

  <div v-if="page === 'settings'">
    <settings class='col-xs-12' :digi='digi'></settings>
  </div>
  <div v-else-if="page === 'prefs'">
    <prefs class='col-xs-12' :digi='digi' :config='config'></prefs>
  </div>
  <div v-else>
    <tuner class='col-xs-12' :digi='digi'></tuner>
    <status class='col-xs-12' :digi='digi'></status>
    <!--<outtext class='col-xs-12' :digi='digi'></outtext>-->
    <terminal class='col-xs-12' :digi='digi'></terminal>
  </div>

</div>

</template>

<script>

import {Digi} from './lib/digi';
declare var require: any;
const tuner = require('./tuner.vue').default;
const status = require('./status.vue').default;
const outtext = require('./outtext.vue').default;
const terminal = require('./terminal.vue').default;
const settings = require('./settings.vue').default;
const prefs = require('./prefs.vue').default;

const digi = new Digi();

function newConfig() {
  return {
    msg0: "",
    msg1: "",
    msg2: ""
  };
}
let config = newConfig();

let page = "home";

export default {
  components: {
    tuner,
    status,
    outtext,
    terminal,
    settings,
    prefs
  },

  data() {
    return {
      digi: digi,
      config: config,
      page: page
    };
  },

  created: function() {
    let str = localStorage.getItem('xdigi');
    if (!str) {
      Object.assign(config, newConfig());
    } else {
      Object.assign(config, JSON.parse(str));
    }
  },

  computed: {
    runningClass: function() {
      let isOn = digi.isRunning;
      return {
        "running" : isOn,
        "fa-microphone": isOn,
        "not-running": !isOn,
        "fa-microphone-slash": !isOn
      }
    },
    txClass: function() {
      let isOn = digi.txMode;
      return {
        "txon" : isOn,
        "fa-volume-up": isOn,
        "txoff": !isOn,
        "fa-volume-off":!isOn,
      }
    }
  }


}

</script>

<style>

  .app {
    height: 100%;
  }

  .appnav {
    height: 10%;
  }

  .running {
      color: red
  }
  .not-running {
    color: green
  }

  .txon {
      color: red;
  }
  .txoff {
    color: green;
  }

</style>
