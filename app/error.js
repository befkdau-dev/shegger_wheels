'use client';

// Route-level error boundary: a crash in one page never blanks the whole app.
export default function GlobalError({ error, reset }) {
  return (
    <main id="main" className="container container-narrow" style={{ paddingTop: 64 }}>
      <div className="card stack" role="alert">
        <h1 style={{ fontSize: '1.6rem' }}>Something went wrong</h1>
        <p className="muted">
          This page hit an unexpected error{error && error.digest ? ` (ref ${error.digest})` : ''}. Your saved demo data was not changed.
          Try again, or go back to the home page.
        </p>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button>
          <a className="btn btn-outline" href="/">Go home</a>
        </div>
      </div>
    </main>
  );
}
