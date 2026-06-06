import { NextResponse } from 'next/server';

export function handleApiError(error: any, logLabel: string): NextResponse {
  console.error(`${logLabel} Error:`, error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
  }

  // Hide Prisma or native database errors from the client response (prevent CWE-209)
  return NextResponse.json(
    { success: false, error: 'Terjadi kesalahan server' },
    { status: 500 }
  );
}
