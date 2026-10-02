import WorkflowRunClient from "./WorkflowRunClient";

// Static export (Sprint H phase 2): one prebuilt page serves every workflow run id. The Worker maps
// /runs/<id> to /runs/_ (worker/site.ts), and WorkflowRunClient reads the
// id from the URL. Any other id 404s at build time, which is why dynamicParams is off.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ runId: "_" }];
}

export default function Page() {
  return <WorkflowRunClient />;
}
