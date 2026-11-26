// Run with: node --test .claude/hooks/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const protectFiles = require("./protect-files.js");
const protectSecrets = require("./protect-secrets.js");
const blockDangerous = require("./block-dangerous-commands.js");

const ENV = ".env"; // kept out of literals so the hooks don't flag this file's own commands

test("protect-files blocks env files, lockfile, generated dirs and migrations", () => {
  for (const p of [
    `/repo/${ENV}`,
    `/repo/apps/api/${ENV}.local`,
    "/repo/pnpm-lock.yaml",
    "/repo/apps/web/.next/server/app.js",
    "/repo/node_modules/x/index.js",
    "/repo/apps/api/prisma/migrations/20260101000000_init/migration.sql",
  ]) {
    assert.equal(protectFiles.check(p).blocked, true, p);
  }
});

test("protect-files allows env templates and regular source", () => {
  for (const p of [
    `/repo/${ENV}.example`,
    "/repo/apps/web/src/lib/environment.ts",
    `/repo/apps/web/src${ENV}ironment/a.ts`,
    "/repo/apps/api/prisma/schema.prisma",
    "/repo/apps/api/src/modules/pets/pets.service.ts",
  ]) {
    assert.equal(protectFiles.check(p).blocked, false, p);
  }
});

test("protect-files fails closed on unparseable input", () => {
  const res = spawnSync("node", [path.join(__dirname, "protect-files.js")], { input: "not json" });
  const out = JSON.parse(res.stdout.toString());
  assert.equal(out.hookSpecificOutput.permissionDecision, "deny");
});

test("protect-secrets blocks reading real env files", () => {
  assert.equal(protectSecrets.check("Bash", { command: `cat apps/api/${ENV}` }).blocked, true);
  assert.equal(protectSecrets.check("Read", { file_path: `/repo/apps/web/${ENV}.local` }).blocked, true);
});

test("protect-secrets allows env templates", () => {
  assert.equal(protectSecrets.check("Bash", { command: `cat ${ENV}.example` }).blocked, false);
  assert.equal(protectSecrets.check("Read", { file_path: `/repo/${ENV}.example` }).blocked, false);
});

test("protect-secrets: a template in the command no longer whitelists a real env read", () => {
  // The old allowlist was end-anchored, so ending the command with a template name let it through.
  for (const command of [
    `cat apps/api/${ENV}; cat ${ENV}.example`,
    `cat ${ENV}.example; cat apps/api/${ENV}`,
  ]) {
    assert.equal(protectSecrets.check("Bash", { command }).blocked, true, command);
  }
});

test("protect-secrets allows routine code searches and xargs pipelines", () => {
  assert.equal(protectSecrets.check("Bash", { command: "grep -rn token apps/web/src" }).blocked, false);
  assert.equal(protectSecrets.check("Bash", { command: "ls src | xargs cat" }).blocked, false);
  assert.equal(
    protectSecrets.check("Bash", { command: `echo apps/api/${ENV} | xargs cat` }).blocked,
    true,
  );
});

test("block-dangerous leaves env templates to protect-secrets", () => {
  assert.equal(blockDangerous.checkCommand(`cat ${ENV}.example`).blocked, false);
});

test("block-dangerous still blocks destructive git and rm", () => {
  for (const cmd of ["git reset --hard HEAD~1", "git push --force origin master", "rm -rf /"]) {
    assert.equal(blockDangerous.checkCommand(cmd).blocked, true, cmd);
  }
  assert.equal(blockDangerous.checkCommand("rm -rf apps/web/.next").blocked, false);
});
