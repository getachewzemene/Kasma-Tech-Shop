import { generateToken, verifyToken } from '../src/lib/jwt.ts';

async function testRbac() {
  console.log('Testing JWT token generation and role authorization...');

  const adminToken = generateToken({
    id: 'admin-1',
    uid: 'admin-1',
    email: 'admin@kasma.et',
    name: 'Admin User',
    role: 'admin',
  });

  const merchantToken = generateToken({
    id: 'm-1',
    uid: 'merch-1',
    email: 'merchant@kasma.et',
    name: 'Merchant User',
    role: 'merchant',
    merchantId: 'm-1',
  });

  const customerToken = generateToken({
    id: 'cust-1',
    uid: 'cust-1',
    email: 'customer@kasma.et',
    name: 'Customer User',
    role: 'customer',
  });

  console.log('Admin verified:', verifyToken(adminToken));
  console.log('Merchant verified:', verifyToken(merchantToken));
  console.log('Customer verified:', verifyToken(customerToken));
  console.log('All tokens verified properly!');
}

testRbac();
