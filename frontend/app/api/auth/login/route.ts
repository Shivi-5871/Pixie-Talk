
import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await login(username, password);
    return NextResponse.json({ success: true, user: result.user });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Invalid credentials' },
      { status: 401 }
    );
  }
}
