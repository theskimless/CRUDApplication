function _(data) { console.log(data) }

import "./scss/main.scss";
import {types} from "./js/main";

// VUE
import Vue from "vue";
Vue.component("word-form", require("./views/WordForm.vue").default);
Vue.component("word", require("./views/Word.vue").default);
Vue.component("list-form", require("./views/ListForm.vue").default);
Vue.component("list", require("./views/List.vue").default);
Vue.component("test", require("./views/Test.vue").default);

// FIREBASE
import {firestorePlugin} from "vuefire";
Vue.use(firestorePlugin);

import firebase, { firestore } from "firebase/app";
import "firebase/firestore";
import {db} from "./js/firebase";

// AUTH
import "firebase/auth";
import { resolve } from "q";
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope("email");
firebase.auth().useDeviceLanguage();

// if(localStorage.getItem("googleToken") === null) {
//   signInWithPopup();
// }
// else {
  // var credential = firebase.auth.GoogleAuthProvider.credential(null, localStorage.getItem("googleToken"));
  // firebase.auth().signInWithCredential(credential)
  //   .then(resp => {
  //     _(resp);
  //     onAuth(resp.user);
  //   })
  //   .catch(error => {
  //     if(error.code === "auth/invalid-credential") {
  //       signInWithPopup();
  //     }
  //   });
// }
function signInWithPopup() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // localStorage.setItem("googleToken", token);
    var token = result.credential.accessToken;
    onAuth(result.user);

    // if(result.additionalUserInfo.isNewUser) {}
  }).catch(error => _(error));
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    onAuth(user);
  } 
  else {
    signInWithPopup();
  }
});

function onAuth(user) {
  app.profile.uId = user.uid;
  app.profile.isAuthenticated = true;
  app.profile.photoUrl = user.photoURL;
  app.profile.name = user.displayName;
  app.profile.email = user.email;

  //GET LISTS
  db.collection("users").doc(user.uid).collection("lists").get()
    .then(resp => {
      resp.forEach((doc) => {
        let data = doc.data()
        data.id = doc.id;
        app.profile.lists.push(data);
      });
    })
    .catch(error => _(error));
  
  // GET WORDS
  db.collection("users").doc(user.uid).collection("words").get()
    .then(resp => {
      resp.forEach((doc) => {
        db.collection("words").doc(doc.id).get()
          .then(resp => {
            app.profile.words[doc.id] = resp.data();
            app.profile.words[doc.id].coeff = doc.data().coeff;
          })
          .catch(err => _(err));
      });
    })
    .catch(error => _(error));

  //GET ROLE
  db.collection("users").doc(user.uid).collection("private").doc("private").get()
    .then(resp => {
      app.profile.role = resp.data().role;
    })
    .catch(error => _("You are user"));
}

