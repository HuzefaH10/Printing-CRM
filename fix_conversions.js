const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('C:/Users/HP/Downloads/serviceAccountKey.json');

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function fixBrokenConversions() {
  console.log("Fixing broken conversions...");
  
  // Find prospects that are Converted
  const prospectsSnap = await db.collection('prospects').where('status', '==', 'Converted').get();
  console.log(`Found ${prospectsSnap.size} converted prospects.`);

  for (const doc of prospectsSnap.docs) {
    const data = doc.data();
    if (data.convertedCompanyId) {
      // Check if it exists in 'organizations'
      const orgDoc = await db.collection('organizations').doc(data.convertedCompanyId).get();
      if (!orgDoc.exists()) {
        // Check if it exists in 'companies'
        const compDoc = await db.collection('companies').doc(data.convertedCompanyId).get();
        if (compDoc.exists()) {
          console.log(`Moving company ${data.convertedCompanyId} to organizations collection...`);
          await db.collection('organizations').doc(data.convertedCompanyId).set(compDoc.data());
          // delete the old one? Optional, but good practice
          await db.collection('companies').doc(data.convertedCompanyId).delete();
          console.log(`Successfully migrated ${data.organizationName} to organizations.`);
        } else {
          console.log(`ERROR: Converted prospect ${data.organizationName} has convertedCompanyId ${data.convertedCompanyId} but no record found in either companies or organizations.`);
        }
      } else {
        console.log(`Prospect ${data.organizationName} is already correctly mapped to an organization.`);
      }
    } else {
      console.log(`Prospect ${data.organizationName} is 'Converted' but missing convertedCompanyId.`);
    }
  }
}

fixBrokenConversions().catch(console.error);
