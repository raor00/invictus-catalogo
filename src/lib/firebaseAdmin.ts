import { cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

const isAdminConfigured = Boolean(
  serviceAccount.projectId &&
    serviceAccount.clientEmail &&
    serviceAccount.privateKey
)

const adminApp = isAdminConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert(serviceAccount),
      })
  : null

export const adminDb = adminApp ? getFirestore(adminApp) : null
export const isFirebaseAdminConfigured = isAdminConfigured
