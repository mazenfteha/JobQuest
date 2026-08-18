// This standalone verification script is intentionally outside the TypeScript project.
// @ts-nocheck
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    failures.push(label);
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* 204 no body */
  }
  return { status: res.status, data };
}

const expectStatus = (label, r, status) =>
  check(label, r.status === status, `got ${r.status}, want ${status}`);

(async () => {
  console.log(`Verifying ${BASE}`);

  // ---- dashboard (clean baseline) ----
  let r = await req('GET', '/dashboard');
  expectStatus('GET /dashboard', r, 200);
  check('dashboard.user.level starts at 1', r.data?.user?.level === 1);

  let expectedXp = 0;

  // ---- jobs ----
  const jobA = {
    title: 'Backend Developer',
    company: 'Acme',
    location: 'Remote',
    url: 'https://verify.example.com/jobs/1',
    source: 'linkedin',
  };
  const jobB = {
    title: 'Frontend Developer',
    company: 'Acme',
    url: 'https://verify.example.com/jobs/2',
  };

  r = await req('POST', '/jobs', jobA);
  expectStatus('POST /jobs (new)', r, 201);
  check('job saved -> SAVED', r.data?.application?.status === 'SAVED');
  check('JOB_SAVED awards +10', r.data?.xpAward?.xpGained === 10);
  expectedXp += 10;

  r = await req('POST', '/jobs', jobA);
  expectStatus('POST /jobs (dup url)', r, 409);

  r = await req('POST', '/jobs', jobB);
  expectStatus('POST /jobs (2nd)', r, 201);
  expectedXp += 10;

  // ---- applications ----
  r = await req('GET', '/applications');
  expectStatus('GET /applications', r, 200);
  const apps = r.data;
  check('2 applications listed', Array.isArray(apps) && apps.length === 2);

  r = await req('GET', '/applications?status=SAVED');
  expectStatus('GET /applications?status=SAVED', r, 200);
  check('status filter works', r.data.every((a) => a.status === 'SAVED'));

  const appId = apps[0].id;
  r = await req('GET', `/applications/${appId}`);
  expectStatus('GET /applications/:id', r, 200);
  check('detail includes job', Boolean(r.data?.job?.title));

  r = await req('PATCH', `/applications/${appId}/status`, { status: 'APPLIED' });
  expectStatus('PATCH -> APPLIED', r, 200);
  check('APPLIED awards +50', r.data?.xpAward?.xpGained === 50);
  check('appliedAt set', Boolean(r.data?.application?.appliedAt));
  expectedXp += 50;

  r = await req('PATCH', `/applications/${appId}/status`, { status: 'OFFER' });
  expectStatus('PATCH SAVED->OFFER blocked', r, 400);
  check('invalid transition message', /Invalid status transition/.test(r.data?.message ?? ''));

  r = await req('PATCH', `/applications/${appId}/status`, { status: 'INTERVIEW' });
  expectStatus('PATCH -> INTERVIEW', r, 200);
  check('INTERVIEW awards +100', r.data?.xpAward?.xpGained === 100);
  expectedXp += 100;

  r = await req('PATCH', `/applications/${appId}/status`, { status: 'APPLIED' });
  expectStatus('PATCH re-set APPLIED blocked', r, 400);

  r = await req('PATCH', `/applications/${appId}/status`, { status: 'OFFER' });
  expectStatus('PATCH -> OFFER', r, 200);
  check('OFFER awards +500', r.data?.xpAward?.xpGained === 500);
  expectedXp += 500;

  r = await req('PATCH', `/applications/${appId}/status`, { status: 'REJECTED' });
  expectStatus('PATCH from terminal OFFER blocked', r, 400);

  // ---- activities ----
  r = await req('POST', '/activities/manual-log', { type: 'NETWORKING' });
  expectStatus('POST /activities/manual-log', r, 201);
  check('manual log awards +10', r.data?.xpGained === 10);
  expectedXp += 10;

  r = await req('POST', '/activities/manual-log', { type: 'LEETCODE' });
  expectStatus('manual-log rejects non-manual type', r, 400);

  r = await req('GET', '/activities?limit=2');
  expectStatus('GET /activities?limit=2', r, 200);
  check('limit applied', r.data.length <= 2);

  // ---- quests ----
  r = await req('POST', '/quests', { title: 'Solve 2 mediums', category: 'LEETCODE', xpReward: 20 });
  expectStatus('POST /quests', r, 201);
  check('quest starts OPEN', r.data?.status === 'OPEN');
  const questId = r.data.id;

  r = await req('PATCH', `/quests/${questId}/complete`);
  expectStatus('PATCH /quests/:id/complete', r, 200);
  check('quest complete +20 (xpReward)', r.data?.xpAward?.xpGained === 20);
  check('quest status DONE', r.data?.quest?.status === 'DONE');
  expectedXp += 20;

  r = await req('PATCH', `/quests/${questId}/complete`);
  expectStatus('re-complete quest blocked', r, 400);

  r = await req('POST', '/quests', { title: 'Read a chapter', category: 'READING', xpReward: 5 });
  const openQuestId = r.data.id;
  r = await req('DELETE', `/quests/${openQuestId}`);
  expectStatus('DELETE open quest', r, 204);
  r = await req('DELETE', `/quests/${questId}`);
  expectStatus('DELETE done quest blocked', r, 400);

  // ---- achievements ----
  r = await req('GET', '/achievements');
  expectStatus('GET /achievements', r, 200);
  const byKey = Object.fromEntries(r.data.map((a) => [a.key, a]));
  check('first_hunt unlocked', byKey.first_hunt?.unlocked === true);
  check('first_blood unlocked', byKey.first_blood?.unlocked === true);
  check('interview_ready unlocked', byKey.interview_ready?.unlocked === true);
  check('boss_defeated unlocked', byKey.boss_defeated?.unlocked === true);
  check('on_fire locked (streak < 3)', byKey.on_fire?.unlocked === false);
  check('sharp_shooter locked (< 10 apps)', byKey.sharp_shooter?.unlocked === false);

  // ---- dashboard + xp accounting ----
  r = await req('GET', '/dashboard');
  expectStatus('GET /dashboard (final)', r, 200);
  check(
    `xp accounting correct (${r.data?.user?.xp} == ${expectedXp})`,
    r.data?.user?.xp === expectedXp,
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('Failures:', failures.join(', '));
    process.exit(1);
  }
})();