
const user = {
  state: {
    id: '', 
    name: '',
    token:'',
    roles:[]

  },

  mutations: {
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },
}

export default user
