
import { NextResponse } from 'next/server';
import { processAndSaveTransaction } from '@/lib/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This is necessary for verifying the user's auth token on the server-side.
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)),
      });
    } catch (e) {
        console.error('Failed to initialize Firebase Admin SDK:', e);
    }
  } else {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Voice commands will not be authenticated.');
  }
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
    // The 'description' from Vapi's function call contains the raw user utterance.
    const rawText = functionCall.parameters.description;
    
    if (!rawText || typeof rawText !== 'string') {
       return NextResponse.json({ error: 'Invalid parameters: description text is missing.' }, { status: 400 });
    }

    // Use the centralized "Firebase Integration Agent" to process and save the transaction.
    // This will trigger the full AI agent workflow.
    await processAndSaveTransaction(userId, rawText);

    return NextResponse.json({ success: true, message: 'Transaction processed and added successfully.' });
  } catch (error) {
    console.error('Error processing addExpense function call:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
