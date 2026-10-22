/*
 * Copyright (c) 2026 Yunyun(云云) By 虚舟实验室(CaelLab) / XMUER Coding Engine
 * Licensed under the GNU Affero General Public License, Version 3 (AGPL-3.0-only)
 * https://www.gnu.org/licenses/agpl-3.0.txt
 * Source: https://github.com/CaelLab-org/scratch-gui
 * Project: https://engine.xmuer.online/
 */

import './public-path';
import '../lib/tw-polyfill';
import '../lib/normalize.css';
// 桌面版桥（原生文件对话框）。必须在 GUI 模块求值前跑，内部自带"非桌面环境跳过"判断
import './desktop-integration';
// 桌面版「用本程序打开」：系统递过来的 .sb3 / .xce 等 ReduxStore / vm 就绪后载入
import './desktop-open';
// 桌面版关窗确认（GUI 的 beforeunload 在 Electron 下会让窗口关不掉，这里接过来自己问一句）
import './close-guard';
