<template>
<div>
<h2 class='example'>Main : {{ msg }}</h2>
<tuner></tuner>
</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>
