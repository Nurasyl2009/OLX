import * as chai from 'chai';
import supertest from 'supertest';
import { app } from '../server.js';
import { query } from '../database.js';

const expect = chai.expect;
const request = supertest(app);

describe('Comprehensive Backend API Tests', function() {
  let buyerToken;
  let buyerId;
  let sellerToken;
  let sellerId;
  let productId;
  let adminToken;
  let adminId;
  
  // Уникальные данные для тестов
  const uniqueSuffix = Date.now().toString().slice(-6);

  const buyerData = {
    name: `TestBuyer_${uniqueSuffix}`,
    phone: `777${uniqueSuffix}`,
    email: `buyer${uniqueSuffix}@test.com`,
    password: 'password123'
  };

  const sellerData = {
    name: `TestSeller_${uniqueSuffix}`,
    phone: `888${uniqueSuffix}`,
    email: `seller${uniqueSuffix}@test.com`,
    password: 'password123'
  };

  const adminData = {
    name: `TestAdmin_${uniqueSuffix}`,
    phone: `999${uniqueSuffix}`,
    email: `admin${uniqueSuffix}@test.com`,
    password: 'password123'
  };

  describe('1. Auth Endpoints', function() {
    it('should register a new buyer', async function() {
      const res = await request.post('/api/auth/register').send(buyerData);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('id');
      buyerToken = res.body.token;
      buyerId = res.body.user.id;
    });

    it('should register a new seller (initially buyer role)', async function() {
      const res = await request.post('/api/auth/register').send(sellerData);
      expect(res.status).to.equal(201);
      sellerToken = res.body.token;
      sellerId = res.body.user.id;
    });

    it('should register an admin (initially buyer role)', async function() {
      const res = await request.post('/api/auth/register').send(adminData);
      expect(res.status).to.equal(201);
      adminId = res.body.user.id;
    });

    it('should manually elevate roles via DB for tests (Admin & Seller)', async function() {
      await query("UPDATE users SET role = 'seller' WHERE id = $1", [sellerId]);
      await query("UPDATE users SET role = 'admin' WHERE id = $1", [adminId]);
      
      // Re-login seller
      let res = await request.post('/api/auth/login').send({
        phone: sellerData.phone,
        password: sellerData.password
      });
      sellerToken = res.body.token; 

      // Re-login admin
      res = await request.post('/api/auth/login').send({
        phone: adminData.phone,
        password: adminData.password
      });
      adminToken = res.body.token;
    });

    it('should get buyer profile', async function() {
      const res = await request.get('/api/auth/profile').set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.phone).to.equal(buyerData.phone);
    });

    it('should update buyer profile', async function() {
      const res = await request.put('/api/auth/profile')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          name: buyerData.name + '_Updated',
          phone: buyerData.phone
        });
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal(buyerData.name + '_Updated');
    });
  });

  describe('2. Product Endpoints', function() {
    it('should not allow buyer to create a product', async function() {
      const res = await request.post('/api/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ title: 'Invalid Product', price: 100 });
      expect(res.status).to.equal(403);
    });

    it('should allow seller to create a product', async function() {
      const res = await request.post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Test Product',
          description: 'A great test product',
          price: 1500,
          category: 'Электроника'
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      productId = res.body.id;
    });

    it('should get all public products', async function() {
      const res = await request.get('/api/products');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.products).to.be.an('array');
      const found = res.body.products.find(p => p.id === productId);
      expect(found).to.not.be.undefined;
    });

    it('should fetch seller specific products', async function() {
      const res = await request.get('/api/my-products').set('Authorization', `Bearer ${sellerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0].seller_id).to.equal(sellerId);
    });

    it('should allow seller to update their product', async function() {
      const res = await request.put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Test Product Updated',
          price: 2000
        });
      expect(res.status).to.equal(200);
      expect(res.body.title).to.equal('Test Product Updated');
    });
  });

  describe('3. Favorites & Reviews Endpoints', function() {
    it('should add a product to favorites', async function() {
      const res = await request.post('/api/favorites')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ product_id: productId });
      expect(res.status).to.equal(201);
    });

    it('should fetch buyer favorites', async function() {
      const res = await request.get('/api/favorites').set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      const fav = res.body.find(f => f.product_id === productId);
      expect(fav).to.not.be.undefined;
    });

    it('should remove a product from favorites', async function() {
      const res = await request.delete(`/api/favorites/${productId}`).set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(204);
    });

    it('should add a review to the product', async function() {
      const res = await request.post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5, comment: 'Excellent test!' });
      expect(res.status).to.equal(201);
      expect(res.body.comment).to.equal('Excellent test!');
    });

    it('should get product reviews', async function() {
      const res = await request.get(`/api/products/${productId}/reviews`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0].rating).to.equal(5);
    });
  });

  describe('4. Orders & Notifications Endpoints', function() {
    it('should place an order', async function() {
      const res = await request.post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ product_id: productId });
      expect(res.status).to.equal(201);
    });

    it('should get buyer orders', async function() {
      const res = await request.get('/api/orders').set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      const order = res.body.find(o => o.id === productId);
      expect(order).to.not.be.undefined;
    });

    it('should get unread notifications for seller (from the order)', async function() {
      const res = await request.get('/api/notifications/unread-count').set('Authorization', `Bearer ${sellerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.count).to.be.greaterThan(0);
    });

    it('should get notifications list for seller', async function() {
      const res = await request.get('/api/notifications').set('Authorization', `Bearer ${sellerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should mark notifications as read', async function() {
      const res = await request.put('/api/notifications/read').set('Authorization', `Bearer ${sellerToken}`);
      expect(res.status).to.equal(200);
    });
  });

  describe('5. Chat/Messages Endpoints', function() {
    it('should send a message from buyer to seller', async function() {
      const res = await request.post('/api/messages')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ receiver_id: sellerId, message_text: 'Hello seller!' });
      expect(res.status).to.equal(201);
      expect(res.body.message_text).to.equal('Hello seller!');
    });

    it('should fetch messages between buyer and seller', async function() {
      const res = await request.get(`/api/messages/${sellerId}`).set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0].message_text).to.equal('Hello seller!');
    });

    it('should fetch conversations list for buyer', async function() {
      const res = await request.get('/api/conversations').set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      const conv = res.body.find(c => c.other_id === sellerId);
      expect(conv).to.not.be.undefined;
    });
  });

  describe('6. Seller Requests & Admin Routes', function() {
    it('should submit a seller request as buyer', async function() {
      const res = await request.post('/api/seller-request')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'I want to sell tests' });
      expect(res.status).to.equal(201);
    });

    it('should get seller request status', async function() {
      const res = await request.get('/api/seller-request/status').set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('pending');
    });

    it('should allow admin to view users list', async function() {
      const res = await request.get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should allow admin to view seller requests', async function() {
      const res = await request.get('/api/admin/seller-requests').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('7. Cleanup / Deletion', function() {
    it('should allow seller to delete their product', async function() {
      const res = await request.delete(`/api/products/${productId}`).set('Authorization', `Bearer ${sellerToken}`);
      expect(res.status).to.equal(204);
    });

    it('should manually cleanup test users from DB', async function() {
      await query('DELETE FROM users WHERE id IN ($1, $2, $3)', [buyerId, sellerId, adminId]);
      
      const check = await query('SELECT * FROM users WHERE id = $1', [buyerId]);
      expect(check.rows.length).to.equal(0);
    });
  });
});
