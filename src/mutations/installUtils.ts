function buildPkgUrl(localIp: string, installUrl: string): string {
  const port = window.location.port;
  return `http://${localIp}${port ? `:${port}` : ""}${installUrl}`;
}

export async function sendPkgToInstaller(
  localIp: string,
  installUrl: string,
): Promise<void> {
  const pkgUrl = buildPkgUrl(localIp, installUrl);
  const formData = new FormData();
  formData.append("url", pkgUrl);

  await fetch(`http://${localIp}:12800/upload`, {
    method: "POST",
    body: formData,
    mode: "no-cors",
  });
}
