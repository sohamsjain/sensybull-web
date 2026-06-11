/* Sensybull service worker — receives Web Push filing alerts. */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Sensybull", {
      body: data.body || "",
      icon: "/logo.png",
      tag: data.tag,
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        for (const win of windows) {
          if (win.url.startsWith(self.location.origin) && "focus" in win) {
            win.navigate(url);
            return win.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
