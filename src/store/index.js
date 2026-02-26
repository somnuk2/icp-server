import { createStore } from "vuex";

const state = {
  authenticate: false,
  member_id: "",
  employee_id: "",
  name: "",
  status: "",
  www: false,
  // www: true,
  //----------------------
  members1: [],
};

// Session injection for testing environment
if (typeof window !== 'undefined' && window.__TEST_VUEX_STATE__) {
  console.log("Vuex: Injecting test state", window.__TEST_VUEX_STATE__);
  const ts = window.__TEST_VUEX_STATE__;
  if (ts.user) {
    state.member_id = ts.user.member_id || "";
    state.name = ts.user.fullname || "";
    state.authenticate = true;
  }
}

export default createStore({
  state,
  mutations: {
    setMyAuthenticate(state, authenticate) {
      state.authenticate = authenticate;
    },
    setMyMember_id(state, member_id) {
      state.member_id = member_id;
    },
    setMyEmployee_id(state, employee_id) {
      state.employee_id = employee_id;
    },
    setMyName(state, name) {
      state.name = name;
    },
    setMyStatus(state, status) {
      state.status = status;
    },
    setMyWWW(state, www) {
      state.www = www;
    },
    //---------------------------------
    setMyMembers1(state, members1) {
      state.members1 = members1;
    },
  },
  // getters: {
  //   myAuthenticate: (state) => state.authenticate,
  //   myMember_id: (state) => state.member_id,
  //   myEmployee_id: (state) => state.employee_id,
  //   myName: (state) => state.name,
  //   myStatus: (state) => state.status,
  //   myWWW: (state) => state.www,
  //   myMembers1: (state) => state.members1,
  // },
  getters: {
    myAuthenticate(state) {
      return state.authenticate
    },
    myMember_id(state) {
      return state.member_id
    },
    myEmployee_id(state) {
      return state.employee_id
    },
    myName(state) {
      return state.name
    },
    myStatus(state) {
      return state.status
    },
    myWWW(state) {
      return state.www
    },
    myMembers1(state) {
      return state.members1
    },
  },
  actions: {},
  modules: {},
});
