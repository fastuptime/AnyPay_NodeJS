// Jest testleri için global setup

// Nock'u bağla
const nock = require('nock');

// Testler sırasında gerçek HTTP isteklerini engelle
// ancak localhost isteklerine izin ver
beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

// Tüm testler tamamlandıktan sonra temizleme yap
afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

// Testler arasında temizleme
afterEach(() => {
  nock.cleanAll();
});
