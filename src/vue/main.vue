<template>
<div class='app'>

    <div class="appnav">

        <a class="home col-xs-2" v-on:click='page="home"' href="#">Xdigi</a>

        <select class='dropdown-toggle col-xs-2' v-model='digi.mode'>
          <option v-for="m in digi.modes" :value="m">{{ m.getProperties().name }}</option>
        </select>

        <a class="fa fa-2x fa-wrench col-xs-2" v-on:click='page="settings"' href="#"></a>

        <a class="fa fa-2x fa-pencil-square-o col-xs-2" v-on:click='page="prefs"' href="#"></a>

        <a class="fa fa-2x col-xs-2" :class='runningClass' v-on:click='digi.onOffToggle()' href="#"></a>

        <a class='fa fa-2x col-xs-2' :class='txClass' v-on:click='digi.txModeToggle()'></a>
    </div>

    <div v-show="page === 'settings'">
        <settings class='col-xs-12' :digi='digi'></settings>
    </div>
    <div v-show="page === 'prefs'">
        <prefs class='col-xs-12' :digi='digi' :config='config'></prefs>
    </div>
    <div v-show="page === 'home'">
        <tuner class='col-xs-12' :digi='digi'></tuner>
        <status class='col-xs-12' :digi='digi'></status>
        <!--<outtext class='col-xs-12' :digi='digi'></outtext>-->
        <terminal class='col-xs-12' :digi='digi'></terminal>
    </div>

    <div>
        <div v-for='a in alerts' class="alert alert-info" role="alert">{{ a.msg }}</div>
    </div>

</div>
</template>

<script>
import {Digi} from '../lib/digi';
import {AudioFactory} from '../lib/audio';
import prefs from './prefs.vue';
import settings from './settings.vue';
import status from './status.vue';
import terminal from './terminal.vue';
import tuner from './tuner.vue';

let digi = new Digi();

document.addEventListener('deviceready', function() {
    digi._audioInput = AudioFactory.getInput(digi);
});

function newConfig() {
    return {
        msg0: "",
        msg1: "",
        msg2: ""
    };
}
let config = newConfig();

let page = "home";

let alerts = [];

function alert(msg) {
    let alert = {
        type: 'alert-info',
        msg: msg
    };
    alerts.push(alert);
    setTimeout(function() {
        alerts = alerts.filter(function(a) {
            return (a !== alert);
        });
    }, 3000);
}


export default {
    name: 'main',
    components: {
        prefs,
        settings,
        status,
        terminal,
        tuner
    },

    data() {
        return {
            digi: digi,
            config: config,
            page: page,
            alerts: alerts
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

    methods: {
        exitApp: function() {
            if (navigator.app) {
                navigator.app.exitApp();
            }
        }
    },

    computed: {
        runningClass: function() {
            let isOn = digi.isRunning;
            return {
                "running": isOn,
                "fa-microphone": isOn,
                "not-running": !isOn,
                "fa-microphone-slash": !isOn
            }
        },
        txClass: function() {
            let isOn = digi.txMode;
            return {
                "txon": isOn,
                "fa-volume-up": isOn,
                "txoff": !isOn,
                "fa-volume-off": !isOn,
            }
        }
    }

}
</script>

<style>
.app {
    height: 100%;
    width: 100%;
    padding: 25px;
}

.appnav {
    height: 10%;
    width: 100%;
    background-color: #ccccff;
}

.home {
    font-size: larger;
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
