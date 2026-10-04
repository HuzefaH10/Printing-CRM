const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('C:/Users/HP/Downloads/serviceAccountKey.json');
const fs = require('fs');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function findSleepingLeads() {
  const prospectsSnap = await db.collection('prospects').get();
  const allProspects = prospectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const sleepingLeads = [];
  const manualOrActive = [];

  for (const p of allProspects) {
    const hasWebsite = !!(p.website && p.website.trim() !== '');
    const hasEmail = !!(p.decisionMakerEmail && p.decisionMakerEmail.trim() !== '');
    const hasPhone = !!(p.decisionMakerPhone && p.decisionMakerPhone.trim() !== '');

    if (!hasWebsite && !hasEmail && !hasPhone) {
      // It meets sleeping criteria.
      // Check exclusion:
      if (p.outsourcingStatus === 'Confirmed' || p.outsourcingStatus === 'Likely') {
        manualOrActive.push({ name: p.organizationName, reason: `Market Intelligence flag (${p.outsourcingStatus})` });
        continue;
      }
      
      if (p.notes && p.notes.trim() !== '') {
        manualOrActive.push({ name: p.organizationName, reason: 'Has logged notes/activity' });
        continue;
      }

      if (p.opportunityId || p.status === 'Converted') {
        manualOrActive.push({ name: p.organizationName, reason: 'Has opportunity or converted' });
        continue;
      }

      sleepingLeads.push(p);
    }
  }

  const output = {
    totalSleepingFound: sleepingLeads.length,
    sleepingLeads: sleepingLeads.map(p => ({
      id: p.id,
      name: p.organizationName,
      rating: p.rating || 'No Rating'
    })),
    manualOrActiveCount: manualOrActive.length,
    manualOrActiveExample: manualOrActive.slice(0, 5)
  };

  fs.writeFileSync('sleeping_leads.json', JSON.stringify(output, null, 2));
  console.log(`Found ${sleepingLeads.length} sleeping leads.`);
}

findSleepingLeads().catch(console.error);
