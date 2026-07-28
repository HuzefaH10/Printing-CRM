import { NextResponse } from 'next/server';

// TEMPORARY DEBUG ENDPOINT - DELETE AFTER FIXING
export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '(NOT SET)';
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '(NOT SET)';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '(NOT SET)';
  
  return NextResponse.json({
    apiKey_first5: apiKey.substring(0, 5),
    apiKey_last5: apiKey.substring(apiKey.length - 5),
    apiKey_length: apiKey.length,
    authDomain,
    projectId,
    allEnvKeysWithFirebase: Object.keys(process.env).filter(k => k.includes('FIREBASE')).sort(),
  });
}
