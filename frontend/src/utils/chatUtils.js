/**
 * Helper utility functions for Chat avatar, questions, and formatting
 */

export function getUserAvatarUrl(user, emailFallback = 'user@docanalyzer.com') {
  if (user?.photoURL) return user.photoURL;

  const email = (user?.email || emailFallback || '').trim();
  const displayName = user?.displayName || (email ? email.split('@')[0] : 'User');

  if (!email) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&bold=true`;
  }

  return `https://unavatar.io/${encodeURIComponent(email)}?fallback=https%3A%2F%2Fui-avatars.com%2Fapi%2F%3Fname%3D${encodeURIComponent(displayName)}%26background%3D2563eb%26color%3Dfff%26bold%3Dtrue`;
}

export function getUserInitial(user, fallback = 'U') {
  const email = (user?.email || '').trim();
  const name = user?.displayName || (email ? email.split('@')[0] : fallback);
  return (name.charAt(0) || fallback).toUpperCase();
}

export function isInteractiveQuestion(text) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.endsWith('?') || trimmed.startsWith('What') || trimmed.startsWith('How') || trimmed.includes('In what');
}

export function cleanQuestionText(rawText) {
  if (typeof rawText !== 'string') return '';
  return rawText.replace(/^\d+[.)]\s*/, '').trim();
}

export function extractTextFromReactNode(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('');
  if (node.props && node.props.children) return extractTextFromReactNode(node.props.children);
  return '';
}
