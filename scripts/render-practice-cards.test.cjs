const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {renderCards,validate}=require('./render-practice-cards.cjs');
const repo=path.join(__dirname,'..');
// Fixed fixtures: changing the owner's live counts must not change test expectations.
const original={
  swea:{updatedAt:'2026-09-07',solvedByDifficulty:{D1:22,D2:31,D3:58,D4:21,D5:5,D6:2,D7:0,D8:0},submittedProblems:158,masterProblems:8,completedCourses:2,joinedClubs:4},
  boj:{updatedAt:'2026-09-07',solvedByTier:{Bronze:46,Silver:22,Gold:30,Platinum:3,Diamond:0,Ruby:0},selectedTags:{implementation:44,math:38,graphTheory:18,dynamicProgramming:15}}
};
function fixture(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'practice-card-test-'));
  t.after(()=>{
    const resolved=path.resolve(root);
    assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('practice-card-test-'));
    fs.rmSync(resolved,{recursive:true,force:true});
  });
  fs.mkdirSync(path.join(root,'data'));
  fs.mkdirSync(path.join(root,'assets'));
  fs.copyFileSync(path.join(repo,'README.md'),path.join(root,'README.md'));
  fs.writeFileSync(path.join(root,'assets/keep.txt'),'unrelated asset');
  const write=data=>fs.writeFileSync(path.join(root,'data/practice-stats.json'),JSON.stringify(data));
  write(original);
  return {root,write};
}
test('JSON changes update totals, scale, bars, dates, alt text and cache URLs',t=>{
  const {root,write}=fixture(t);
  const before=renderCards(root);
  const changed=structuredClone(original);
  changed.swea.solvedByDifficulty.D3=159;
  changed.swea.submittedProblems=250;
  changed.swea.updatedAt='2026-09-08';
  changed.boj.solvedByTier.Bronze=61;
  changed.boj.selectedTags.implementation=99;
  write(changed);
  const after=renderCards(root);
  assert.equal(after.sweaTotal,240);
  assert.equal(after.bojTotal,116);
  assert.equal(after.scale,160);
  assert.ok(after.files.every(f=>!before.files.includes(f)));
  const sw=fs.readFileSync(path.join(root,'assets',after.files.find(f=>f.startsWith('swea-card-bars-dark'))),'utf8');
  assert.match(sw,/width="243\.46875"/);
  assert.match(sw,/0–160 problems/);
  assert.match(sw,/Snapshot · 2026-09-08/);
  const boj=fs.readFileSync(path.join(root,'assets',after.files.find(f=>f.startsWith('boj-card-bars-dark'))),'utf8');
  assert.match(boj,/Snapshot · 2026-09-07/);
  assert.match(boj,/>99<\/text>/);
  const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
  assert.match(readme,/alt="SWEA snapshot 2026-09-08: 240 solved problems/);
  assert.match(readme,/alt="BOJ snapshot 2026-09-07: 116 solved problems/);
  assert.ok(before.files.every(f=>!fs.existsSync(path.join(root,'assets',f))));
  assert.equal(fs.readFileSync(path.join(root,'assets/keep.txt'),'utf8'),'unrelated asset');
  assert.deepEqual(renderCards(root),after);
  assert.equal(fs.readFileSync(path.join(root,'README.md'),'utf8'),readme);
  assert.equal(fs.readdirSync(path.join(root,'assets')).length,5);
});
test('all-zero records produce valid charts and a nonzero common scale',t=>{
  const {root,write}=fixture(t);
  const data=structuredClone(original);
  for(const group of [data.swea.solvedByDifficulty,data.boj.solvedByTier,data.boj.selectedTags]) {
    for(const key of Object.keys(group)) group[key]=0;
  }
  for(const key of ['submittedProblems','masterProblems','completedCourses','joinedClubs']) data.swea[key]=0;
  write(data);
  const result=renderCards(root);
  assert.equal(result.sweaTotal,0);
  assert.equal(result.bojTotal,0);
  assert.equal(result.scale,10);
  for(const file of result.files) assert.doesNotMatch(fs.readFileSync(path.join(root,'assets',file),'utf8'),/NaN|Infinity/);
});
test('invalid input is rejected before existing output changes',t=>{
  const {root,write}=fixture(t);
  const current=renderCards(root);
  const before=fs.readFileSync(path.join(root,'README.md'),'utf8');
  const cases=[
    d=>{d.swea.solvedByDifficulty.D3=-1;},
    d=>{d.swea.solvedByDifficulty.D3=1.5;},
    d=>{d.swea.solvedByDifficulty.D3='59';},
    d=>{delete d.boj.solvedByTier.Gold;},
    d=>{d.boj.selectedTags.math=null;},
    d=>{d.swea.updatedAt='2026-02-30';},
    d=>{d.swea.updatedAt='2026-9-7';},
    d=>{d.swea.submittedProblems=Number.MAX_SAFE_INTEGER+1;},
  ];
  for(const mutate of cases) {
    const data=structuredClone(original);mutate(data);write(data);
    assert.throws(()=>renderCards(root));
    assert.equal(fs.readFileSync(path.join(root,'README.md'),'utf8'),before);
    assert.ok(current.files.every(f=>fs.existsSync(path.join(root,'assets',f))));
  }
  fs.writeFileSync(path.join(root,'data/practice-stats.json'),'{broken');
  assert.throws(()=>renderCards(root));
  assert.equal(fs.readFileSync(path.join(root,'README.md'),'utf8'),before);
});
test('missing README image references fail without publishing partial images',t=>{
  const {root}=fixture(t);
  fs.writeFileSync(path.join(root,'README.md'),'# Custom README\n');
  assert.throws(()=>renderCards(root),/Missing/);
  assert.deepEqual(fs.readdirSync(path.join(root,'assets')),['keep.txt']);
});
test('current data validates',()=>assert.doesNotThrow(()=>validate(JSON.parse(fs.readFileSync(path.join(repo,'data/practice-stats.json'),'utf8')))));
