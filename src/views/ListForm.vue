<template>
  <div class="popup-wrapper block block_styled">
    <div class="popup-close" @click="close"></div>
    <div class="form-title">EDIT LIST</div>
    <div class="form-inp">
      <input type="text" v-model="listForm.name">
    </div>
    <div class="list-form-words" v-for="(word, key) in listForm.words">
      <div class="list-words">
        <div class="list-type">{{types[words[word].type]}}</div>
        <div>{{words[word].word}}</div>
      </div>
      <div>
          <button 
            type="button" 
            class="img-btn form-btn_style remove-img-btn" 
            @click="removeWord(key)"
          ></button>
      </div>
    </div>
    <div><button type="button" class="form-btn form-btn_style" @click="submit">Edit list</button></div>
  </div>
</template>

<script>
import {db} from "../js/firebase";
import {types} from "../js/main";

export default {
  props: ["listObj", "words", "uId"],
  data() {
    return {
      types: types,
      listForm: JSON.parse(JSON.stringify(this.listObj))
    }
  },
  methods: {
    close() {
      this.$emit("on-close");
    },
    removeWord(wordKey) {
      this.listForm.words.splice(wordKey, 1);
    },
    submit() {
      db.collection("users").doc(this.uId).collection("lists").doc(this.listForm.id)
        .update({
          words: this.listForm.words
        })
        .then(() => this.$emit("on-reload"))
        .catch(err => console.log(err));
    }
  }
}
</script>

<style lang="scss" scoped>
  .form-inp {
    margin-bottom: 15px;
  }
  .list-form-words {
    display: flex;
    justify-content: space-between;
  }
  .remove-img-btn {
    background: url(../imgs/minus-symbol.svg) center no-repeat;
  }
  .img-btn {
    border-color: #000;
    background-size: 20px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-left: 15px;
    flex-shrink: 0;
  }
</style>