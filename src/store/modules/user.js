
const user = {
  state: {
    id: '', 
    name: '',
    token:''

  },

  mutations: {
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_NAME: (state, name) => {
      state.name = name
    }
  },
}

export default user
