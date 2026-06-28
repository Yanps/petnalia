# shellcheck shell=bash
# PetNalia — activate the project-isolated gcloud configuration.
#
#   source infra/gcloud/activate.sh
#
# Points gcloud at PetNalia's own config dir (./.gcloud) for THIS SHELL ONLY.
# Your global gcloud config (e.g. the Workfuse account) is never touched.
# Run `deactivate-gcloud` (defined below) or just open a new shell to revert.

_petnalia_root="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )/../.." && pwd )"
export CLOUDSDK_CONFIG="${_petnalia_root}/.gcloud"
unset _petnalia_root

deactivate-gcloud() {
  unset CLOUDSDK_CONFIG
  echo "gcloud → back to global config (~/.config/gcloud)."
}

echo "gcloud → PetNalia isolated config: ${CLOUDSDK_CONFIG}"
gcloud config list 2>/dev/null | sed -n '1,4p'
