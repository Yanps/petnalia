#!/bin/bash
# protect-files.sh — PreToolUse(Edit|Write) guard.
# Bloqueia edição de arquivos auto-gerados, de ambiente e lockfiles.
# Adaptado para PetNalia: inclui prisma/migrations/ (geradas via `prisma migrate dev`,
# nunca editadas manualmente — CLAUDE.md/ARCHITECTURE.md).

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

PROTECTED_PATTERNS=(
  ".env"
  "pnpm-lock.yaml"
  "node_modules/"
  ".next/"
  ".turbo/"
  "prisma/migrations/"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: '$FILE_PATH' matches protected pattern '$pattern'. These files should not be manually edited." >&2
    exit 2
  fi
done

exit 0
