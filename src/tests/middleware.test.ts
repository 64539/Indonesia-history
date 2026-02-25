
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn(),
      next: vi.fn(),
      json: vi.fn(),
    },
  };
});

describe('Middleware', () => {
  let request: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect unauthenticated users accessing dashboard', () => {
    request = {
      nextUrl: { pathname: '/dashboard' },
      url: 'http://localhost:3000/dashboard',
      cookies: { get: vi.fn().mockReturnValue(undefined) }, // No token
    } as any;

    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/login',
      })
    );
  });

  it('should allow authenticated admin accessing dashboard', () => {
    request = {
      nextUrl: { pathname: '/dashboard' },
      url: 'http://localhost:3000/dashboard',
      cookies: {
        get: vi.fn((name) => {
          if (name === 'auth-token') return { value: 'valid-token' };
          if (name === 'user-role') return { value: 'admin' };
          return undefined;
        }),
      },
    } as any;

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect authenticated users away from login page', () => {
    request = {
      nextUrl: { pathname: '/login' },
      url: 'http://localhost:3000/login',
      cookies: {
        get: vi.fn((name) => {
          if (name === 'auth-token') return { value: 'valid-token' };
          return undefined;
        }),
      },
    } as any;

    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/dashboard',
      })
    );
  });

  it('should block unauthorized access to AI chat API', () => {
    request = {
        nextUrl: { pathname: '/api/chat' },
        url: 'http://localhost:3000/api/chat',
        cookies: { get: vi.fn().mockReturnValue(undefined) }, // No token
    } as any;

    middleware(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Unauthorized" }, 
        { status: 401 }
    );
  });

  it('should allow authorized access to AI chat API', () => {
    request = {
        nextUrl: { pathname: '/api/chat' },
        url: 'http://localhost:3000/api/chat',
        cookies: {
            get: vi.fn((name) => {
              if (name === 'auth-token') return { value: 'valid-token' };
              return undefined;
            }),
        },
    } as any;

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });
});
