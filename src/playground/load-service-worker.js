/*
 * Copyright (c) 2026 Yunyun(云云) By 虚舟实验室(CaelLab) / XMUER Coding Engine
 * Licensed under the GNU Affero General Public License, Version 3 (AGPL-3.0-only)
 * https://www.gnu.org/licenses/agpl-3.0.txt
 * Source: https://github.com/CaelLab-org/scratch-gui
 * Project: https://engine.xmuer.online/
 */

import log from '../lib/log';
import serviceWorker from '!!file-loader?name=sw.js!./service-worker.js';

let loaded = false;
const actuallyLoadServiceWorker = () => {
    navigator.serviceWorker.register(serviceWorker)
        .catch(err => {
            log.error('sw error', err);
        });
};
const loadServiceWorker = () => {
    if (process.env.ENABLE_SERVICE_WORKER && 'serviceWorker' in navigator && !loaded) {
        loaded = true;
        if (document.readyState === 'complete') {
            actuallyLoadServiceWorker();
        } else {
            window.addEventListener('load', actuallyLoadServiceWorker);
        }
    }
};

export {
    loadServiceWorker
};
