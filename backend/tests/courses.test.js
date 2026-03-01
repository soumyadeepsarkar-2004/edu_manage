const request = require('supertest');
const app = require('../server');

describe('Courses Routes', () => {
    let studentToken;
    let instructorToken;
    let adminToken;

    const registerAndLogin = async (overrides = {}) => {
        const payload = {
            firstName: 'Test',
            lastName: 'User',
            email: `user_${Date.now()}_${Math.random()}@test.com`,
            password: 'password123',
            role: 'student',
            ...overrides,
        };
        if (overrides.role === 'instructor') {
            payload.instructorProfile = { qualification: 'MSc', experience: 3 };
        }
        const res = await request(app).post('/api/auth/register').send(payload);
        return res.body.token;
    };

    beforeEach(async () => {
        studentToken = await registerAndLogin({ role: 'student' });
        instructorToken = await registerAndLogin({ role: 'instructor' });
        // Admin creation handled via seed in real env; skip admin course tests here
    });

    describe('GET /api/courses', () => {
        it('should return a list of courses (empty initially)', async () => {
            const res = await request(app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body) || res.body.courses !== undefined).toBe(true);
        });
    });

    describe('POST /api/courses', () => {
        it('should reject course creation by a student', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    title: 'Student Course',
                    description: 'desc',
                    courseCode: 'SC101',
                    credits: 3,
                    maxStudents: 30,
                });
            expect(res.statusCode).toBe(403);
        });

        it('should reject course creation by an unapproved instructor', async () => {
            const res = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${instructorToken}`)
                .send({
                    title: 'New Course',
                    description: 'A test course',
                    courseCode: 'TC101',
                    credits: 3,
                    maxStudents: 30,
                });
            // 403 because instructor is not yet approved
            expect([403, 400]).toContain(res.statusCode);
        });
    });
});
