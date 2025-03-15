const nock = require('nock');
const { AnypayClient } = require('../lib/index');

// Test yapılandırması
const config = {
  merchantId: '1399',
  secretKey: 'NLmx0woAqrgHYnMbDSVLChCJ77R8adf',
  apiId: 'test-api-id',
  apiKey: 'test-api-key'
};

const client = new AnypayClient(config);

describe('AnypayClient Payments and Payouts', () => {
  // Not: setup.js tüm testler için ortak hooks'ları içeriyor
  
  beforeEach(() => {
    // Test öncesi temizle
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  test('getPayments should return list of payments', async () => {
    const mockResponse = {
      result: {
        total: 2,
        payments: {
          '4950030': {
            transaction_id: 4950030,
            pay_id: '1335',
            status: 'paid',
            method: 'advcash',
            amount: 1250,
            currency: 'RUB',
            profit: 1200,
            email: 'dog@mail.com',
            desc: 'Xiaomi Mi Power Bank',
            date: '26.11.2019 17:12:02',
            pay_date: '26.11.2019 17:12:12'
          },
          '4604415': {
            transaction_id: 4604415,
            pay_id: '1334',
            status: 'waiting',
            method: 'ltc',
            amount: 15000,
            currency: 'RUB',
            profit: 14600.25,
            email: 'cat@mail.com',
            desc: 'Apple Airpods 2',
            date: '26.11.2019 15:32:14',
            pay_date: ''
          }
        }
      }
    };

    nock('https://anypay.io')
      .post('/api/payments/test-api-id')
      .reply(200, mockResponse);

    const result = await client.getPayments();
    expect(result).toHaveProperty('total', 2);
    expect(result).toHaveProperty('payments');
    expect(Object.keys(result.payments).length).toBe(2);
    expect(result.payments['4950030']).toHaveProperty('status', 'paid');
    expect(result.payments['4604415']).toHaveProperty('status', 'waiting');
  });

  test('createPayout should create new payout', async () => {
    nock('https://anypay.io')
      .post('/api/create-payout/test-api-id')
      .reply(200, {
        result: {
          transaction_id: 97769,
          payout_id: '10010',
          payout_type: 'card',
          status: 'in_process',
          amount: 5000,
          commission: 75,
          commission_type: 'payment',
          rate: 1.00,
          wallet: '4000000000000000',
          balance: 211165.79,
          date: '26.11.2019 11:00:59',
          complete_date: '26.11.2019 11:00:59'
        }
      });

    const params = {
      payout_id: '10010',
      payout_type: 'card',
      amount: '5000',
      wallet: '4000000000000000',
      commission_type: 'payment'
    };

    const result = await client.createPayout(params);
    expect(result).toHaveProperty('transaction_id', 97769);
    expect(result).toHaveProperty('payout_id', params.payout_id);
    expect(result).toHaveProperty('payout_type', params.payout_type);
    expect(result).toHaveProperty('status', 'in_process');
    expect(result).toHaveProperty('amount', 5000);
  });

  test('getPayouts should return list of payouts', async () => {
    const mockScope = nock('https://anypay.io')
      .post(`/api/payouts/test-api-id`)
      .reply(200, {
        result: {
          total: 2,
          payouts: {
            '97769': {
              transaction_id: 97769,
              payout_id: '10005',
              payout_type: 'card',
              status: 'paid',
              amount: 5000,
              commission: 75,
              commission_type: 'balance',
              wallet: '4000000000000000',
              date: '26.11.2019 11:45:42',
              complete_date: '26.11.2019 11:45:42'
            },
            '97554': {
              transaction_id: 97554,
              payout_id: '10004',
              payout_type: 'ym',
              status: 'canceled',
              amount: 15000,
              commission: 225,
              commission_type: 'payment',
              wallet: '41001111112111',
              date: '26.11.2019 11:43:46',
              complete_date: '26.11.2019 11:43:47'
            }
          }
        }
      });

    const result = await client.getPayouts();
    expect(result).toHaveProperty('total', 2);
    expect(result).toHaveProperty('payouts');
    expect(Object.keys(result.payouts).length).toBe(2);
    expect(result.payouts['97769']).toHaveProperty('status', 'paid');
    expect(result.payouts['97554']).toHaveProperty('status', 'canceled');
    expect(mockScope.isDone()).toBe(true);
  });

  test('getNotificationIPs should return list of IPs', async () => {
    nock('https://anypay.io')
      .post('/api/ip-notification/test-api-id')
      .reply(200, {
        result: {
          ip: ['185.162.128.38', '185.162.128.39', '185.162.128.88']
        }
      });

    const result = await client.getNotificationIPs();
    expect(result).toHaveProperty('ip');
    expect(result.ip).toEqual(['185.162.128.38', '185.162.128.39', '185.162.128.88']);
  });
});
