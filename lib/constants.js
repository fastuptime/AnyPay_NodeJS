module.exports = {
  BASE_URL: 'https://anypay.io',
  API_ENDPOINTS: {
    MERCHANT: '/merchant',
    BALANCE: '/api/balance',
    RATES: '/api/rates',
    COMMISSIONS: '/api/commissions',
    CREATE_PAYMENT: '/api/create-payment',
    PAYMENTS: '/api/payments',
    CREATE_PAYOUT: '/api/create-payout',
    PAYOUTS: '/api/payouts',
    IP_NOTIFICATION: '/api/ip-notification'
  },
  CURRENCIES: {
    RUB: 'RUB',
    UAH: 'UAH',
    BYN: 'BYN',
    KZT: 'KZT',
    USD: 'USD',
    EUR: 'EUR'
  },
  PAYMENT_METHODS: {
    CARD: 'card',
    SBERBANK: 'sberbank',
    SBP: 'sbp',
    YM: 'ym',
    WM: 'wm',
    ADVCASH: 'advcash',
    PM: 'pm',
    APPLEPAY: 'applepay',
    GOOGLEPAY: 'googlepay',
    SAMSUNGPAY: 'samsungpay',
    PAYEER: 'payeer',
    BTC: 'btc',
    ETH: 'eth',
    BCH: 'bch',
    LTC: 'ltc',
    DASH: 'dash',
    ZEC: 'zec',
    DOGE: 'doge',
    USDT: 'usdt',
    TON: 'ton',
    MTS: 'mts',
    MEGAFON: 'megafon',
    BEELINE: 'beeline',
    TELE2: 'tele2',
    TERM: 'term'
  },
  PAYMENT_STATUSES: {
    PAID: 'paid',
    PARTIALLY_PAID: 'partially-paid',
    WAITING: 'waiting',
    REFUND: 'refund',
    CANCELED: 'canceled',
    EXPIRED: 'expired',
    ERROR: 'error'
  },
  PAYOUT_TYPES: {
    CARD: 'card',
    SBP: 'sbp',
    YM: 'ym',
    USDT: 'usdt',
    WM: 'wm',
    MP: 'mp'
  },
  COMMISSION_TYPES: {
    PAYMENT: 'payment',
    BALANCE: 'balance'
  },
  NOTIFICATION_IPS: [
    '185.162.128.38',
    '185.162.128.39',
    '185.162.128.88'
  ]
};
