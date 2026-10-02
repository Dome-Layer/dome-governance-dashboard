import EventDetailClient from "./EventDetailClient";

// Static export (Sprint H phase 2): one prebuilt page serves every event id. The Worker maps
// /events/<id> to /events/_ (worker/site.ts), and EventDetailClient reads the
// id from the URL. Any other id 404s at build time, which is why dynamicParams is off.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <EventDetailClient />;
}
