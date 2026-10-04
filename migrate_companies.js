const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('C:/Users/HP/Downloads/serviceAccountKey.json');

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function checkCompanies() {
  const compsSnap = await db.collection('companies').get();
  console.log(`Total companies in 'companies' collection: ${compsSnap.size}`);
  
  for (const doc of compsSnap.docs) {
    const data = doc.data();
    console.log(`Found company: ${data.name || data.organizationName}`);
    // copy to organizations
    await db.collection('organizations').doc(doc.id).set(data);
    await db.collection('companies').doc(doc.id).delete();
    console.log(`Migrated ${data.name} to organizations.`);
  }
}

checkCompanies().catch(console.error);
