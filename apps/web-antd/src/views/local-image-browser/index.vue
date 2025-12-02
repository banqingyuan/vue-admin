<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

// 将原有脚本函数化并注入 API 基础路径
const API_BASE =
  import.meta.env.VITE_IMAGE_BROWSER_API_BASE?.replace(/\/$/, '') || '';

function patchFetchBase() {
  const wrap = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);
  const origFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const accessStore = useAccessStore();
    const token = accessStore.accessToken;
    const needsAuth = (req: RequestInfo | URL) => {
      if (typeof req === 'string') {
        if (req.startsWith('/api/')) return true;
        if (API_BASE && req.startsWith(`${API_BASE}/api/`)) return true;
        return false;
      }
      if (req instanceof URL) return req.pathname.startsWith('/api/');
      return false;
    };
    const ensureHeaders = (h?: HeadersInit): Headers => {
      const headers = new Headers(h || {});
      if (needsAuth(input) && token)
        headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept-Language', preferences.app.locale);
      return headers;
    };
    if (typeof input === 'string') {
      if (input.startsWith('/api/')) {
        return origFetch(wrap(input), {
          ...init,
          headers: ensureHeaders(init?.headers),
        });
      }
      if (API_BASE && input.startsWith(`${API_BASE}/api/`)) {
        return origFetch(input, {
          ...init,
          headers: ensureHeaders(init?.headers),
        });
      }
    } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
      const url = new URL(wrap(input.pathname), input.origin);
      url.search = input.search;
      return origFetch(url, {
        ...init,
        headers: ensureHeaders(init?.headers),
      });
    }
    return origFetch(input as any, init);
  }) as typeof window.fetch;
}

let cleanup: (() => void) | null = null;

onMounted(async () => {
  patchFetchBase();
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('local-image-browser.css', import.meta.url).toString();
  document.head.append(style);

  const [{ default: initMain }, { default: initBBox }] = await Promise.all([
    import('./scripts/main'),
    import('./scripts/bounding-box-tool'),
  ]);

  // 启动两个模块逻辑
  const disposes: Array<() => void> = [initMain(), initBBox()];
  cleanup = () =>
    disposes.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
});

onBeforeUnmount(() => {
  if (cleanup) cleanup();
});
</script>

