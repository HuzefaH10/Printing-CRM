const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('C:/Users/HP/Downloads/serviceAccountKey.json');

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function checkProspects() {
  const prospectsSnap = await db.collection('prospects').get();
  console.log(`Total prospects: ${prospectsSnap.size}`);
  
  for (const doc of prospectsSnap.docs) {
    const data = doc.data();
    if (data.status === 'Converted' || data.convertedCompanyId || (data.organizationName && (data.organizationName.includes('Aafaq') || data.organizationName.includes('Agility')))) {
      console.log(`Found prospect: ${data.organizationName} - Status: ${data.status} - convertedCompanyId: ${data.convertedCompanyId}`);
      if (data.convertedCompanyId) {
        // check organizations
        const org = await db.collection('organizations').doc(data.convertedCompanyId).get();
        console.log(`  exists in organizations? ${org.exists}`);
        const comp = await db.collection('companies').doc(data.convertedCompanyId).get();
        console.log(`  exists in companies? ${comp.exists}`);
      }
    }
  }
}

checkProspects().catch(console.error);
