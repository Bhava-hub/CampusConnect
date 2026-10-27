process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_test_jwt_secret_key_12345';
process.env.JWT_EXPIRE = '30d';
process.env.PORT = '5001';
