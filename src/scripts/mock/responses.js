exports.responses = {
  '/api/testing': {
    success: {
      message: 'Hey Dude, fucking A, it is working!',
      deeply: {
        nested: {
          key: 'wonderful'
        }
      }
    },
    failure: {
      message: 'Oh no, man, I am sorry. It looks broken.'
    }
  },
  '/api/one': {
    greetings: 'ciao'
  },
  '/api/last': {
    success: {
      message: 'Yes, it is really wonderful stuff.'
    },
    failure: {
      message: 'Broken!'
    }
  },
  '/api/booking-data': {
    success: {
      title: 'Great stuff!',
      items: [{
        label: 'one'
      }, {
        label: 'two'
      }, {
        label: 'three'
      }, {
        label: 'four'
      }]
    },
    failure: {
      message: 'Broken!'
    }
  }
};
