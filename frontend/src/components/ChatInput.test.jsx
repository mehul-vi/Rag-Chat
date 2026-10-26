import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from './ChatInput';

describe('ChatInput component', () => {
  it('renders textarea with placeholder and browse prompts button', () => {
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <ChatInput
        inputValue=""
        onChangeInput={handleChange}
        onSubmit={handleSubmit}
        isUploading={false}
        isTyping={false}
        canChat={true}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask or search anything/i);
    expect(textarea).toBeDefined();

    const browseBtn = screen.getByRole('button', { name: /Browse Prompts/i });
    expect(browseBtn).toBeDefined();
  });

  it('calls onChangeInput when text is typed', () => {
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <ChatInput
        inputValue=""
        onChangeInput={handleChange}
        onSubmit={handleSubmit}
        isUploading={false}
        isTyping={false}
        canChat={true}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask or search anything/i);
    fireEvent.change(textarea, { target: { value: 'What is Gatsby?' } });
    expect(handleChange).toHaveBeenCalledWith('What is Gatsby?');
  });

  it('triggers onSubmit on Enter key without shift', () => {
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <ChatInput
        inputValue="Tell me about Daisy"
        onChangeInput={handleChange}
        onSubmit={handleSubmit}
        isUploading={false}
        isTyping={false}
        canChat={true}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask or search anything/i);
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('does NOT trigger onSubmit on Shift+Enter', () => {
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <ChatInput
        inputValue="Line 1"
        onChangeInput={handleChange}
        onSubmit={handleSubmit}
        isUploading={false}
        isTyping={false}
        canChat={true}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask or search anything/i);
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('opens suggestions menu when Browse Prompts is clicked and selects prompt', () => {
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <ChatInput
        inputValue=""
        onChangeInput={handleChange}
        onSubmit={handleSubmit}
        isUploading={false}
        isTyping={false}
        canChat={true}
      />
    );

    const browseBtn = screen.getByRole('button', { name: /Browse Prompts/i });
    fireEvent.click(browseBtn);

    const promptOption = screen.getByText(/What are the key points\?/i);
    expect(promptOption).toBeDefined();

    fireEvent.click(promptOption);
    expect(handleChange).toHaveBeenCalledWith('What are the key points?');
  });
});
