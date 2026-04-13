"use client";

import { useEffect } from "react";
import PageRenderer from "@/modules/builder/renderer/page-renderer";
import { BuilderBlock } from "@/modules/builder/types";

interface PixelData {
  type: string;
  pixelId: string;
  script: string | null;
}

interface Props {
  blocks: BuilderBlock[];
  pixels: PixelData[];
  funnelSlug: string | null;
  pageId: string;
}

export default function PublicPageClient({ blocks, pixels, funnelSlug, pageId }: Props) {
  useEffect(() => {
    // Inject tracking pixels
    pixels.forEach((p) => {
      if (p.type === "FACEBOOK" && p.pixelId) {
        const script = document.createElement("script");
        script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${p.pixelId}');fbq('track','PageView');`;
        document.head.appendChild(script);
      }
      if (p.type === "GOOGLE_ANALYTICS" && p.pixelId) {
        const gtagScript = document.createElement("script");
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${p.pixelId}`;
        document.head.appendChild(gtagScript);
        const inline = document.createElement("script");
        inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${p.pixelId}');`;
        document.head.appendChild(inline);
      }
      if (p.type === "CUSTOM" && p.script) {
        const custom = document.createElement("script");
        custom.innerHTML = p.script;
        document.head.appendChild(custom);
      }
    });
  }, [pixels]);

  return (
    <div className="min-h-screen bg-gray-950">
      <PageRenderer blocks={blocks} pageId={pageId} />
      {funnelSlug && (
        <div className="fixed bottom-4 right-4 z-50">
          <a
            href={`/r/${funnelSlug}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Continue
          </a>
        </div>
      )}
    </div>
  );
}
