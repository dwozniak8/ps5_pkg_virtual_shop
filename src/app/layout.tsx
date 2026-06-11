import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import "@mantine/core/styles.css";
import "normalize.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "PS5 PKG Virtual Shop",
  description: "Local PS5 PKG server",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <ReactQueryProvider>
          <MantineProvider>{children}</MantineProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
