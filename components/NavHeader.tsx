"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToolHeader } from "@dome-layer/dome-ui";

const navLinks = [
  { label: "Events", href: "/events" },
  { label: "Workflow", href: "/runs" },
  { label: "Compliance", href: "/compliance" },
  { label: "Export", href: "/export" },
];

function renderLink(props: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-current"?: "page";
  onClick?: () => void;
}) {
  return (
    <Link
      href={props.href}
      className={props.className}
      style={props.style}
      aria-label={props["aria-label"]}
      aria-current={props["aria-current"]}
      onClick={props.onClick}
    >
      {props.children}
    </Link>
  );
}

export function NavHeader() {
  const pathname = usePathname();

  return (
    <ToolHeader
      toolName="Governance Dashboard"
      renderLink={renderLink}
      navLinks={navLinks}
      currentPath={pathname ?? undefined}
    />
  );
}
