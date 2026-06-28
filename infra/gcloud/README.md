# gcloud — PetNalia (isolated, personal account)

PetNalia uses its **own gcloud configuration**, fully isolated from any other gcloud
setup on this machine (e.g. the Workfuse account). The isolation is done with the
`CLOUDSDK_CONFIG` environment variable pointing at **`./.gcloud`** in the repo root,
so the personal account/project live only inside this project.

- **Personal account:** `yanpessoa000@gmail.com`
- **Global config (untouched):** the Workfuse account remains the default everywhere else.
- `./.gcloud/` holds credentials → it is **gitignored** and MUST never be committed.

## Automatic (per directory) — default

A one-line hook in `~/.bashrc` sources [`dir-hook.sh`](./dir-hook.sh), which points gcloud at
`./.gcloud` **whenever your shell is inside this project** and reverts to the global config
(Workfuse) when you leave. No manual step, nothing leaks into the global config.

```bash
# in ~/.bashrc (added once):
source /home/yanps/workspace/petnalia/infra/gcloud/dir-hook.sh
```

Verify:

```bash
cd ~/workspace/petnalia && gcloud config list   # account = yanpessoa000@gmail.com
cd ~/workspace        && gcloud config list     # back to the Workfuse account
echo "$CLOUDSDK_CONFIG"                          # set only while inside petnalia/
```

After editing `~/.bashrc`, reload it (`source ~/.bashrc`) or open a new terminal.

> **Manual fallback:** `source infra/gcloud/activate.sh` forces the isolated config in the
> current shell regardless of directory; `deactivate-gcloud` reverts it. Rarely needed now.

## First-time setup (run once — interactive, do this yourself)

With the config activated:

```bash
# 1) Authenticate the CLI as the personal account (opens a browser; pick yanpessoa000@gmail.com)
gcloud auth login

# 2) Find / set the personal project
gcloud projects list
gcloud config set project <YOUR_PERSONAL_PROJECT_ID>

# 3) (optional) Application Default Credentials — for local SDKs/libraries (e.g. GCS)
gcloud auth application-default login

# verify
gcloud auth list
gcloud config list
```

> These steps are interactive and account-sensitive, so they are not run automatically.
> The CLI account and project are already pre-set in `./.gcloud`; you only need the logins above.

## Notes

- **Staging/Production** MUST NOT use these personal credentials. CI/CD authenticates via
  a dedicated **service account** (GitHub Actions → Workload Identity Federation or a SA key
  stored as a secret), per the deployment strategy in
  [docs/architecture/ARCHITECTURE.md](../../docs/architecture/ARCHITECTURE.md) §14.
- Anything run **without** `source infra/gcloud/activate.sh` uses your global gcloud config.
