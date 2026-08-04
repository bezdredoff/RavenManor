import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/ui/GameApp.ts',
  'src/style.css',
  'src/appVersion.ts',
  'docs/03-art/STORY_JOURNAL_VISUALS.md',
  'tasks/features/feature-068-journal-narrative-ui.md',
  'tests/Feature068JournalUi.test.ts',
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`FEATURE-068 missing: ${file}`);
}

const app = readFileSync('src/ui/GameApp.ts', 'utf8');
const styles = readFileSync('src/style.css', 'utf8');
const version = readFileSync('src/appVersion.ts', 'utf8');
const test = readFileSync('tests/Feature068JournalUi.test.ts', 'utf8');

for (const hook of [
  'journal-book',
  'data-journal-room-tab=',
  'journal-page',
  'journal-entry-grid',
  'data-journal-entry-id=',
  'data-journal-status=',
  'data-journal-importance=',
  'data-journal-room=',
  'journal-entry-action',
  'journal-continue',
]) {
  if (!app.includes(hook)) throw new Error(`FEATURE-068 runtime hook missing: ${hook}`);
}

for (const selector of [
  '.journal-book-cover',
  '.journal-ledger',
  '.journal-room-tabs',
  '.journal-room-tab--selected',
  '.journal-page-header',
  '.journal-entry-grid',
  '.journal-entry--new',
  '.journal-entry--viewed',
  '.journal-entry--locked',
  '.journal-entry--major',
  '.journal-entry-action',
]) {
  if (!styles.includes(selector)) throw new Error(`FEATURE-068 style missing: ${selector}`);
}

const featureStart = styles.indexOf('FEATURE-068B: rejected card-stack pass replaced by a book, chapter index, and selected folio.');
const featureEnd = styles.indexOf('/* FEATURE-053', featureStart);
const featureStyles = styles.slice(featureStart, featureEnd);
if (featureStart < 0 || featureEnd < 0) throw new Error('FEATURE-068 CSS block is missing.');
if (featureStyles.includes('.story-portrait')) {
  throw new Error('FEATURE-068 must not change story portrait CSS.');
}
if (styles.indexOf('HOTFIX-066A — smaller story portraits') < featureEnd) {
  throw new Error('HOTFIX-066A must remain after FEATURE-068 journal styles.');
}
if (
  !version.includes('0.10.3-playtest.068b-journal-book-ui')
  && !version.includes('0.10.4-playtest.069-unified-ui-kit')
) {
  throw new Error('FEATURE-068B or a verified successor version marker is missing.');
}
if (!test.includes('FEATURE-068B journal book visual contract')) {
  throw new Error('FEATURE-068 regression test is missing.');
}

if (!app.includes('this.showStoryJournal(false)')) {
  throw new Error('FEATURE-068B room-tab navigation is not connected.');
}

console.log('FEATURE-068B verification passed. Book cover, room index, selected folio, and journal states are connected.');
