"use client";

import { useEffect, useState } from "react";

async function detectLocalIp(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const rtc = new RTCPeerConnection({ iceServers: [] });
      rtc.createDataChannel("");
      rtc.createOffer().then((offer) => rtc.setLocalDescription(offer));
      rtc.onicecandidate = (evt) => {
        if (evt?.candidate?.candidate) {
          const match = evt.candidate.candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
          if (match && !match[0].startsWith("127")) {
            rtc.close();
            resolve(match[0]);
          }
        }
      };
      setTimeout(() => resolve(window.location.hostname), 2000);
    } catch {
      resolve(window.location.hostname);
    }
  });
}

function getInitialIpAddress(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "127.0.0.1";
}

export function useIpAddress(): string {
  const [ipAddress, setIpAddress] = useState<string>(getInitialIpAddress());

  useEffect(() => {
    let mounted = true;

    detectLocalIp().then((ip) => {
      if (!mounted) return;
      setIpAddress(ip);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return ipAddress;
}
