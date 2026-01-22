export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidInviteCode(code: string): boolean {
  // 6자리 대문자/숫자 (0,O,1,I,l 제외)
  const codeRegex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
  return codeRegex.test(code);
}

export function isValidPassword(password: string): boolean {
  // 최소 8자, 영문/숫자 포함
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}
