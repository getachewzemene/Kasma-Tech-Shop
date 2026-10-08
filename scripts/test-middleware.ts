import { generateToken } from '../src/lib/jwt.ts';
import { requireAuth, requireAdmin, requireMerchant, AuthRequest } from '../src/middleware/auth.ts';

function createMockReqRes(authHeader?: string) {
  const req: Partial<AuthRequest> = {
    headers: authHeader ? { authorization: authHeader } : {},
  };
  let statusCode = 200;
  let jsonBody: any = null;
  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (body: any) => {
      jsonBody = body;
      return res;
    },
  };
  return { req: req as AuthRequest, res, getStatus: () => statusCode, getBody: () => jsonBody };
}

async function runTests() {
  console.log('--- TEST 1: requireAuth without header ---');
  let mock = createMockReqRes();
  let nextCalled = false;
  await requireAuth(mock.req, mock.res, () => { nextCalled = true; });
  console.log('Status:', mock.getStatus(), 'Next called:', nextCalled, 'Body:', mock.getBody());
  if (mock.getStatus() !== 401 || nextCalled) throw new Error('Test 1 failed');

  console.log('--- TEST 2: requireAdmin with customer token ---');
  const custToken = generateToken({
    id: 'c1',
    uid: 'c1',
    email: 'c@kasma.et',
    role: 'customer'
  });
  mock = createMockReqRes(`Bearer ${custToken}`);
  nextCalled = false;
  await requireAdmin(mock.req, mock.res, () => { nextCalled = true; });
  console.log('Status:', mock.getStatus(), 'Next called:', nextCalled, 'Body:', mock.getBody());
  if (mock.getStatus() !== 403 || nextCalled) throw new Error('Test 2 failed');

  console.log('--- TEST 3: requireAdmin with admin token ---');
  const adminToken = generateToken({
    id: 'a1',
    uid: 'a1',
    email: 'a@kasma.et',
    role: 'admin'
  });
  mock = createMockReqRes(`Bearer ${adminToken}`);
  nextCalled = false;
  await requireAdmin(mock.req, mock.res, () => { nextCalled = true; });
  console.log('Status:', mock.getStatus(), 'Next called:', nextCalled);
  if (mock.getStatus() !== 200 || !nextCalled) throw new Error('Test 3 failed');

  console.log('--- TEST 4: requireMerchant with customer token ---');
  mock = createMockReqRes(`Bearer ${custToken}`);
  nextCalled = false;
  await requireMerchant(mock.req, mock.res, () => { nextCalled = true; });
  console.log('Status:', mock.getStatus(), 'Next called:', nextCalled, 'Body:', mock.getBody());
  if (mock.getStatus() !== 403 || nextCalled) throw new Error('Test 4 failed');

  console.log('--- TEST 5: requireMerchant with merchant token ---');
  const merchToken = generateToken({
    id: 'm1',
    uid: 'm1',
    email: 'm@kasma.et',
    role: 'merchant'
  });
  mock = createMockReqRes(`Bearer ${merchToken}`);
  nextCalled = false;
  await requireMerchant(mock.req, mock.res, () => { nextCalled = true; });
  console.log('Status:', mock.getStatus(), 'Next called:', nextCalled);
  if (mock.getStatus() !== 200 || !nextCalled) throw new Error('Test 5 failed');

  console.log('\n>>> ALL 5 RBAC & AUTH MIDDLEWARE TESTS PASSED PERFECTLY! <<<');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
