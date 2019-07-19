<template>
  <div class="popup-wrapper block block_styled">
    <div class="popup-close" @click="close"></div>
    <div class="form-title">{{formMode}} word</div>
    <div class="form-inp"><input type="text" placeholder="Type your word here" v-model="wordForm.word"></div>
    <div class="form-inp">
      <select v-model="wordForm.type">
        <option :value="key" v-for="(type, key) in types" :key="key">{{type}}</option>
      </select>
    </div>
    <div class="form-inp">
      <div>Definitions:</div>
      <div>
        <div class="form-inp-flex" v-for="(def, key) in wordForm.definitions" :key="key">
          <input type="text" v-model="wordForm.definitions[key]">
          <button 
            type="button" 
            class="img-btn form-btn_style" 
            :class="key === 0 ? 'add-img-btn' : 'remove-img-btn'" 
            @click="key === 0 ? addDefinition() : removeDefinition(key)"
          ></button>
        </div>
      </div>
    </div>
    <div class="form-inp">
      <div>Examples:</div>
      <div>
        <div class="form-inp-flex" v-for="(ex, key) in wordForm.examples" :key="key">
          <input type="text" v-model="wordForm.examples[key]">
          <button type="button" class="img-btn form-btn_style" 
            :class="key === 0 ? 'add-img-btn' : 'remove-img-btn'" 
            @click="key === 0 ? addExample() : removeExample(key)"
          ></button>
        </div>
      </div>
    </div>
    <div><button type="button" class="form-btn form-btn_style" @click="submit">{{formMode}} word</button></div>
  </div>
</template>

<script>
  import {db} from "../js/firebase";
  import {types} from "../js/main";

  export default {
    props: [
      "wordObj",
      "formMode",
      "wordId"
    ],
    data() {
      return {
        wordForm: JSON.parse(JSON.stringify(this.wordObj))
      }
    },
    computed: {
      types() {
        return types;
      }
    },
    methods: {
      close() {
        this.$emit("on-close");
      },
      addDefinition() {
        this.wordForm.definitions.push("");
      },
      removeDefinition(key) {
        this.wordForm.definitions.splice(key, 1);
      },
      addExample() {
        this.wordForm.examples.push("");
      },
      removeExample(key) {
        this.wordForm.examples.splice(key, 1);
      },
      submit() {
        delete this.wordForm["id"];
        if(this.formMode === "add" && this.wordForm.definitions.length !== 0) {
          db.collection("words").add(this.wordForm)
            .then(() => this.$emit("on-reload"))
            .catch(err => console.log(err));
        }
        else if (this.formMode === "edit" && this.wordForm.definitions.length !== 0) 
          db.collection("words").doc(this.wordId).set(this.wordForm)
            .then(() => this.$emit("on-reload"))
            .catch(err => console.log(err))
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../scss/partials/_vars";
  .form-inp:not(:last-child) {
    margin-bottom: 10px;
  }
  .form-inp-flex {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  .add-img-btn {
    background: url(../imgs/plus-symbol.svg) center no-repeat;
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