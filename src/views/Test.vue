<template>
  <div class="popup-wrapper block block_styled">
    <div class="popup-close" @click="close"></div>
    <div class="form-title">TEST</div>

    <div v-if="isEnoughWords">
      <div class="test-question"><b>Definition: </b>{{activeQuestion}}</div>
      <div class="test-answers-wrap">
        <button 
          type="button" 
          class="text-btn test-asnwer-btn"
          v-for="(answer, key) in answers"
          :key="key"
          :class="{'wrong-answer': answersState[key] === -1, 'correct-answer': answersState[key] === 1}"
          @click="chooseAnswer(answer, key)"
        >{{answer}}</button>
      </div>
      <div class="btn-wrap">
        <button 
          type="button" 
          class="form-btn form-btn_style" 
          :class="{'answer-btn_unactive': !isAnswered}" 
          @click="nextQuestion"
        >NEXT</button>
      </div>
      <div class="btn-wrap">
        <button 
          type="button" 
          class="form-btn form-btn_style" 
          @click="finish"
        >FINISH</button>
      </div>
    </div>
    <div class="test-warning" v-else>
      You need at least 6 questions
    </div>
  </div>
</template>

<script>
import {db} from "../js/firebase";

export default {
  props: ["listObj", "allWords", "uId"],
  data() {
    return {
      words: [],
      activeQuestion: "",
      answers: [],
      answersState: [0, 0, 0, 0],
      answer: "",
      isAnswered: false,
      isEnoughWords: false
    }
  },
  methods: {
    close() {
      this.$emit("on-close");
    },
    rand(min = 0, max = 9) {
      return Math.floor((Math.random() * (max + 1 - min))) + min;
    },
    randomSort(arr) {
      return arr.sort((a,b) => (a > b) ? ((this.rand(0, 1)) ? 1 : -1) : ((b > a) ? ((this.rand(0, 1)) ? 1 : 1) : 0));
    },
    chooseAnswer(chosenAnswer, key) {
      if(chosenAnswer === this.answer.word) {
        this.answer.coeff--;
        this.$set(this.answersState, key, 1);
        this.isAnswered = true;
      }
      else {
        this.answer.coeff++;
        this.$set(this.answersState, key, -1);
      }
    },
    nextQuestion() {
      if(this.isAnswered) {
        this.isAnswered = false;
        for(let i = 0; i < this.answersState.length; i++) {
          this.$set(this.answersState, i, 0);
        }
        this.getQuestion();
      }
    },
    getQuestion() {
      let tasks = [];
      for(let i = 0; i < this.words.length; i++) {
        for(let n = 0; n < this.words[i].coeff; n++) {
          tasks.push(i);
        }
      }

      let answerKey = tasks[this.rand(0, tasks.length-1)];

      this.answer = this.words[answerKey];
      this.activeQuestion = this.answer.definitions[0];
      
      let answersKeys = [];
      for(let i = 0; i < this.words.length; i++) {
        if(this.words[i].word !== this.answer.word) answersKeys.push(i);
      }

      answersKeys = this.randomSort(answersKeys);
      answersKeys = answersKeys.splice(0, 3);
      answersKeys.push(answerKey);
      answersKeys = this.randomSort(answersKeys);

      let answers = [];
      for(let i = 0; i < 4; i++) {
        answers.push(this.words[answersKeys[i]].word);
      }
      this.answers = answers;
    },
    finish() {
      for(let i = 0; i < this.words.length; i++) {
        db.collection("users").doc(this.uId).collection("words").doc(this.words[i].id)
          .update({
            coeff: this.words[i].coeff 
          })
          .then(() => {
            if(i === this.words.length - 1) this.$emit("on-reload");
          });
      }
    }
  },
  mounted() {
    let listWords = this.listObj.words; 
    if(listWords.length > 5) {
      for(let i = 0; i < listWords.length; i++) {
        this.words.push(this.allWords[listWords[i]]);
        this.words[i].id = listWords[i];
      }
      
      this.words = JSON.parse(JSON.stringify(this.words));
      this.getQuestion();
      this.isEnoughWords = true;
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../scss/partials/_vars";

  .popup-wrapper {
    max-width: 768px;
  }
  .test-question {
    text-align: center;
  }
  .test-answers-wrap {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
  }
  .test-asnwer-btn {
    margin: 0 15px;
    flex: 1;
  }
  .wrong-answer {
    background-color: red;
  }
  .correct-answer {
    background-color: green;
  }
  .btn-wrap {
    margin-top: 20px;
  }
  .answer-btn_unactive {
    color: #ddd;
    border-color: #ddd;
  }
  .test-warning {
    text-align: center;
    font-size: 1.1rem;
  }
</style>