<template>
  <div class="lib-container">
    <header>
      <h1>Local Image Browser</h1>
      <div class="tabs">
        <button class="tab-button active" data-tab="image-browser">
          图片浏览器
        </button>
        <button class="tab-button" data-tab="bounding-box-tool">
          边界框工具
        </button>
      </div>
      <!-- 主要筛选器 - 始终可见 -->
      <div class="primary-filters">
        <div class="filter-group primary-filter">
          <label for="platformSelect">📱 平台:</label>
          <select id="platformSelect" class="filter-select">
            <option value="">All</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
          </select>
        </div>

        <div class="filter-group primary-filter">
          <label for="startTime">📅 开始日期:</label>
          <div class="picker-input">
            <input
              type="date"
              id="startTime"
              class="filter-input date-picker"
            />
            <button
              type="button"
              id="startTimePickerBtn"
              class="picker-button"
              aria-label="打开日期选择"
            >
              <span class="picker-icon">📅</span>
            </button>
          </div>
        </div>

        <div class="filter-actions">
          <button
            id="advancedFilterToggle"
            class="filter-toggle-btn"
            type="button"
          >
            <span class="toggle-text">高级筛选</span>
            <span class="toggle-icon">▼</span>
          </button>
          <button id="clearFiltersBtn" class="clear-filters-btn" type="button">
            清空筛选
          </button>
        </div>
      </div>

      <!-- 高级筛选器 - 可折叠 -->
      <div class="advanced-filters" id="advanced-filters">
        <div class="advanced-filters-grid">
          <div class="filter-group">
            <label for="gameName">🎮 游戏名称:</label>
            <input
              id="gameName"
              class="filter-input"
              list="gameNameOptions"
              placeholder="输入或选择游戏名称"
            />
            <datalist id="gameNameOptions">
              <option value="">All</option>
            </datalist>
          </div>

          <div class="filter-group">
            <label for="gameMode">🎯 游戏模式:</label>
            <select id="gameMode" class="filter-select">
              <option value="">All</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="playerNumber">👥 玩家数量:</label>
            <select id="playerNumber" class="filter-select">
              <option value="">All</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="deviceModel">📲 设备型号:</label>
            <select id="deviceModel" class="filter-select">
              <option value="">All</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="endTime">⏰ 结束时间:</label>
            <input type="time" id="endTime" class="filter-input time-picker" />
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="tab-content active" id="image-browser-content">
        <div class="image-browser">
          <div class="image-navigation">
            <!-- 主要导航区域 -->
            <div class="nav-primary">
              <div class="nav-group image-nav">
                <button
                  id="prevButton"
                  class="nav-button nav-icon-btn"
                  title="上一张图片 (↑)"
                >
                  <span class="nav-icon">←</span>
                </button>
                <div class="image-counter-container">
                  <span id="image-counter">Image 0 of 0</span>
                </div>
                <button
                  id="nextButton"
                  class="nav-button nav-icon-btn"
                  title="下一张图片 (↓)"
                >
                  <span class="nav-icon">→</span>
                </button>
              </div>

              <div class="nav-group page-nav">
                <button id="prevPageButton" class="nav-button page-nav-button">
                  上一页
                </button>
                <div class="page-info">
                  <input
                    type="number"
                    id="pageNumberInput"
                    min="1"
                    class="page-number-input"
                    placeholder="页码"
                  />
                  <button
                    id="jumpToPageButton"
                    class="nav-button page-jump-button"
                  >
                    跳转
                  </button>
                </div>
                <button id="nextPageButton" class="nav-button page-nav-button">
                  下一页
                </button>
              </div>
            </div>

            <!-- 功能选项区域 -->
            <div class="nav-secondary">
              <div class="display-options">
                <label class="checkbox-container">
                  <input type="checkbox" id="showBoundingBoxes" />
                  <span class="checkbox-label">显示标注</span>
                </label>
              </div>

              <div class="action-buttons">
                <button
                  id="open-in-bounding-box-tool"
                  class="nav-button action-btn"
                  title="在边界框工具中打开当前图片"
                >
                  <span class="btn-icon">🎯</span>
                  <span class="btn-text">标注工具</span>
                </button>
                <button
                  id="batchDownloadButton"
                  class="nav-button batch-download-btn"
                  title="批量下载当前筛选结果"
                >
                  <span class="btn-icon">📥</span>
                  <span class="btn-text">批量下载</span>
                </button>
              </div>
            </div>
          </div>

          <div class="progress-container">
            <input
              type="range"
              id="imageSlider"
              min="0"
              max="0"
              value="0"
              class="image-slider"
            />
            <div class="slider-labels">
              <span id="sliderMinLabel">1</span>
              <span id="sliderMaxLabel">0</span>
            </div>
          </div>

          <div class="image-container">
            <div class="image-wrapper">
              <img id="current-image" src="" alt="No image selected" />
              <canvas
                id="boundingBoxCanvas"
                class="bounding-box-canvas"
              ></canvas>
            </div>
          </div>

          <div class="image-details">
            <h2>Image Details</h2>
            <div id="image-info">
              <p>Select an image to view details</p>
            </div>
          </div>
        </div>
      </div>

      <div id="fullscreenModal" class="fullscreen-modal">
        <span class="close-modal">&times;</span>
        <div class="fullscreen-image-container">
          <img
            id="fullscreenImage"
            class="fullscreen-image"
            src=""
            alt="Full screen image"
          />
          <canvas id="fullscreenCanvas" class="fullscreen-canvas"></canvas>
        </div>
        <div class="fullscreen-controls">
          <label class="fullscreen-checkbox-container">
            <input type="checkbox" id="fullscreenShowBoundingBoxes" checked />
            显示矩形框和标签
          </label>
        </div>
      </div>

      <div class="tab-content" id="bounding-box-tool-content">
        <div class="bounding-box-tool">
          <div class="tool-section">
            <h2>边界框工具</h2>
            <div class="upload-section">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                class="file-input"
              />
              <label for="imageUpload" class="file-input-label">选择图片</label>
            </div>
          </div>

          <div class="tool-container">
            <div class="canvas-container" id="canvasContainer">
              <canvas id="draw-canvas"></canvas>
            </div>

            <div class="coordinates-panel">
              <h3>坐标信息</h3>
              <div class="coordinate-inputs">
                <div class="input-group">
                  <label for="xmin">X 坐标:</label>
                  <input
                    type="number"
                    id="xmin"
                    name="xmin"
                    min="0"
                    max="1"
                    step="0.0001"
                  />
                </div>
                <div class="input-group">
                  <label for="ymin">Y 坐标:</label>
                  <input
                    type="number"
                    id="ymin"
                    name="ymin"
                    min="0"
                    max="1"
                    step="0.0001"
                  />
                </div>
                <div class="input-group">
                  <label for="width">宽度:</label>
                  <input
                    type="number"
                    id="width"
                    name="width"
                    min="0"
                    max="1"
                    step="0.0001"
                  />
                </div>
                <div class="input-group">
                  <label for="height">高度:</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    min="0"
                    max="1"
                    step="0.0001"
                  />
                </div>
              </div>

              <div class="json-output">
                <h3>JSON 格式</h3>
                <textarea id="jsonOutput" rows="6" readonly></textarea>
                <button id="copyButton" class="copy-button">
                  复制到剪贴板
                </button>
              </div>

              <div class="json-input">
                <h3>从 JSON 导入</h3>
                <textarea
                  id="jsonInput"
                  rows="6"
                  placeholder="粘贴 JSON 格式的坐标，例如:
            'relativeX': 0.1234,
            'relativeY': 0.5678,
            'relativeWidth': 0.1234,
            'relativeHight': 0.5678"
                ></textarea>
                <button id="parseButton" class="parse-button">解析坐标</button>
              </div>
            </div>
          </div>

          <div class="download-actions">
            <button id="confirmBBoxDownloadButton" class="action-button">
              开始下载
            </button>
            <button id="cancelBBoxDownloadButton" class="action-button">
              取消
            </button>
          </div>
        </div>
      </div>

      <div id="batchDownloadModal" class="batch-download-modal">
        <div class="batch-download-content">
          <h3>批量下载设置</h3>
          <div class="download-settings" id="downloadSettings">
            <div class="setting-group">
              <label for="maxDownloadCount">下载数量限制:</label>
              <input
                type="number"
                id="maxDownloadCount"
                min="1"
                max="10000"
                value="100"
                class="setting-input"
              />
              <span class="available-count">
                当前筛选结果: <span id="availableCount">0</span> 张
              </span>
            </div>
            <div class="setting-group">
              <label class="checkbox-container">
                <input type="checkbox" id="randomDownloadCheckbox" />
                <span class="checkbox-label">随机抽样</span>
              </label>
            </div>
            <div class="setting-group">
              <label for="downloadFolderName">文件夹名称:</label>
              <input
                type="text"
                id="downloadFolderName"
                placeholder="下载文件夹名称（选择目录后可选）"
                class="setting-input"
              />
            </div>
            <div class="setting-group">
              <label>保存目录（可选）:</label>
              <div class="directory-picker-row">
                <button
                  id="chooseDirectoryBtn"
                  class="action-button"
                  type="button"
                >
                  选择目录
                </button>
                <button
                  id="clearDirectoryBtn"
                  class="action-button"
                  type="button"
                >
                  清除
                </button>
                <span id="selectedDirectoryName" class="directory-name"></span>
              </div>
              <small>
                启用支持的浏览器下可将文件直接保存到所选目录，其他浏览器将回退为浏览器默认下载。
              </small>
            </div>
            <div class="download-actions">
              <button id="confirmBatchDownloadButton" class="action-button">
                开始下载
              </button>
              <button id="cancelBatchDownloadButton" class="action-button">
                取消
              </button>
            </div>
          </div>

          <div
            class="download-info"
            id="downloadProgress"
            style="display: none"
          >
            <p>正在下载图片到文件夹: <span id="currentFolderName"></span></p>
            <p>总计图片数量: <span id="totalDownloadCount">0</span></p>
            <p>已下载: <span id="downloadedCount">0</span></p>
            <div class="progress-bar-container">
              <div id="downloadProgressBar" class="progress-bar">0%</div>
            </div>
            <div class="download-actions">
              <button id="cancelDownloadButton" class="action-button">
                取消下载
              </button>
            </div>
          </div>

          <div
            class="download-complete"
            id="downloadComplete"
            style="display: none"
          >
            <p>下载完成！</p>
            <div class="download-actions">
              <button id="closeDownloadModalButton" class="action-button">
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
