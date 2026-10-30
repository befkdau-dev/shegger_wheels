// Tiny module-level flag so a deliberate sign-out is not mistaken for "session expired" by
// <RoleGate />, which would otherwise redirect to /signin?next=<current page> before the
// navigation to the landing page completes.
let signingOut = false;
let timer = null;

export function beginSignOut() {
  signingOut = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    signingOut = false;
  }, 2000);
}

export function isSigningOut() {
  return signingOut;
}
