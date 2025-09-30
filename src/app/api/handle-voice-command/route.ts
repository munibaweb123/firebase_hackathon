import { NextResponse } from 'next/server';
import { addTransaction } from '@/lib/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This is necessary for verifying the user's auth token on the server-side.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  const userId = decodedToken.uid;
  const body = await request.json();

  const { functionCall } = body;

  if (!functionCall || functionCall.name !== 'addExpense') {
    return NextResponse.json({ error: 'Invalid function call' }, { status: 400 });
  }

  try {
    const { amount, category, description } = functionCall.parameters;

    if (typeof amount !== 'number' || typeof category !== 'string' || typeof description !== 'string') {
        return NextResponse.json({ error: 'Invalid parameters for addExpense' }, { status: 400 });
    }

    await addTransaction(userId, {
      amount,
      category,
      description,
      date: new Date(),
      type: 'expense',
    });

    return NextResponse.json({ success: true, message: 'Transaction added successfully.' });
  } catch (error) {
    console.error('Error processing addExpense function call:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
