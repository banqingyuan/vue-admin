// 从 local_images_browser/public/js/main.js 迁移，模块化封装，返回卸载函数
export default function initMain() {
  const controller = new AbortController();
  const { signal } = controller;

  const add = (
    el: Document | Element | Window,
    type: string,
    handler: EventListener,
  ) => {
    el.addEventListener(type, handler, { signal });
  };

  // 由于原代码较长，这里直接动态导入原逻辑并执行
  // 为避免在 vite 构建中引入 node 端路径，这里将核心逻辑内联为一个函数
  (function attach() {
    // API 基础地址（用于 <img> 等非 fetch 请求）
    const API_BASE =
      import.meta.env.VITE_IMAGE_BROWSER_API_BASE?.replace(/\/$/, '') || '';
    const apiUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

    // 初始化高级筛选器折叠功能
    function initAdvancedFilters() {
      const toggleBtn = document.querySelector(
        '#advancedFilterToggle',
      ) as HTMLButtonElement;
      const advancedFilters = document.querySelector(
        '#advanced-filters',
      ) as HTMLDivElement;
      const clearBtn = document.querySelector(
        '#clearFiltersBtn',
      ) as HTMLButtonElement;

      if (!toggleBtn || !advancedFilters) return;

      toggleBtn.addEventListener('click', () => {
        const isExpanded = advancedFilters.classList.contains('expanded');

        if (isExpanded) {
          advancedFilters.classList.remove('expanded');
          toggleBtn.classList.remove('expanded');
        } else {
          advancedFilters.classList.add('expanded');
          toggleBtn.classList.add('expanded');
        }
      });

      // 清空筛选器功能
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          // 清空所有筛选器
          if (gameNameSelect) gameNameSelect.value = '';
          if (startTimeInput) startTimeInput.value = '';
          if (endTimeInput) endTimeInput.value = '';
          if (platformSelect) platformSelect.value = '';
          if (gameModeSelect) gameModeSelect.value = '';
          if (playerNumberSelect) playerNumberSelect.value = '';
          if (deviceModelSelect) deviceModelSelect.value = '';

          // 重新获取图片
          fetchImages();
        });
      }
    }
    // 复制 main.js 里 DOM 初始化和事件绑定的主体逻辑（已删去顶层 DOMContentLoaded 包裹）
    const gameNameSelect = document.querySelector(
      '#gameName',
    ) as HTMLInputElement;
    const gameModeSelect = document.querySelector(
      '#gameMode',
    ) as HTMLSelectElement;
    const playerNumberSelect = document.querySelector(
      '#playerNumber',
    ) as HTMLSelectElement;
    const deviceModelSelect = document.querySelector(
      '#deviceModel',
    ) as HTMLSelectElement;
    const platformSelect = document.querySelector(
      '#platformSelect',
    ) as HTMLSelectElement | null;
    const startTimeInput = document.querySelector(
      '#startTime',
    ) as HTMLInputElement;
    const endTimeInput = document.querySelector('#endTime') as HTMLInputElement;
    const startTimePickerBtn = document.querySelector(
      '#startTimePickerBtn',
    ) as HTMLButtonElement | null;
    const prevButton = document.querySelector(
      '#prevButton',
    ) as HTMLButtonElement;
    const nextButton = document.querySelector(
      '#nextButton',
    ) as HTMLButtonElement;
    const imageCounter = document.querySelector(
      '#image-counter',
    ) as HTMLElement;
    const currentImage = document.querySelector(
      '#current-image',
    ) as HTMLImageElement;
    const imageInfo = document.querySelector('#image-info') as HTMLElement;
    const showBoundingBoxesCheckbox = document.querySelector(
      '#showBoundingBoxes',
    ) as HTMLInputElement;
    const boundingBoxCanvas = document.querySelector(
      '#boundingBoxCanvas',
    ) as HTMLCanvasElement;
    const imageSlider = document.querySelector(
      '#imageSlider',
    ) as HTMLInputElement;
    const sliderMinLabel = document.querySelector(
      '#sliderMinLabel',
    ) as HTMLElement;
    const sliderMaxLabel = document.querySelector(
      '#sliderMaxLabel',
    ) as HTMLElement;
    const openInBoundingBoxToolButton = document.querySelector(
      '#open-in-bounding-box-tool',
    ) as HTMLButtonElement;
    const ctx = boundingBoxCanvas.getContext('2d') as CanvasRenderingContext2D;

    const fullscreenModal = document.querySelector(
      '#fullscreenModal',
    ) as HTMLElement;
    const fullscreenImage = document.querySelector(
      '#fullscreenImage',
    ) as HTMLImageElement;
    const fullscreenCanvas = document.querySelector(
      '#fullscreenCanvas',
    ) as HTMLCanvasElement;
    const fullscreenShowBoundingBoxesCheckbox = document.querySelector(
      '#fullscreenShowBoundingBoxes',
    ) as HTMLInputElement;
    const closeModalButton = document.querySelector(
      '.close-modal',
    ) as HTMLElement;
    const fullscreenCtx = fullscreenCanvas.getContext(
      '2d',
    ) as CanvasRenderingContext2D;

    const prevPageButton = document.querySelector(
      '#prevPageButton',
    ) as HTMLButtonElement;
    const nextPageButton = document.querySelector(
      '#nextPageButton',
    ) as HTMLButtonElement;
    const pageNumberInput = document.querySelector(
      '#pageNumberInput',
    ) as HTMLInputElement;
    const jumpToPageButton = document.querySelector(
      '#jumpToPageButton',
    ) as HTMLButtonElement;
    const batchDownloadButton = document.querySelector(
      '#batchDownloadButton',
    ) as HTMLButtonElement;
    const batchDownloadModal = document.querySelector(
      '#batchDownloadModal',
    ) as HTMLElement;
    const totalDownloadCount = document.querySelector(
      '#totalDownloadCount',
    ) as HTMLElement;
    const downloadedCount = document.querySelector(
      '#downloadedCount',
    ) as HTMLElement;
    const downloadProgressBar = document.querySelector(
      '#downloadProgressBar',
    ) as HTMLElement;
    const cancelDownloadButton = document.querySelector(
      '#cancelDownloadButton',
    ) as HTMLButtonElement;
    const closeDownloadModalButton = document.querySelector(
      '#closeDownloadModalButton',
    ) as HTMLButtonElement;
    const downloadSettings = document.querySelector(
      '#downloadSettings',
    ) as HTMLElement;
    const downloadProgress = document.querySelector(
      '#downloadProgress',
    ) as HTMLElement;
    const downloadComplete = document.querySelector(
      '#downloadComplete',
    ) as HTMLElement;
    const maxDownloadCount = document.querySelector(
      '#maxDownloadCount',
    ) as HTMLInputElement | null;
    const downloadFolderName = document.querySelector(
      '#downloadFolderName',
    ) as HTMLInputElement | null;
    const availableCount = document.querySelector(
      '#availableCount',
    ) as HTMLElement;
    const currentFolderName = document.querySelector(
      '#currentFolderName',
    ) as HTMLElement;
    const confirmDownloadButton = document.querySelector(
      '#confirmDownloadButton',
    ) as HTMLButtonElement;
    const cancelDownloadSettingButton = document.querySelector(
      '#cancelDownloadSettingButton',
    ) as HTMLButtonElement;
    const randomDownloadCheckbox = document.querySelector(
      '#randomDownloadCheckbox',
    ) as HTMLInputElement | null;
    const chooseDirectoryBtn = document.querySelector(
      '#chooseDirectoryBtn',
    ) as HTMLButtonElement | null;
    const clearDirectoryBtn = document.querySelector(
      '#clearDirectoryBtn',
    ) as HTMLButtonElement | null;
    const selectedDirectoryNameEl = document.querySelector(
      '#selectedDirectoryName',
    ) as HTMLElement | null;

    let images: any[] = [];
    let currentIndex = 0;
    let currentImageData: any = null;
    let currentImageObjectUrl: null | string = null;
    let isSliderDragging = false;
    let currentPage = 1;
    let totalPages = 1;
    let totalImages = 0;
    const imagesPerPage = 20;
    // let currentOriginalJson: any = null; // 暂时不使用
    let currentOriginalJsonString = '';
    let currentAugmentedData: any = null;
    let isBatchDownloading = false;
    let batchDownloadCanceled = false;
    let currentBatchImages: any[] = [];
    let selectedDirectoryHandle: any = null; // File System Access API 目录句柄（可选）

    const areaColors: Record<string, string> = {
      dealer_hand: '#FF5733',
      next: '#33FF57',
      dealer: '#3357FF',
      bottom_card: '#FF33A8',
      previous: '#33FFF6',
      unknown: '#FFD700',
    };

    function safeParseJSON(input: any) {
      if (typeof input === 'string') {
        try {
          return JSON.parse(input);
        } catch {
          return null;
        }
      }
      return input;
    }

    function normalizeImageData(data: any) {
      const n: any = { ...data };
      const parsedAreas = safeParseJSON(n.areas);
      if (parsedAreas) n.areas = parsedAreas;
      const parsedAreaConfigs = safeParseJSON(n.areaConfigs);
      if (parsedAreaConfigs) n.areaConfigs = parsedAreaConfigs;
      return n;
    }

    function updateSlider() {
      if (images.length > 0) {
        imageSlider.min = '0';
        imageSlider.max = String(images.length - 1);
        imageSlider.value = String(currentIndex);
        sliderMinLabel.textContent = '1';
        sliderMaxLabel.textContent = String(images.length);
      } else {
        imageSlider.min = '0';
        imageSlider.max = '0';
        imageSlider.value = '0';
        sliderMinLabel.textContent = '1';
        sliderMaxLabel.textContent = '0';
      }
    }

    function clearImageDisplay() {
      currentImage.src = '';
      currentImage.alt = 'No image available';
      imageInfo.innerHTML = '<p>No images match the current filters</p>';
      imageCounter.textContent = 'Image 0 of 0';
      prevButton.disabled = true;
      nextButton.disabled = true;
      ctx.clearRect(0, 0, boundingBoxCanvas.width, boundingBoxCanvas.height);
      currentImageData = null;
      if (currentImageObjectUrl) {
        try {
          URL.revokeObjectURL(currentImageObjectUrl);
        } catch {}
        currentImageObjectUrl = null;
      }
      updateSlider();
    }

    function updateImageCounter() {
      if (totalImages === 0) {
        imageCounter.textContent = 'No images found';
      } else {
        const startImageNum = (currentPage - 1) * imagesPerPage + 1;
        const endImageNum = startImageNum + images.length - 1;
        imageCounter.textContent = `Image ${startImageNum}-${endImageNum} of ${totalImages} (Page ${currentPage}/${totalPages})`;
      }
    }

    function updateNavigationButtons() {
      prevButton.disabled = currentIndex === 0 && currentPage === 1;
      nextButton.disabled =
        currentIndex === images.length - 1 && currentPage === totalPages;
      if (prevPageButton && nextPageButton) {
        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages;
      }
      if (pageNumberInput) {
        pageNumberInput.max = String(totalPages);
        pageNumberInput.placeholder = `页码 (1-${totalPages})`;
      }
    }

    function drawBoundingBoxes(imageData: any) {
      const data = normalizeImageData(imageData);
      const ctx2d = ctx;
      ctx2d.clearRect(0, 0, boundingBoxCanvas.width, boundingBoxCanvas.height);
      if (
        !(document.querySelector('#showBoundingBoxes') as HTMLInputElement)
          .checked
      )
        return;
      if (data.areaConfigs) {
        Object.keys(data.areaConfigs).forEach((areaName) => {
          const area = data.areaConfigs[areaName];
          const color = areaColors[areaName] || '#FFFFFF';
          const x = area.x * boundingBoxCanvas.width;
          const y = area.y * boundingBoxCanvas.height;
          const width = area.width * boundingBoxCanvas.width;
          const height = area.height * boundingBoxCanvas.height;
          ctx2d.globalAlpha = 0.2;
          ctx2d.fillStyle = color as string;
          ctx2d.fillRect(x, y, width, height);
          ctx2d.globalAlpha = 0.8;
          ctx2d.strokeStyle = color as string;
          ctx2d.lineWidth = 2;
          ctx2d.strokeRect(x, y, width, height);
          ctx2d.globalAlpha = 1;
          ctx2d.fillStyle = color as string;
          ctx2d.font = '14px Arial';
          ctx2d.fillText(String(areaName), x + 5, y + 20);
        });
      }
      if (data.overlayMask) {
        const m = data.overlayMask;
        const mx = m.x * boundingBoxCanvas.width;
        const my = m.y * boundingBoxCanvas.height;
        const mw = m.width * boundingBoxCanvas.width;
        const mh = m.height * boundingBoxCanvas.height;
        ctx2d.save();
        ctx2d.strokeStyle = '#FFA500';
        ctx2d.lineWidth = 3;
        ctx2d.setLineDash([6, 4]);
        ctx2d.strokeRect(mx, my, mw, mh);
        ctx2d.setLineDash([]);
        ctx2d.fillStyle = '#FFA500';
        ctx2d.font = 'bold 14px Arial';
        ctx2d.fillText('overlayMask', mx + 5, my + 20);
        ctx2d.restore();
      }
      if (data.areas && typeof data.areas === 'object') {
        Object.keys(data.areas).forEach((areaName) => {
          const items = (data.areas as any)[areaName];
          const color = areaColors[areaName] || '#FFFFFF';
          if (!Array.isArray(items)) return;
          items.forEach((item: any) => {
            if (!item.bounds) return;
            const x = item.bounds.x * boundingBoxCanvas.width;
            const y = item.bounds.y * boundingBoxCanvas.height;
            const width = item.bounds.width * boundingBoxCanvas.width;
            const height = item.bounds.height * boundingBoxCanvas.height;
            ctx2d.globalAlpha = 0.3;
            ctx2d.fillStyle = color as string;
            ctx2d.fillRect(x, y, width, height);
            ctx2d.globalAlpha = 1;
            ctx2d.strokeStyle = color as string;
            ctx2d.lineWidth = 2;
            ctx2d.strokeRect(x, y, width, height);
            if (item.label) {
              const labelText = `${item.label} (${(item.confidence * 100).toFixed(1)}%)`;
              ctx2d.fillStyle = '#FFFFFF';
              ctx2d.font = 'bold 12px Arial';
              const textWidth = ctx2d.measureText(labelText).width;
              ctx2d.globalAlpha = 0.7;
              ctx2d.fillStyle = color as string;
              ctx2d.fillRect(x, y - 20, textWidth + 10, 20);
              ctx2d.globalAlpha = 1;
              ctx2d.fillStyle = '#FFFFFF';
              ctx2d.fillText(String(labelText), x + 5, y - 5);
            }
          });
        });
      }
    }

    function drawFullscreenBoundingBoxes(imageData: any) {
      const data = normalizeImageData(imageData);
      const c = fullscreenCanvas;
      const ctxf = fullscreenCtx;
      ctxf.clearRect(0, 0, c.width, c.height);
      if (!fullscreenShowBoundingBoxesCheckbox.checked) return;
      if (data.areaConfigs) {
        Object.entries(data.areaConfigs).forEach(([areaName, area]: any) => {
          const color = areaColors[areaName] || areaColors.unknown;
          const x = area.x * c.width;
          const y = area.y * c.height;
          const width = area.width * c.width;
          const height = area.height * c.height;
          ctxf.globalAlpha = 0.2;
          ctxf.fillStyle = color as string;
          ctxf.fillRect(x, y, width, height);
          ctxf.globalAlpha = 0.8;
          ctxf.strokeStyle = color as string;
          ctxf.lineWidth = 3;
          ctxf.strokeRect(x, y, width, height);
          ctxf.globalAlpha = 1;
          ctxf.fillStyle = color as string;
          const label = `${areaName}`;
          ctxf.font = 'bold 14px Arial';
          ctxf.fillText(String(label), x + 5, y + 20);
        });
      }
      if (data.overlayMask) {
        const m = data.overlayMask;
        const mx = m.x * c.width;
        const my = m.y * c.height;
        const mw = m.width * c.width;
        const mh = m.height * c.height;
        ctxf.save();
        ctxf.strokeStyle = '#FFA500';
        ctxf.lineWidth = 3;
        ctxf.setLineDash([6, 4]);
        ctxf.strokeRect(mx, my, mw, mh);
        ctxf.setLineDash([]);
        ctxf.fillStyle = '#FFA500';
        ctxf.font = 'bold 16px Arial';
        ctxf.fillText('overlayMask', mx + 5, my + 24);
        ctxf.restore();
      }
      if (data.areas && typeof data.areas === 'object') {
        Object.entries(data.areas).forEach(([areaName, items]: any) => {
          const color = areaColors[areaName] || areaColors.unknown;
          if (!Array.isArray(items)) return;
          items.forEach((item: any) => {
            if (!item.bounds) return;
            const x = item.bounds.x * c.width;
            const y = item.bounds.y * c.height;
            const width = item.bounds.width * c.width;
            const height = item.bounds.height * c.height;
            ctxf.globalAlpha = 0.3;
            ctxf.fillStyle = color as string;
            ctxf.fillRect(x, y, width, height);
            ctxf.globalAlpha = 1;
            ctxf.strokeStyle = color as string;
            ctxf.lineWidth = 3;
            ctxf.strokeRect(x, y, width, height);
            if (item.label) {
              const labelText = `${item.label} (${(item.confidence * 100).toFixed(1)}%)`;
              ctxf.fillStyle = color as string;
              ctxf.globalAlpha = 0.7;
              const textWidth = ctxf.measureText(labelText).width;
              ctxf.fillRect(x, y - 24, textWidth + 10, 22);
              ctxf.globalAlpha = 1;
              ctxf.fillStyle = '#FFFFFF';
              ctxf.font = 'bold 14px Arial';
              ctxf.fillText(String(labelText), x + 5, y - 8);
            }
          });
        });
      }
    }

    async function refreshFilterOptionsByDate() {
      try {
        const params = new URLSearchParams();
        if (platformSelect && platformSelect.value)
          params.append('platform', platformSelect.value);
        if (startTimeInput.value) {
          const startDateObj = new Date(`${startTimeInput.value}T00:00:00`);
          const startTs = Math.floor(startDateObj.getTime() / 1000);
          if (!Number.isNaN(startTs)) {
            params.append('startTime', String(startTs));
            if (endTimeInput.value) {
              const timeParts = endTimeInput.value.split(':');
              const hh = timeParts[0] || '0';
              const mm = timeParts[1] || '0';
              const endDate = new Date(startDateObj);
              endDate.setHours(
                Number.parseInt(hh, 10),
                Number.parseInt(mm, 10),
                0,
                0,
              );
              if (endDate.getTime() >= startDateObj.getTime()) {
                const endTs = Math.floor(endDate.getTime() / 1000);
                params.append('endTime', String(endTs));
              }
            }
          }
        }
        const response = await fetch(
          apiUrl(`/api/filter-options?${params.toString()}`),
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bodyJson = await response.json();
        const data =
          bodyJson && (bodyJson as any).data
            ? (bodyJson as any).data
            : bodyJson;
        if (gameNameSelect.tagName.toLowerCase() === 'input') {
          const dataListId = gameNameSelect.getAttribute('list');
          if (dataListId) {
            const dataList = document.querySelector(
              `#${dataListId}`,
            ) as HTMLDataListElement;
            if (dataList) {
              const currentValue = gameNameSelect.value;
              dataList.innerHTML = '';
              const allOpt = document.createElement('option');
              allOpt.value = '';
              dataList.append(allOpt);
              (data.gameName || []).forEach((name: string) => {
                const opt = document.createElement('option');
                opt.value = name;
                dataList.append(opt);
              });
              gameNameSelect.value = currentValue;
            }
          }
        }
        const refreshSelect = (selectEl: HTMLSelectElement, values: any[]) => {
          const previous = selectEl.value;
          selectEl.innerHTML = '';
          selectEl.append(new Option('All', ''));
          (values || []).forEach((v) => {
            const label = String(v);
            const opt = new Option(label, label, false, false);
            selectEl.append(opt);
          });
          selectEl.value = [...selectEl.options].some(
            (o) => o.value === previous,
          )
            ? previous
            : '';
        };
        refreshSelect(gameModeSelect, data.gameMode);
        refreshSelect(playerNumberSelect, data.playerNumber);
        refreshSelect(deviceModelSelect, data.deviceModel);
      } catch (error) {
        console.error('刷新筛选项失败:', error);
      }
    }

    async function fetchImages() {
      const params = new URLSearchParams();
      if (gameNameSelect.value) params.append('gameName', gameNameSelect.value);
      if (gameModeSelect.value) params.append('gameMode', gameModeSelect.value);
      if (playerNumberSelect.value)
        params.append('playerNumber', playerNumberSelect.value);
      if (deviceModelSelect.value)
        params.append('deviceModel', deviceModelSelect.value);
      if (platformSelect && platformSelect.value)
        params.append('platform', platformSelect.value);
      if (startTimeInput.value) {
        const startDateObj = new Date(`${startTimeInput.value}T00:00:00`);
        const startTimestamp = Math.floor(startDateObj.getTime() / 1000);
        if (!Number.isNaN(startTimestamp)) {
          params.append('startTime', String(startTimestamp));
          if (endTimeInput.value) {
            const timeParts = endTimeInput.value.split(':');
            const hh = timeParts[0] || '0';
            const mm = timeParts[1] || '0';
            const endDate = new Date(startDateObj);
            endDate.setHours(
              Number.parseInt(hh, 10),
              Number.parseInt(mm, 10),
              0,
              0,
            );
            if (endDate.getTime() >= startDateObj.getTime()) {
              const endTimestamp = Math.floor(endDate.getTime() / 1000);
              params.append('endTime', String(endTimestamp));
            }
          }
        }
      }
      params.append('page', String(currentPage));
      params.append('limit', String(imagesPerPage));
      try {
        const response = await fetch(
          apiUrl(`/api/images?${params.toString()}`),
        );
        const bodyJson = await response.json();
        const data =
          bodyJson && (bodyJson as any).data
            ? (bodyJson as any).data
            : bodyJson;
        images = data.images || [];
        totalImages = data.totalImages || 0;
        currentPage = data.currentPage || 1;
        totalPages = data.totalPages || 1;
        updateImageCounter();
        updateNavigationButtons();
        updateSlider();
      } catch (error) {
        console.error('Error fetching images:', error);
        images = [];
        totalImages = 0;
        currentPage = 1;
        totalPages = 1;
        updateImageCounter();
        updateNavigationButtons();
        updateSlider();
      }
    }

    async function applyFilters() {
      currentPage = 1;
      await fetchImages();
      if (images.length > 0) {
        currentIndex = 0;
        showImage(currentIndex);
      } else {
        clearImageDisplay();
      }
      const params = new URLSearchParams();
      if (gameNameSelect.value) params.append('gameName', gameNameSelect.value);
      if (gameModeSelect.value) params.append('gameMode', gameModeSelect.value);
      if (playerNumberSelect.value)
        params.append('playerNumber', playerNumberSelect.value);
      if (deviceModelSelect.value)
        params.append('deviceModel', deviceModelSelect.value);
      if (platformSelect && platformSelect.value)
        params.append('platform', platformSelect.value);
      if (startTimeInput.value) {
        const startDateObj = new Date(`${startTimeInput.value}T00:00:00`);
        const startTs = Math.floor(startDateObj.getTime() / 1000);
        if (!Number.isNaN(startTs)) {
          params.append('startTime', String(startTs));
          if (endTimeInput.value) {
            const timeParts = endTimeInput.value.split(':');
            const hh = timeParts[0] || '0';
            const mm = timeParts[1] || '0';
            const endDate = new Date(startDateObj);
            endDate.setHours(
              Number.parseInt(hh, 10),
              Number.parseInt(mm, 10),
              0,
              0,
            );
            if (endDate.getTime() >= startDateObj.getTime()) {
              const endTs = Math.floor(endDate.getTime() / 1000);
              params.append('endTime', String(endTs));
            }
          }
        }
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }

    async function showImage(index: number) {
      if (images.length === 0 || index < 0 || index >= images.length) {
        clearImageDisplay();
        return;
      }
      currentIndex = index;
      currentImageData = images[currentIndex];
      // 通过带鉴权的 fetch 获取图片并使用本地 Blob URL，保证携带 Authorization
      try {
        if (currentImageObjectUrl) {
          try {
            URL.revokeObjectURL(currentImageObjectUrl);
          } catch {}
          currentImageObjectUrl = null;
        }
        const imgResp = await fetch(
          apiUrl(
            `/api/image-proxy/${encodeURIComponent(currentImageData.imagePath)}`,
          ),
        );
        if (!imgResp.ok) throw new Error(`HTTP ${imgResp.status}`);
        const imgBlob = await imgResp.blob();
        currentImageObjectUrl = URL.createObjectURL(imgBlob);
        currentImage.src = currentImageObjectUrl;
      } catch (error) {
        console.error('加载图片失败:', error);
        currentImage.src = '';
      }
      currentImage.alt = `Image ${currentImageData.id}`;
      const formattedDate = new Date(
        Number.parseInt(currentImageData.timestamp, 10),
      ).toLocaleString();
      let infoHTML = `
        <p><strong>ID:</strong> ${currentImageData.id}</p>
        <p><strong>Timestamp:</strong> ${formattedDate}</p>
        <p><strong>Game Name:</strong> ${currentImageData.gameName}</p>
        <p><strong>Game Mode:</strong> ${currentImageData.gameMode}</p>
        <p><strong>Player Number:</strong> ${currentImageData.playerNumber}</p>
        <p><strong>Device Model:</strong> ${currentImageData.deviceModel}</p>
      `;
      if (
        currentImageData.areas &&
        currentImageData.areas.dealer_hand &&
        currentImageData.areas.dealer_hand.length > 0
      ) {
        infoHTML += '<p><strong>Cards:</strong> ';
        const cards = currentImageData.areas.dealer_hand
          .map((card: any) => card.label)
          .join(', ');
        infoHTML += cards;
        infoHTML += '</p>';
      }
      infoHTML += `
        <details>
          <summary>View JSON Data</summary>
          <div class="json-display">
            <pre id="rawJsonPre">加载中...</pre>
          </div>
        </details>
      `;
      imageInfo.innerHTML = infoHTML;
      // currentOriginalJson = null;
      currentOriginalJsonString = '';
      currentAugmentedData = null;
      if (currentImageData.jsonPath) {
        const url = apiUrl(
          `/api/json-proxy/${encodeURIComponent(currentImageData.jsonPath)}`,
        );
        fetch(url)
          .then((resp) => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const ct = resp.headers.get('content-type') || '';
            if (ct.includes('application/json')) return resp.json();
            return resp.text().then((t) => {
              try {
                return JSON.parse(t);
              } catch {
                return { __raw__: t };
              }
            });
          })
          .then((raw) => {
            // currentOriginalJson = raw;
            currentOriginalJsonString =
              typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
            const pre = document.querySelector('#rawJsonPre');
            if (pre) pre.textContent = currentOriginalJsonString;
            const merged = {
              ...currentImageData,
              overlayMask:
                raw && (raw as any).overlayMask !== undefined
                  ? (raw as any).overlayMask
                  : currentImageData.overlayMask,
              areaConfigs:
                safeParseJSON(currentImageData.areaConfigs) ||
                (raw && (raw as any).areaConfigs),
              areas:
                safeParseJSON(currentImageData.areas) ||
                (raw && (raw as any).areas),
            };
            currentAugmentedData = merged;
            drawBoundingBoxes(currentAugmentedData);
            if (fullscreenModal.classList.contains('active')) {
              drawFullscreenBoundingBoxes(currentAugmentedData);
            }
          })
          .catch((error) => {
            const pre = document.querySelector('#rawJsonPre');
            if (pre) pre.textContent = `加载原始JSON失败: ${error.message}`;
          });
      } else {
        const pre = document.querySelector('#rawJsonPre');
        if (pre) pre.textContent = '无 jsonPath';
      }
      updateImageCounter();
      updateNavigationButtons();
      if (!isSliderDragging) imageSlider.value = String(currentIndex);
      if (fullscreenModal.classList.contains('active')) {
        try {
          const imgResp2 = await fetch(
            apiUrl(
              `/api/image-proxy/${encodeURIComponent(currentImageData.imagePath)}`,
            ),
          );
          if (!imgResp2.ok) throw new Error(`HTTP ${imgResp2.status}`);
          const imgBlob2 = await imgResp2.blob();
          const url2 = URL.createObjectURL(imgBlob2);
          fullscreenImage.src = url2;
        } catch (error) {
          console.error('加载全屏图片失败:', error);
          fullscreenImage.src = '';
        }
        fullscreenImage.addEventListener('load', () => {
          fullscreenCanvas.width = fullscreenImage.naturalWidth;
          fullscreenCanvas.height = fullscreenImage.naturalHeight;
          const aspectRatio =
            fullscreenImage.naturalWidth / fullscreenImage.naturalHeight;
          const maxWidth = window.innerWidth * 0.9;
          const maxHeight = window.innerHeight * 0.8;
          let displayWidth = maxWidth;
          let displayHeight = displayWidth / aspectRatio;
          if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = displayHeight * aspectRatio;
          }
          fullscreenCanvas.style.width = `${displayWidth}px`;
          fullscreenCanvas.style.height = `${displayHeight}px`;
          drawFullscreenBoundingBoxes(currentAugmentedData || currentImageData);
        });
      }
    }

    async function showPreviousImage() {
      if (currentIndex > 0) {
        showImage(currentIndex - 1);
      } else if (currentPage > 1) {
        currentPage--;
        await fetchImages();
        if (images.length > 0) showImage(images.length - 1);
      }
    }

    async function showNextImage() {
      if (currentIndex < images.length - 1) {
        showImage(currentIndex + 1);
      } else if (currentPage < totalPages) {
        currentPage++;
        await fetchImages();
        if (images.length > 0) showImage(0);
      }
    }

    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        showPreviousImage();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        showNextImage();
      }
    }

    async function openFullscreenImage() {
      if (!currentImageData) return;
      try {
        const imgResp = await fetch(
          apiUrl(
            `/api/image-proxy/${encodeURIComponent(currentImageData.imagePath)}`,
          ),
        );
        if (!imgResp.ok) throw new Error(`HTTP ${imgResp.status}`);
        const imgBlob = await imgResp.blob();
        const url = URL.createObjectURL(imgBlob);
        fullscreenImage.src = url;
      } catch (error) {
        console.error('加载全屏图片失败:', error);
        fullscreenImage.src = '';
      }
      fullscreenImage.alt = `Fullscreen Image ${currentImageData.id}`;
      fullscreenModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      fullscreenImage.addEventListener('load', () => {
        fullscreenCanvas.width = fullscreenImage.naturalWidth;
        fullscreenCanvas.height = fullscreenImage.naturalHeight;
        fullscreenCanvas.style.width = `${fullscreenImage.clientWidth}px`;
        fullscreenCanvas.style.height = `${fullscreenImage.clientHeight}px`;
        drawFullscreenBoundingBoxes(currentImageData);
      });
    }

    function closeFullscreenImage() {
      fullscreenModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function goToPreviousPage() {
      if (currentPage > 1) {
        currentPage--;
        fetchImages().then(() => {
          if (images.length > 0) showImage(0);
          else clearImageDisplay();
        });
      }
    }

    function goToNextPage() {
      if (currentPage < totalPages) {
        currentPage++;
        fetchImages().then(() => {
          if (images.length > 0) showImage(0);
          else clearImageDisplay();
        });
      }
    }

    function jumpToPage() {
      const pageNumber = Number.parseInt(pageNumberInput.value, 10);
      if (Number.isNaN(pageNumber) || pageNumber < 1) {
        console.warn('请输入有效的页码');
        return;
      }
      if (pageNumber > totalPages) {
        console.warn(`最大页数为 ${totalPages}`);
        return;
      }
      if (pageNumber !== currentPage) {
        currentPage = pageNumber;
        fetchImages().then(() => {
          if (images.length > 0) showImage(0);
          else clearImageDisplay();
          pageNumberInput.value = '';
        });
      }
    }

    async function startBatchDownload() {
      if (isBatchDownloading) {
        console.warn('批量下载正在进行中，请稍候...');
        return;
      }
      try {
        batchDownloadModal.classList.add('active');
        downloadSettings.style.display = 'block';
        downloadProgress.style.display = 'none';
        downloadComplete.style.display = 'none';
        const params = new URLSearchParams();
        if (gameNameSelect.value)
          params.append('gameName', gameNameSelect.value);
        if (gameModeSelect.value)
          params.append('gameMode', gameModeSelect.value);
        if (playerNumberSelect.value)
          params.append('playerNumber', playerNumberSelect.value);
        if (deviceModelSelect.value)
          params.append('deviceModel', deviceModelSelect.value);
        if (platformSelect && platformSelect.value)
          params.append('platform', platformSelect.value);
        if (startTimeInput.value) {
          const startDateObj = new Date(`${startTimeInput.value}T00:00:00`);
          const startTimestamp = Math.floor(startDateObj.getTime() / 1000);
          if (!Number.isNaN(startTimestamp)) {
            params.append('startTime', String(startTimestamp));
            if (endTimeInput.value) {
              const timeParts = endTimeInput.value.split(':');
              const hh = timeParts[0] || '0';
              const mm = timeParts[1] || '0';
              const endDate = new Date(startDateObj);
              endDate.setHours(
                Number.parseInt(hh, 10),
                Number.parseInt(mm, 10),
                0,
                0,
              );
              if (endDate.getTime() >= startDateObj.getTime()) {
                const endTimestamp = Math.floor(endDate.getTime() / 1000);
                params.append('endTime', String(endTimestamp));
              }
            }
          }
        }
        params.append('countOnly', '1');
        const response = await fetch(apiUrl(`/api/batch-images?${params}`));
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const bodyJson = await response.json();
        const data =
          bodyJson && (bodyJson as any).data
            ? (bodyJson as any).data
            : bodyJson;
        const availableImages = data.totalImages || 0;
        availableCount.textContent = String(availableImages);
        if (maxDownloadCount)
          maxDownloadCount.value = String(Math.min(availableImages, 100));
        const now = new Date();
        const folderName = `images_${now.getFullYear()}${String(
          now.getMonth() + 1,
        ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(
          now.getHours(),
        ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        if (downloadFolderName) downloadFolderName.value = folderName;
        if (availableImages === 0) {
          console.warn('没有找到符合条件的图片');
          closeBatchDownloadModal();
        }
      } catch (error: any) {
        console.error('获取图片信息失败:', error);
        console.warn(`获取图片信息失败: ${error.message}`);
        closeBatchDownloadModal();
      }
    }

    function cancelBatchDownload() {
      // 移除阻塞式 confirm，直接执行取消动作
      batchDownloadCanceled = true;
      closeBatchDownloadModal();
    }

    function closeBatchDownloadModal() {
      batchDownloadModal.classList.remove('active');
      downloadSettings.style.display = 'block';
      downloadProgress.style.display = 'none';
      downloadComplete.style.display = 'none';
      isBatchDownloading = false;
      batchDownloadCanceled = false;
      batchDownloadButton.disabled = false;
      currentBatchImages = [];
      totalDownloadCount.textContent = '0';
      downloadedCount.textContent = '0';
      updateDownloadProgress(0);
      availableCount.textContent = '0';
      if (maxDownloadCount) maxDownloadCount.value = '100';
      if (downloadFolderName) downloadFolderName.value = '';
    }

    async function confirmAndStartDownload() {
      const maxCount = Number.parseInt(maxDownloadCount?.value ?? '0', 10);
      let folderName = (downloadFolderName?.value ?? '').trim();
      if (Number.isNaN(maxCount) || maxCount < 1) {
        console.warn('请输入有效的下载数量');
        return;
      }

      // 如果选择了目录但没有输入文件夹名称，使用默认名称
      if (!folderName) {
        if (selectedDirectoryHandle) {
          const now = new Date();
          folderName = `images_${now.getFullYear()}${String(
            now.getMonth() + 1,
          ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(
            now.getHours(),
          ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        } else {
          console.warn('请输入文件夹名称');
          return;
        }
      }
      try {
        downloadSettings.style.display = 'none';
        downloadProgress.style.display = 'block';
        downloadComplete.style.display = 'none';
        batchDownloadButton.disabled = true;
        isBatchDownloading = true;
        batchDownloadCanceled = false;
        currentFolderName.textContent = folderName;
        const params = new URLSearchParams();
        if (gameNameSelect.value)
          params.append('gameName', gameNameSelect.value);
        if (gameModeSelect.value)
          params.append('gameMode', gameModeSelect.value);
        if (playerNumberSelect.value)
          params.append('playerNumber', playerNumberSelect.value);
        if (deviceModelSelect.value)
          params.append('deviceModel', deviceModelSelect.value);
        if (platformSelect && platformSelect.value)
          params.append('platform', platformSelect.value);
        if (startTimeInput.value) {
          const startDateObj = new Date(`${startTimeInput.value}T00:00:00`);
          const startTimestamp = Math.floor(startDateObj.getTime() / 1000);
          if (!Number.isNaN(startTimestamp)) {
            params.append('startTime', String(startTimestamp));
            if (endTimeInput.value) {
              const timeParts = endTimeInput.value.split(':');
              const hh = timeParts[0] || '0';
              const mm = timeParts[1] || '0';
              const endDate = new Date(startDateObj);
              endDate.setHours(
                Number.parseInt(hh, 10),
                Number.parseInt(mm, 10),
                0,
                0,
              );
              if (endDate.getTime() >= startDateObj.getTime()) {
                const endTimestamp = Math.floor(endDate.getTime() / 1000);
                params.append('endTime', String(endTimestamp));
              }
            }
          }
        }
        if (randomDownloadCheckbox?.checked) params.append('random', '1');
        params.append('limit', String(maxCount));
        const response = await fetch(apiUrl(`/api/batch-images?${params}`));
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const bodyJson = await response.json();
        const data =
          bodyJson && (bodyJson as any).data
            ? (bodyJson as any).data
            : bodyJson;
        let imagesToDownload: any[] = data.images || [];
        if (imagesToDownload.length > maxCount) {
          imagesToDownload = imagesToDownload.slice(0, maxCount);
        }
        currentBatchImages = imagesToDownload;
        totalDownloadCount.textContent = String(currentBatchImages.length);
        downloadedCount.textContent = '0';
        updateDownloadProgress(0);
        await downloadImagesSequentially(folderName);
      } catch (error: any) {
        console.error('批量下载失败:', error);
        console.warn(`批量下载失败: ${error.message}`);
        closeBatchDownloadModal();
      }
    }

    async function downloadImagesSequentially(folderName: string) {
      let downloadedImages = 0;
      for (let i = 0; i < currentBatchImages.length; i++) {
        if (batchDownloadCanceled) break;
        const image = currentBatchImages[i];
        try {
          await downloadSingleImage(image, folderName);
          downloadedImages++;
          downloadedCount.textContent = String(downloadedImages);
          const progress = (downloadedImages / currentBatchImages.length) * 100;
          updateDownloadProgress(progress);
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`下载图片 ${image.id} 失败:`, error);
        }
      }
      if (!batchDownloadCanceled) {
        downloadProgress.style.display = 'none';
        downloadComplete.style.display = 'block';
      }
      isBatchDownloading = false;
      batchDownloadButton.disabled = false;
    }

    function isFileSystemAPISupported() {
      return (
        typeof (window as any).showDirectoryPicker === 'function' &&
        typeof window.isSecureContext === 'boolean' &&
        window.isSecureContext
      );
    }

    async function chooseDirectory() {
      try {
        if (!isFileSystemAPISupported()) {
          console.warn(
            '当前浏览器不支持选择目录功能（需要 HTTPS 环境且支持 File System Access API）。将使用默认下载方式。',
          );
          return;
        }
        // @ts-ignore - File System Access API 在 DOM lib 中处于实验状态，使用 any 以兼容运行环境
        const handle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        selectedDirectoryHandle = handle;
        if (selectedDirectoryNameEl)
          selectedDirectoryNameEl.textContent = handle.name || '已选择目录';
      } catch (error: any) {
        if (error?.name !== 'AbortError') console.error('选择目录失败:', error);
      }
    }

    function clearDirectory() {
      selectedDirectoryHandle = null;
      if (selectedDirectoryNameEl) selectedDirectoryNameEl.textContent = '';
    }

    async function saveBlobToDirectory(
      dirHandle: any,
      relativePath: string,
      blob: Blob,
    ) {
      // relativePath 可能包含子目录
      const parts = relativePath.split('/').filter(Boolean);
      const filename = parts.pop() as string;
      let currentDir = dirHandle;
      for (const part of parts) {
        currentDir = await currentDir.getDirectoryHandle(part, {
          create: true,
        });
      }
      const fileHandle = await currentDir.getFileHandle(filename, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    }

    async function downloadSingleImage(imageData: any, folderName: string) {
      const response = await fetch(
        apiUrl(`/api/download-image/${imageData.imagePath}`),
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const timestamp = new Date(imageData.timestamp)
        .toISOString()
        .replaceAll(/[:.]/g, '-');
      const filename = `${folderName}/${imageData.gameName || 'unknown'}_${
        imageData.gameMode || 'unknown'
      }_${timestamp}_${imageData.id}.jpg`;
      try {
        if (selectedDirectoryHandle && isFileSystemAPISupported()) {
          await saveBlobToDirectory(selectedDirectoryHandle, filename, blob);
        } else {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.append(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        }
      } catch (error) {
        console.error('保存文件失败，回退到浏览器下载:', error);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.append(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    }

    function updateDownloadProgress(percentage: number) {
      const progress = Math.round(percentage);
      downloadProgressBar.style.width = `${progress}%`;
      downloadProgressBar.textContent = `${progress}%`;
    }

    // 事件绑定
    add(gameNameSelect, 'change', applyFilters as any);
    add(gameModeSelect, 'change', applyFilters as any);
    add(playerNumberSelect, 'change', applyFilters as any);
    add(deviceModelSelect, 'change', applyFilters as any);
    if (platformSelect)
      add(platformSelect, 'change', (async () => {
        await refreshFilterOptionsByDate();
        await applyFilters();
      }) as any);
    add(startTimeInput, 'change', (async () => {
      await refreshFilterOptionsByDate();
      await applyFilters();
    }) as any);
    add(endTimeInput, 'change', (async () => {
      await refreshFilterOptionsByDate();
      await applyFilters();
    }) as any);

    add(prevButton, 'click', showPreviousImage as unknown as EventListener);
    if (startTimePickerBtn && startTimeInput) {
      add(startTimePickerBtn, 'click', (() => {
        try {
          startTimeInput.showPicker?.();
        } catch {}
        startTimeInput.focus();
        startTimeInput.click();
      }) as any);
    }
    add(nextButton, 'click', showNextImage as unknown as EventListener);
    add(prevPageButton, 'click', goToPreviousPage as unknown as EventListener);
    add(nextPageButton, 'click', goToNextPage as unknown as EventListener);
    add(jumpToPageButton, 'click', jumpToPage as unknown as EventListener);
    add(pageNumberInput, 'keypress', ((e: KeyboardEvent) => {
      if (e.key === 'Enter') jumpToPage();
    }) as any);
    add(
      batchDownloadButton,
      'click',
      startBatchDownload as unknown as EventListener,
    );
    add(
      cancelDownloadButton,
      'click',
      cancelBatchDownload as unknown as EventListener,
    );
    add(
      closeDownloadModalButton,
      'click',
      closeBatchDownloadModal as unknown as EventListener,
    );
    add(
      confirmDownloadButton,
      'click',
      confirmAndStartDownload as unknown as EventListener,
    );
    add(
      cancelDownloadSettingButton,
      'click',
      closeBatchDownloadModal as unknown as EventListener,
    );
    if (chooseDirectoryBtn)
      add(
        chooseDirectoryBtn,
        'click',
        chooseDirectory as unknown as EventListener,
      );
    if (clearDirectoryBtn)
      add(
        clearDirectoryBtn,
        'click',
        clearDirectory as unknown as EventListener,
      );
    add(showBoundingBoxesCheckbox, 'change', (() => {
      if (currentImageData)
        drawBoundingBoxes(currentAugmentedData || currentImageData);
    }) as any);
    add(currentImage, 'click', openFullscreenImage as unknown as EventListener);
    // 在边界框工具中打开
    function openInBoundingBoxTool() {
      if (!currentImageData) {
        console.warn('请先选择一张图片');
        return;
      }
      const bboxTabBtn = document.querySelector(
        '.tab-button[data-tab="bounding-box-tool"]',
      ) as HTMLButtonElement | null;
      bboxTabBtn?.click();
      fetch(apiUrl(`/api/image-proxy/${currentImageData.imagePath}`))
        .then((response) => {
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          return response.blob();
        })
        .then((blob) => {
          const file = new File([blob], `${currentImageData.id}.jpg`, {
            type: 'image/jpeg',
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          const imageUpload = document.querySelector(
            '#imageUpload',
          ) as HTMLInputElement | null;
          if (imageUpload) {
            imageUpload.files = dataTransfer.files;
            const event = new Event('change', { bubbles: true });
            imageUpload.dispatchEvent(event);
          }
        })
        .catch((error) => {
          console.error('加载图片失败:', error);
          console.warn('加载图片失败，请重试');
        });
    }
    add(
      openInBoundingBoxToolButton,
      'click',
      openInBoundingBoxTool as unknown as EventListener,
    );
    add(
      closeModalButton,
      'click',
      closeFullscreenImage as unknown as EventListener,
    );
    add(fullscreenShowBoundingBoxesCheckbox, 'change', (() => {
      if (currentImageData)
        drawFullscreenBoundingBoxes(currentAugmentedData || currentImageData);
    }) as any);
    add(document, 'keydown', handleKeyPress as unknown as EventListener);
    add(currentImage, 'load', (() => {
      if (currentImageData) {
        boundingBoxCanvas.width = currentImage.naturalWidth;
        boundingBoxCanvas.height = currentImage.naturalHeight;
        boundingBoxCanvas.style.width = `${currentImage.clientWidth}px`;
        boundingBoxCanvas.style.height = `${currentImage.clientHeight}px`;
        drawBoundingBoxes(currentAugmentedData || currentImageData);
      }
    }) as any);
    add(window, 'resize', (() => {
      if (currentImageData) {
        boundingBoxCanvas.style.width = `${currentImage.clientWidth}px`;
        boundingBoxCanvas.style.height = `${currentImage.clientHeight}px`;
        drawBoundingBoxes(currentAugmentedData || currentImageData);
      }
    }) as any);
    add(imageSlider, 'input', (() => {
      isSliderDragging = true;
      const newIndex = Number.parseInt(imageSlider.value);
      if (newIndex !== currentIndex) showImage(newIndex);
    }) as any);
    add(imageSlider, 'change', (() => {
      isSliderDragging = false;
    }) as any);

    (async function init() {
      initAdvancedFilters(); // 初始化高级筛选器功能
      await refreshFilterOptionsByDate();
      await fetchImages();
      if (images.length > 0) showImage(0);
    })();
  })();

  return () => controller.abort();
}
