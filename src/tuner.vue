<template>
  <canvas width='600' height='200'></canvas>
</template>

<script>

export default {
  props: ['digi'],
  mounted: function() {
    let elem = this.el;
    let tuner = new TunerImpl(digi, elem);
    digi.tuner = tuner;
  }
}

</script>

</style>



</style>
