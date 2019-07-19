<template>
  <div class="popup-wrapper block block_styled">
    <div class="popup-close" @click="close"></div>
    <div class="form-title">{{listObj.name}}</div>
    <div class="list-words" v-for="word in listObj.words">
      <div class="list-type">{{types[words[word].type]}}</div>
      <div>{{words[word].word}}</div>
      <div>{{word.coeff}}</div>
    </div>
  </div>
</template>

<script>
import {types} from "../js/main";

export default {
  props: ["listObj", "words"],
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
  
</style>