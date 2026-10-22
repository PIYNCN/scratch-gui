/*
 * Copyright (c) 2026 Yunyun(云云) By 虚舟实验室(CaelLab) / XMUER Coding Engine
 * Licensed under the GNU Affero General Public License, Version 3 (AGPL-3.0-only)
 * https://www.gnu.org/licenses/agpl-3.0.txt
 * Source: https://github.com/CaelLab-org/scratch-gui
 * Project: https://engine.xmuer.online/
 */

self.addEventListener('install', () => {
    // Remove old service worker as soon as possible
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // We don't use caches any more, so remove all of them
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(i => caches.delete(i)))));
});
