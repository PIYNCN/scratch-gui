/*
 * Copyright (c) 2026 Yunyun(云云) By 虚舟实验室(CaelLab) / XMUER Coding Engine
 * Licensed under the GNU Affero General Public License, Version 3 (AGPL-3.0-only)
 * https://www.gnu.org/licenses/agpl-3.0.txt
 * Source: https://github.com/CaelLab-org/scratch-gui
 * Project: https://engine.xmuer.online/
 */

/**
 * 桌面版「用本程序打开」：主进程把系统递过来的 .sb3 / .xce 登记成文件句柄，
 * 这里把它接到 GUI 的加载状态上 —— 效果等同于用户在「文件 → 从电脑中打开」里选了这个文件：
 * 载入 VM、更新标题、把句柄交给 Redux（之后 Ctrl+S 直接写回原文件）。
 *
 * 主进程在页面加载前就可能把文件送过来，preload 会先排队；这里在模块求值时登记，
 * 然后等 ReduxStore / vm 挂好再动手。网页版没有 onOpenFile，整段跳过。
 */

import {openLoadingProject, closeLoadingProject, openInvalidProjectModal} from '../reducers/modals';
import {LoadingState, onLoadedProject, requestProjectUpload} from '../reducers/project-state';
import {setFileHandle, setProjectError} from '../reducers/tw';
import {setProjectTitle} from '../reducers/project-title';
import {confirmDialog} from './dialog';
import {DesktopFileHandle} from './desktop-integration';

const preload = window.EditorPreload;

// 只有这些状态能干净地接一次文件加载（加载中 / 更新中都不碰）
const READY_STATES = [
    LoadingState.NOT_LOADED,
    LoadingState.SHOWING_WITH_ID,
    LoadingState.SHOWING_WITHOUT_ID
];

const PROJECT_EXTENSION = /\.(?:sb3|sb2|sb|xce)$/i;

const titleOf = name => name.replace(PROJECT_EXTENSION, '').slice(0, 100);

const waitFor = (read, timeoutMs) => new Promise(resolve => {
    const startedAt = Date.now();
    const tick = () => {
        const value = read();
        if (value) {
            resolve(value);
            return;
        }
        if (Date.now() - startedAt >= timeoutMs) {
            resolve(null);
            return;
        }
        setTimeout(tick, 50);
    };
    tick();
});

const loadProjectFile = async ({id, name}) => {
    if (!preload) return;
    // 冷启动时可能在 AppStateHOC / VMManager 挂好之前就收到文件，两头都等齐再动
    const vm = await waitFor(() => window.vm, 10000);
    const store = await waitFor(() => window.ReduxStore, 10000);
    if (!vm || !store) return;

    // 已经开着别的项目且有未保存改动：先问一句。启动时的第一个文件不会走到这里
    if (store.getState().scratchGui.projectChanged) {
        const proceed = await confirmDialog({
            title: '打开作品',
            message: `当前项目还有没保存的改动，打开「${name}」会替换它。`,
            confirmText: '打开',
            cancelText: '取消'
        });
        if (!proceed) return;
    }

    const ready = await waitFor(
        () => READY_STATES.includes(store.getState().scratchGui.projectState.loadingState),
        10000
    );
    if (!ready) return;

    store.dispatch(openLoadingProject());
    store.dispatch(requestProjectUpload(store.getState().scratchGui.projectState.loadingState));
    const loadingState = store.getState().scratchGui.projectState.loadingState;
    if (loadingState !== LoadingState.LOADING_VM_FILE_UPLOAD) {
        // 状态在这几十毫秒里又被别的东西改了（比如默认项目刚取回来）：这一下不硬塞
        store.dispatch(closeLoadingProject());
        return;
    }

    try {
        const data = await preload.readFile(id);
        await vm.loadProject(data);
        store.dispatch(closeLoadingProject());
        store.dispatch(onLoadedProject(loadingState, false, true));
        store.dispatch(setProjectTitle(titleOf(name)));
        store.dispatch(setFileHandle(new DesktopFileHandle(id, name)));
    } catch (error) {
        store.dispatch(closeLoadingProject());
        store.dispatch(onLoadedProject(loadingState, false, false));
        store.dispatch(setProjectError(error));
        store.dispatch(openInvalidProjectModal());
    }
};

if (preload && typeof preload.onOpenFile === 'function') {
    preload.onOpenFile(descriptor => {
        loadProjectFile(descriptor);
    });
}