const app = new Vue({
  el: "#app",
  data: {
    // PROFILE
    profile: {
      isAuthenticated: false,
      photoUrl: "",
      name: "",
      email: "",
      uId: "",
      role: "user",
      lists: [],
      words: {}
    },

    // TEST
    isTestShowed: false,

    // LISTS
    isListFormShowed: false,
    isListShowed: false,
    selectedList: {},
    isAddToListShowed: false,    
    
    // PAGE MODE
    // 0 - your lists
    // 1 - all words
    mainPageMode: 0,
    newListInp: "",
    isNewListInpActive: false,

    // SEARCH
    wordsSearch: "",
    isWordFormShowed: false,
    searchResKey: "",
    searchResult: "",

    // EDIT WORD
    editedWordForm: {},
    editedWordId: "",
    wordFormMode: "add",

    // WORDS
    words: [],
    isWordShowed: false,
    selectedWord: {},

    // WORDS PAGINATION
    page: 0,
    isLastPage: false,
    isFirstPage: true
  },
  // firestore: {
  //   words: db.collection("words").orderBy("word").limit(5)
  // },
  watch: {
    wordsSearch(str) {
      if(str !== "") {
        this.searchResKey = {};
        let allFasle = true;
        for(let key in this.words) {
          if(this.words[key].word.search(str) !== -1) {
            this.searchResKey[key] = true;
            allFasle = false;
          }
          else this.searchResKey[key] = false; 
        }
        if(allFasle) {
          db.collection("words").where("word", "==", this.wordsSearch).get()
            .then(resp => {
              if(!resp.empty) {
                let data = resp.docs[0].data();
                data.id = resp.docs[0].id;
                this.searchResult = data;
              }
            });
        }
      }
      else {
        this.searchResult = "";
        this.searchResKey = "";
      }
    },

    newListInp(value) {
      if(value !== "") {
        this.isNewListInpActive = true;
        for(var key in this.profile.lists) {
          if(this.profile.lists[key].name === value) {
            this.isNewListInpActive = false;
            break;
          }
        }
      }
      else this.isNewListInpActive = false;
    }
  },

  computed: {
    types() {
      return types;
    },

    isAdmin() {
      // return this.profile.role == "admin";
      return true;
    }
  },

  methods: {
    reload() {
      location.reload();
    },

    // TEST
    startTest(listObj) {
      this.isTestShowed = true;
      this.selectedList = listObj;
    },

    hideTest() {
      this.isTestShowed = false;
    },

    // LISTS
    showList(listObj) {
      this.selectedList = listObj;
      this.isListShowed = true;
    },
    
    hideList() {
      this.isListShowed = false;
    },

    hideListForm() {
      this.isListFormShowed = false;
    },

    addToListSelectWord(wordObj) {
      this.isAddToListShowed = true;
      this.selectedWord = wordObj;
    },

    listHasWordAlready(listKey) {
      let words = this.profile.lists[listKey].words;
      for(let i = 0; i < words.length; i++) {
        if(words[i] === this.selectedWord.id) {
          return true;
        }
      }
      return false;
    },

    addToList(listKey) {
      let listHasWordAlready = this.listHasWordAlready(listKey);
      
      if(!listHasWordAlready) {
        let newWords = this.profile.lists[listKey].words;

        newWords.push(this.selectedWord.id);
        db.collection("users").doc(this.profile.uId).collection("lists").doc(this.profile.lists[listKey].id)
          .update({
            words: newWords
          })
          .then(() => {
            let hasWordAlready = false;
            for(var key in this.profile.words) {
              if(key === this.selectedWord.id) {
                hasWordAlready = true;
                break;
              }
            }
    
            if(!hasWordAlready) {
              return new Promise((resolve, reject) => {
                db.collection("users").doc(this.profile.uId).collection("words").doc(this.selectedWord.id)
                .set({coeff: 1})
                .then(() => resolve());
              });
            }
            else {
              return;
            }
          })
          .then(() => this.reload());
      }
    },

    createNewList() {
      if(this.isNewListInpActive && this.newListInp !== "") {
        db.collection("users").doc(this.profile.uId).collection("lists")
          .add({
            name: this.newListInp,
            words: []
          })
          .then(() => this.reload());
        this.newListInp = "";
      }
    },

    listDelete(listId) {
      db.collection("users").doc(this.profile.uId).collection("lists").doc(listId)
        .delete()
        .then(() => this.reload());
    },

    listEdit(listObj) {
      this.isListFormShowed = true;
      this.selectedList = listObj;
    },

    // PAGINATION
    prevPage() {
      if(this.page > 0) {
        this.page--;
        this.isLastPage = false;
        if(this.page === 0) this.isFirstPage = true;
      }
    },

    nextPage() {
      if(!this.isLastPage) {
        this.isFirstPage = false;
        if(this.page < this.words.length/5 - 1) this.page++
        else {
          db.collection("words").orderBy("word").startAfter(this.words[this.words.length-1].word).limit(5).get()
          .then(querySnapshot => {
            if(!querySnapshot.empty) {
              querySnapshot.forEach(doc => {
                var data = doc.data();
                data.id = doc.id;
                this.words.push(data);
              });
              this.page++;
            }
            else this.isLastPage = true;
          });
        }
      }
    },

    loginBtn() {
      signInWithPopup();
    },

    resetWordForm() {
      this.editedWordForm = {
        type: 0,
        definitions: [""],
        examples: [""],
      };
    },
    showWordForm() {
      this.isWordFormShowed = true;
      this.wordFormMode = "add";
    },
    hideWordForm() {
      this.isWordFormShowed = false;
      this.resetWordForm();
    },

    showEditWordForm(wordObj) {
      this.editedWordForm = wordObj;
      this.showWordForm();
      this.editedWordId = wordObj.id;
      this.wordFormMode = "edit";
    },

    showWord(wordObj) {
      this.isWordShowed = true;
      this.selectedWord = wordObj;
    },

    wordDelete(wordId) {
      db.collection("words").doc(wordId).delete();
    }
  },
  created() {
    this.resetWordForm();
    db.collection("words").orderBy("word").limit(5).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          var data = doc.data();
          data.id = doc.id;
          this.words.push(data);
        });
      });
  }
});