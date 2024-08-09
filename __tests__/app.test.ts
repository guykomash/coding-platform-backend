import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';

describe('Test /codeblock route', () => {
  test('GET /codeblock', () => {
    return request(app)
      .get('/codeblock')
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.CodeBlocks.length).toBe(4);
      });
  });
});
