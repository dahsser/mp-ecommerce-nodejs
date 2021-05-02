const express = require('express');
const exphbs = require('express-handlebars');
const port = process.env.PORT || 3000;
require('dotenv').config();
const BASE_URL = process.env.BASE_URL;
const app = express();
const qs = require('querystring');
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token:
    'APP_USR-8208253118659647-112521-dd670f3fd6aa9147df51117701a2082e-677408439',
  integrator_id: 'dev_2e4ad5dd362f11eb809d0242ac130004',
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/detail', function (req, res) {
  res.render('detail', req.query);
});

app.get('/pay', function (req, res) {});
app.post('/create-preference', (req, res) => {
  console.log('req', req.body);
  const preference = {
    items: [
      {
        id: '1234',
        title: req.body.title,
        description: 'Dispositivo móvil de Tienda e-commerce',
        picture_url: req.body.pictureURL,
        unit_price: Number(req.body.price),
        quantity: Number(req.body.quantity),
      },
    ],
    external_reference: 'dilogi7@gmail.com',
    back_urls: {
      success: `${BASE_URL}/mercadopago/webhook`,
      failure: `${BASE_URL}/mercadopago/webhook`,
      pending: `${BASE_URL}/mercadopago/webhook`,
    },
    auto_return: 'approved',
    payer: {
      name: 'Lalo',
      surname: 'Landa',
      email: 'test_user_46542185@testuser.com',
      phone: {
        area_code: '52',
        number: 5549737300,
      },
      address: {
        zip: '03940',
        street_number: 1602,
        street_name: 'Insurgentes Sur',
      },
    },
    payment_methods: {
      excluded_payment_methods: [{ id: 'diners' }],
      excluded_payment_types: [{ id: 'atm' }],
      installments: 6,
    },
    notification_url: `${BASE_URL}/mercadopago/webhook`,
  };
  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.json({ id: response.body.id, init_point: response.body.init_point });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get('/mercadopago/webhook', function (request, response) {
  console.log("MERCADO PAGO WEBHOOK!!!!!")
  console.log(JSON.stringify(request.query))
  const payload = JSON.parse(
    JSON.stringify({
      payment: request.query.payment_id,
      status: request.query.status,
      merchanOrder: request.query.merchant_order_id,
      paymentType: request.query.payment_type,
      preference: request.query.preference_id,
      externalReference: request.query.external_reference,
      collectionId: request.query.collection_id,
    })
  );
  console.log(payload)
  response.redirect(`/payment/status?${qs.encode(payload)}`);
});
app.post('/mercadopago/webhook', function(request, response){
  console.log("NOTIFICATION 2!!!!");
  console.log(JSON.stringify(request.body))
  response.json({success: true})
})
app.get('/payment/status', function (req, res) {
  res.render('payment-status');
});

app.listen(port);
