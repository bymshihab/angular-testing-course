import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';

/**
 * Unit tests for UserService
 * Tests all CRUD operations and HTTP interactions
 */
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  // Test data constants
  const API_URL = 'http://localhost:3000/users';
  const MOCK_USERS: User[] = [
    { id: 1, name: 'Khaled', email: 'khaled@example.com' },
    { id: 2, name: 'Shihab', email: 'shihab@example.com' }
  ];
  const MOCK_USER: User = { id: 1, name: 'Charlie', email: 'charlie@example.com' };
  const NEW_USER: Omit<User, 'id'> = { name: 'Alice', email: 'alice@email.com' };
  const UPDATED_USER: Omit<User, 'id'> = { name: 'Bob', email: 'bob@email.com' };

  /**
   * TestBed configuration for testing environment
   * Sets up HttpClientTestingModule and UserService
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no pending HTTP requests
  });

  /**
   * Helper function to expect and flush HTTP requests
   */
  const expectHttpRequest = (method: string, url: string, body?: any) => {
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    if (body) {
      expect(req.request.body).toEqual(body);
    }
    return req;
  };

  describe('Service Initialization', () => {
    it('should be created successfully', () => {
      expect(service).toBeTruthy();
      expect(service).toBeInstanceOf(UserService);
    });
  });
  describe('User Retrieval Operations', () => {
    describe('getUsers()', () => {
      it('should fetch all users successfully', () => {
        service.getUsers().subscribe(users => {
          expect(users).toEqual(MOCK_USERS);
          expect(users.length).toBe(2);
          expect(users[0]).toEqual(jasmine.objectContaining({
            name: 'Khaled',
            email: 'khaled@example.com'
          }));
        });

        const req = expectHttpRequest('GET', API_URL);
        req.flush(MOCK_USERS);
      });

      it('should handle empty user list', () => {
        service.getUsers().subscribe(users => {
          expect(users).toEqual([]);
          expect(users.length).toBe(0);
        });

        const req = expectHttpRequest('GET', API_URL);
        req.flush([]);
      });
    });

    describe('getUserById()', () => {
      it('should fetch user by ID successfully', () => {
        const userId = 1;

        service.getUserById(userId).subscribe(user => {
          expect(user).toEqual(MOCK_USER);
          expect(user.id).toBe(userId);
          expect(user.name).toBe('Charlie');
          expect(user.email).toBe('charlie@example.com');
        });

        const req = expectHttpRequest('GET', `${API_URL}/${userId}`);
        req.flush(MOCK_USER);
      });
    });
  });

  describe('User Modification Operations', () => {
    describe('addUser()', () => {
      it('should add a new user successfully', () => {
        const expectedUser: User = { id: 1, ...NEW_USER };

        service.addUser(NEW_USER).subscribe(result => {
          expect(result).toEqual(expectedUser);
          expect(result.id).toBeDefined();
          expect(result.name).toBe(NEW_USER.name);
          expect(result.email).toBe(NEW_USER.email);
        });

        const req = expectHttpRequest('POST', API_URL, NEW_USER);
        req.flush(expectedUser);
      });
    });

    describe('updateUser()', () => {
      it('should update an existing user successfully', () => {
        const userId = 1;
        const expectedUser: User = { id: userId, ...UPDATED_USER };

        service.updateUser(userId, UPDATED_USER).subscribe(result => {
          expect(result).toEqual(expectedUser);
          expect(result.id).toBe(userId);
          expect(result.name).toBe(UPDATED_USER.name);
          expect(result.email).toBe(UPDATED_USER.email);
        });

        const req = expectHttpRequest('PUT', `${API_URL}/${userId}`, UPDATED_USER);
        req.flush(expectedUser);
      });
    });

    describe('deleteUser()', () => {
      it('should delete a user successfully', () => {
        const userId = 1;

        service.deleteUser(userId).subscribe(() => {
          expect(true).toBe(true); // If we reach here, deletion was successful
        });

        const req = expectHttpRequest('DELETE', `${API_URL}/${userId}`);
        req.flush(null);
      });
    });
  });

  describe('Error Handling', () => {
    describe('when server returns 404', () => {
      it('should handle getUserById error gracefully', () => {
        const userId = 999;

        service.getUserById(userId).subscribe({
          next: () => fail('Expected observable to error'),
          error: (error) => {
            expect(error).toBeDefined();
          }
        });

        const req = expectHttpRequest('GET', `${API_URL}/${userId}`);
        req.flush('User not found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('when server returns 500', () => {
      it('should handle getUsers server error', () => {
        service.getUsers().subscribe({
          next: () => fail('Expected observable to error'),
          error: (error) => {
            expect(error).toBeDefined();
          }
        });

        const req = expectHttpRequest('GET', API_URL);
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('when network error occurs', () => {
      it('should handle network errors for addUser', () => {
        service.addUser(NEW_USER).subscribe({
          next: () => fail('Expected observable to error'),
          error: (error) => {
            expect(error).toBeDefined();
          }
        });

        const req = expectHttpRequest('POST', API_URL, NEW_USER);
        req.error(new ErrorEvent('Network error', {
          message: 'Network connection failed'
        }));
      });
    });
  });
});
