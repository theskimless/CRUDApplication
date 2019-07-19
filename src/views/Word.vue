<template>
  <div class="popup-wrapper block block_styled">
    <div class="popup-close" @click="close"></div>
    <div class="word-type">{{types[wordObj.type]}}</div>
    <div class="form-title">{{wordObj.word}}</div>
    
    <div class="word-block"><div v-for="(def, key) in wordObj.definitions"><b>{{key+1}}:</b> {{def}}</div></div>
    <div class="word-block"><div class="example" v-for="ex in wordObj.examples">{{ex}}</div></div>

    <div class="want-to-learn-wrap"><button type="button" class="form-btn form-btn_style" @click="">Want to learn!</button></div>
  </div>  
</template>

<script>
  import {types} from "../js/main";

  export default {
    props: ["wordObj"],
    data() {
      return {
        types: types
      }
    },
    methods: {
      close() {
        this.$emit("on-close");
      }
    }
  }
</script>


<style lang="scss" scoped>
  @import "../scss/partials/_vars";
  .popup-wrapper {
    max-width: 600px;
  }
  .word-type {
    text-align: center;
    text-transform: uppercase;
    color: #666;
    font-size: .8rem;
  }
  .example {
    background: url(../imgs/two-quotes.svg) 0 9px no-repeat;
    background-size: 13px;
    padding-left: 20px;
  }
  .word-block {
    margin-top: 20px;
  }
  .want-to-learn-wrap {
    margin-top: 15px;
  }
</style>
