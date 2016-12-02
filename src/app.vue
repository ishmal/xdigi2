<template>
<div>
<h2 class='example'>Main : {{ msg }}</h2>
<tuner :digi='digi'></tuner>
</div>
</template>

<script>

import {Digi} from './lib/digi'

export default {
  let digi = new Digi();
  data: function () {
    return {
      digi: this.digi
    };
  }
}
</script>

<style>
.example {
  color: red;
}
</style>
