import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  ErrorType,
  handleSupabaseError,
  handleFetchError,
  safeFetch,
  retryWithBackoff,
} from '../errorHandler';

describe('errorHandler', () => {
  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.code).toBe('');
      expect(error.status).toBe(0);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create AppError with custom values', () => {
      const error = new AppError(
        'Custom error',
        ErrorType.VALIDATION,
        'CUSTOM_CODE',
        400
      );

      expect(error.message).toBe('Custom error');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.status).toBe(400);
    });
  });

  describe('handleSupabaseError', () => {
    it('should handle auth error with email not confirmed', () => {
      const supabaseError = {
        message: 'Email not confirmed',
        status: 400,
      };

      const result = handleSupabaseError(supabaseError);

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.message).toBe(
        '邮箱尚未验证，请检查您的邮箱并点击验证链接后再登录'
      );
    });

    it('should handle invalid credentials error', () => {
      const supabaseError = {
        message: 'Invalid login credentials',
        status: 400,
      };

      const result = handleSupabaseError(supabaseError);

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.message).toBe('邮箱或密码错误');
    });

    it('should handle network error', () => {
      const supabaseError = {
        message: 'Failed to fetch',
        status: 0,
      };

      const result = handleSupabaseError(supabaseError);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.message).toBe('网络连接失败，请检查您的网络连接');
    });

    it('should handle string error', () => {
      const result = handleSupabaseError('Simple error message');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Simple error message');
    });

    it('should handle Error object', () => {
      const error = new Error('Standard error');
      const result = handleSupabaseError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Standard error');
    });
  });

  describe('handleFetchError', () => {
    it('should handle fetch error with response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({ message: 'Resource not found' }),
      } as any;

      const result = await handleFetchError(mockResponse);

      expect(result.type).toBe(ErrorType.NOT_FOUND);
      expect(result.message).toBe('Resource not found');
      expect(result.status).toBe(404);
    });

    it('should handle fetch error without json response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any;

      const result = await handleFetchError(mockResponse);

      expect(result.type).toBe(ErrorType.SERVER);
      expect(result.message).toBe('服务器内部错误');
      expect(result.status).toBe(500);
    });
  });

  describe('safeFetch', () => {
    it('should return successful response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await safeFetch('/api/test');

      expect(result).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/test', undefined);
    });

    it('should throw AppError for failed response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({ message: 'Invalid data' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(safeFetch('/api/test')).rejects.toThrow(AppError);
    });

    it('should throw AppError for network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(safeFetch('/api/test')).rejects.toThrow(AppError);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn, 3, 100);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn, 3, 10);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(retryWithBackoff(mockFn, 2, 10)).rejects.toThrow(
        'Persistent failure'
      );
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
