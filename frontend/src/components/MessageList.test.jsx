import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageList from './MessageList';

describe('MessageList component', () => {
  const mockMessages = [
    {
      role: 'ai',
      content: `Hey there, You have uploaded The Great Gatsby.pdf.

Try out questions:
1. What is the significance of the 'valley of ashes'?
2. In what ways does Fitzgerald critique the upper-class society?`,
      sources: [{ pageNumber: 43, snippet: 'In his blue gardens men and girls came and went...' }],
    },
    {
      role: 'user',
      content: 'How does the story end?',
    },
  ];

  it('renders both assistant and user messages', () => {
    render(
      <MessageList
        messages={mockMessages}
        isTyping={false}
        user={{ email: 'tester@example.com' }}
      />
    );

    expect(screen.getByText(/Hey there, You have uploaded The Great Gatsby\.pdf\./i)).toBeDefined();
    expect(screen.getByText('How does the story end?')).toBeDefined();
  });

  it('renders interactive try out questions and handles click', () => {
    const handleSelectQuestion = vi.fn();
    render(
      <MessageList
        messages={mockMessages}
        isTyping={false}
        onSelectQuestion={handleSelectQuestion}
        user={{ email: 'tester@example.com' }}
      />
    );

    const questionItem = screen.getByText(/What is the significance of the 'valley of ashes'\?/i);
    expect(questionItem).toBeDefined();

    fireEvent.click(questionItem);
    expect(handleSelectQuestion).toHaveBeenCalled();
  });

  it('renders citation source button and displays snippet on click', () => {
    render(
      <MessageList
        messages={mockMessages}
        isTyping={false}
        user={{ email: 'tester@example.com' }}
      />
    );

    const pageBtn = screen.getByRole('button', { name: /Page 43/i });
    expect(pageBtn).toBeDefined();

    fireEvent.click(pageBtn);
    expect(screen.getByText(/In his blue gardens men and girls came and went/i)).toBeDefined();
  });

  it('renders typing indicator when isTyping is true', () => {
    render(
      <MessageList
        messages={mockMessages}
        isTyping={true}
        user={{ email: 'tester@example.com' }}
      />
    );

    expect(screen.getByText(/Analyzing document/i)).toBeDefined();
  });
});
