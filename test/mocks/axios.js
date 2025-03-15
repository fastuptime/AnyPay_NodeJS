// Jest için Axios mock uygulaması
const axiosMock = {
  post: jest.fn().mockResolvedValue({
    data: { 
      result: {}
    }
  }),
  get: jest.fn().mockResolvedValue({
    data: { 
      result: {}
    }
  }),
  create: jest.fn().mockReturnThis(),
  defaults: {
    headers: {
      common: {},
      post: {},
      get: {}
    }
  }
};

module.exports = axiosMock;
