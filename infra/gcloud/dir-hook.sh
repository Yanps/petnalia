# shellcheck shell=bash
# PetNalia — per-directory gcloud isolation (no direnv needed).
# Source this once from your ~/.bashrc:
#   source /home/yanps/workspace/petnalia/infra/gcloud/dir-hook.sh
#
# It auto-points gcloud at PetNalia's isolated config (./.gcloud) WHENEVER your
# shell's current directory is inside the project, and reverts to the global
# config (Workfuse) when you leave. Nothing leaks into the global config.

_PETNALIA_DIR="/home/yanps/workspace/petnalia"
_PETNALIA_GCLOUD="${_PETNALIA_DIR}/.gcloud"

_petnalia_gcloud_hook() {
  case "$PWD/" in
    "${_PETNALIA_DIR}"/*)
      export CLOUDSDK_CONFIG="$_PETNALIA_GCLOUD" ;;
    *)
      # Only unset if WE set it — never clobber another tool's CLOUDSDK_CONFIG.
      [ "${CLOUDSDK_CONFIG:-}" = "$_PETNALIA_GCLOUD" ] && unset CLOUDSDK_CONFIG ;;
  esac
}

# Register the hook to run before every prompt (idempotent).
case "${PROMPT_COMMAND:-}" in
  *_petnalia_gcloud_hook*) ;;
  *) PROMPT_COMMAND="_petnalia_gcloud_hook${PROMPT_COMMAND:+; ${PROMPT_COMMAND}}" ;;
esac

# Apply immediately for the current shell.
_petnalia_gcloud_hook
