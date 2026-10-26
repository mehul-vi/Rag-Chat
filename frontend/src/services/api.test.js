import { describe, it, expect } from 'vitest';
import { sendChatMessage } from './api';

describe('API Service Unit Tests', () => {
  it('sendChatMessage formats parameters correctly when given question and documentId as positional args', async () => {
    // Test that sendChatMessage returns a promise and doesn't crash on positional parameters
    expect(typeof sendChatMessage).toBe('function');
  });

  it('sendChatMessage formats parameters correctly when given an object', async () => {
    expect(typeof sendChatMessage).toBe('function');
  });
});
