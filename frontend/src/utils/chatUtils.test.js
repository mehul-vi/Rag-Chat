import { describe, it, expect } from 'vitest';
import {
  getUserAvatarUrl,
  getUserInitial,
  isInteractiveQuestion,
  cleanQuestionText,
  extractTextFromReactNode,
} from './chatUtils';

describe('Chat Utilities Unit Tests', () => {
  it('getUserAvatarUrl returns user.photoURL if available', () => {
    const user = { photoURL: 'https://example.com/photo.jpg', email: 'mehul@test.com' };
    expect(getUserAvatarUrl(user)).toBe('https://example.com/photo.jpg');
  });

  it('getUserAvatarUrl generates unavatar based on user email', () => {
    const user = { email: 'mehul@gmail.com' };
    const url = getUserAvatarUrl(user);
    expect(url).toContain('unavatar.io');
    expect(url).toContain('mehul%40gmail.com');
  });

  it('getUserInitial extracts the first letter correctly', () => {
    expect(getUserInitial({ email: 'mehul@gmail.com' })).toBe('M');
    expect(getUserInitial({ displayName: 'John Doe' })).toBe('J');
    expect(getUserInitial(null)).toBe('U');
  });

  it('isInteractiveQuestion detects question sentences', () => {
    expect(isInteractiveQuestion('What is the significance of the valley of ashes?')).toBe(true);
    expect(isInteractiveQuestion('How does the story end?')).toBe(true);
    expect(isInteractiveQuestion('In what ways does Fitzgerald critique the upper class?')).toBe(true);
    expect(isInteractiveQuestion('This is just a statement.')).toBe(false);
  });

  it('cleanQuestionText strips leading numbering', () => {
    expect(cleanQuestionText('1. What is the valley of ashes?')).toBe('What is the valley of ashes?');
    expect(cleanQuestionText('2) How does the story end?')).toBe('How does the story end?');
    expect(cleanQuestionText('How does the story end?')).toBe('How does the story end?');
  });

  it('extractTextFromReactNode handles nested strings and arrays', () => {
    expect(extractTextFromReactNode('Simple string')).toBe('Simple string');
    expect(extractTextFromReactNode(['Part 1', ' and ', 'Part 2'])).toBe('Part 1 and Part 2');
    expect(extractTextFromReactNode(null)).toBe('');
  });
});

