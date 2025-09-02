// 从 local_images_browser/public/js/bounding-box-tool.js 迁移为模块
export default function initBoundingBoxTool() {
  const controller = new AbortController();
  const { signal } = controller;

  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const filterSection = document.querySelector(
    '#filter-section',
  ) as HTMLElement | null;

  const imageUpload = document.querySelector(
    '#imageUpload',
  ) as HTMLInputElement;
  const drawCanvas = document.querySelector(
    '#draw-canvas',
  ) as HTMLCanvasElement;
  const canvasContainer = document.querySelector(
    '#canvasContainer',
  ) as HTMLElement;
  const xminInput = document.querySelector('#xmin') as HTMLInputElement;
  const yminInput = document.querySelector('#ymin') as HTMLInputElement;
  const widthInput = document.querySelector('#width') as HTMLInputElement;
  const heightInput = document.querySelector('#height') as HTMLInputElement;
  const jsonOutput = document.querySelector(
    '#jsonOutput',
  ) as HTMLTextAreaElement;
  const jsonInput = document.querySelector('#jsonInput') as HTMLTextAreaElement;
  const _copyButton = document.querySelector(
    '#copyButton',
  ) as HTMLButtonElement;
  const parseButton = document.querySelector(
    '#parseButton',
  ) as HTMLButtonElement;

  const add = (
    el: Document | Element | Window,
    type: string,
    handler: EventListener,
  ) => {
    el.addEventListener(type, handler, { signal });
  };

  let image: HTMLImageElement | null = null;
  let coordinates = { xmin: 0, ymin: 0, width: 0, height: 0 };
  let isDrawing = false;
  let startPos = { x: 0, y: 0 };
  const ctx = drawCanvas.getContext('2d') as CanvasRenderingContext2D;

  tabButtons.forEach((button) => {
    add(button, 'click', () => {
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));
      button.classList.add('active');
      const tabId = button as HTMLElement.dataset.tab as string;
      document.querySelector(`#${tabId}-content`)?.classList.add('active');
      if (filterSection)
        filterSection.style.display =
          tabId === 'image-browser' ? 'flex' : 'none';
    });
  });

  function getFormattedText() {
    return `            "relativeX": ${coordinates.xmin.toFixed(4)},
            "relativeY": ${coordinates.ymin.toFixed(4)},
            "relativeWidth": ${coordinates.width.toFixed(4)},
            "relativeHight": ${coordinates.height.toFixed(4)}`;
  }

  function parseFormattedText(text: string) {
    try {
      const clamp01 = (n: number) =>
        Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
      const trimmed = (text || '').trim();
      const jsonStr = trimmed.startsWith('{') ? trimmed : `{${trimmed}}`;
      const parsed = JSON.parse(jsonStr);
      const rx = Number.parseFloat(
        parsed.relativeX ?? parsed.x ?? parsed.xmin ?? parsed.left,
      );
      const ry = Number.parseFloat(
        parsed.relativeY ?? parsed.y ?? parsed.ymin ?? parsed.top,
      );
      const rw = Number.parseFloat(
        parsed.relativeWidth ?? parsed.width ?? parsed.w,
      );
      const rh = Number.parseFloat(
        parsed.relativeHight ??
          parsed.relativeHeight ??
          parsed.height ??
          parsed.h,
      );
      coordinates = {
        xmin: clamp01(rx),
        ymin: clamp01(ry),
        width: clamp01(rw),
        height: clamp01(rh),
      };
      updateInputFields();
      updateJsonOutput();
      drawBox();
    } catch (error) {
      console.error('无效的格式:', error);
      console.warn('无效的JSON格式，请检查输入');
    }
  }

  function updateInputFields() {
    xminInput.value = coordinates.xmin.toFixed(4);
    yminInput.value = coordinates.ymin.toFixed(4);
    widthInput.value = coordinates.width.toFixed(4);
    heightInput.value = coordinates.height.toFixed(4);
  }

  function updateJsonOutput() {
    jsonOutput.value = getFormattedText();
  }

  function loadImageFromFile(file: File) {
    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      image = new Image();
      image.addEventListener('load', () => {
        updateCanvasSize();
        drawBox();
      });
      if (image) {
        image.src = (e.target as FileReader).result as string;
      } else {
        console.warn('未创建图片实例，无法设置图片源');
      }
    });
    reader.readAsDataURL(file);
  }

  [xminInput, yminInput, widthInput, heightInput].forEach((input) => {
    add(input, 'change', ((e: Event) => {
      const target = e.target as HTMLInputElement;
      const { name, value } = target as any;
      (coordinates as any)[name] = Math.max(
        0,
        Math.min(1, Number.parseFloat(value) || 0),
      );
      updateInputFields();
      updateJsonOutput();
      drawBox();
    }) as any);
  });

  add(imageUpload, 'change', ((e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) loadImageFromFile(file);
  }) as any);

  // 解析按钮：从 JSON 输入解析并绘制
  add(parseButton, 'click', ((e: Event) => {
    e.preventDefault?.();
    const text = jsonInput.value || '';
    if (!text.trim()) {
      console.warn('请输入 JSON 坐标');
      return;
    }
    parseFormattedText(text);
  }) as any);

  // 输入框失焦自动解析
  add(jsonInput, 'change', ((e: Event) => {
    const text = (e.target as HTMLTextAreaElement).value || '';
    if (text.trim()) parseFormattedText(text);
  }) as any);

  // 快捷键：Ctrl/Cmd + Enter 解析
  add(jsonInput, 'keydown', ((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const text = jsonInput.value || '';
      if (text.trim()) parseFormattedText(text);
    }
  }) as any);

  function drawBox() {
    if (!image) return;
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    ctx.drawImage(image, 0, 0, drawCanvas.width, drawCanvas.height);
    const boxX = coordinates.xmin * drawCanvas.width;
    const boxY = coordinates.ymin * drawCanvas.height;
    const boxWidth = coordinates.width * drawCanvas.width;
    const boxHeight = coordinates.height * drawCanvas.height;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
  }

  add(drawCanvas, 'mousedown', ((e: MouseEvent) => {
    if (!image) return;
    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / drawCanvas.width;
    const y = (e.clientY - rect.top) / drawCanvas.height;
    isDrawing = true;
    startPos = { x, y };
    coordinates = { xmin: x, ymin: y, width: 0, height: 0 };
    updateInputFields();
    updateJsonOutput();
  }) as any);

  add(drawCanvas, 'mousemove', ((e: MouseEvent) => {
    if (!isDrawing || !image) return;
    const rect = drawCanvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / drawCanvas.width;
    const currentY = (e.clientY - rect.top) / drawCanvas.height;
    const width = currentX - startPos.x;
    const height = currentY - startPos.y;
    if (width < 0) {
      coordinates.xmin = Math.max(0, currentX);
      coordinates.width = Math.min(Math.abs(width), startPos.x);
    } else {
      coordinates.xmin = startPos.x;
      coordinates.width = Math.min(width, 1 - startPos.x);
    }
    if (height < 0) {
      coordinates.ymin = Math.max(0, currentY);
      coordinates.height = Math.min(Math.abs(height), startPos.y);
    } else {
      coordinates.ymin = startPos.y;
      coordinates.height = Math.min(height, 1 - startPos.y);
    }
    updateInputFields();
    updateJsonOutput();
    drawBox();
  }) as any);

  add(drawCanvas, 'mouseup', (() => {
    isDrawing = false;
  }) as any);
  add(drawCanvas, 'mouseleave', (() => {
    isDrawing = false;
  }) as any);

  function updateCanvasSize() {
    if (!image) return;
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight || 400;
    const imageAspectRatio = image.width / image.height;
    const containerAspectRatio = containerWidth / containerHeight;
    if (imageAspectRatio > containerAspectRatio) {
      drawCanvas.width = containerWidth;
      drawCanvas.height = containerWidth / imageAspectRatio;
    } else {
      drawCanvas.height = containerHeight;
      drawCanvas.width = containerHeight * imageAspectRatio;
    }
    drawBox();
  }

  add(window, 'resize', (() => {
    if (image) updateCanvasSize();
  }) as any);

  updateInputFields();
  updateJsonOutput();

  return () => controller.abort();
}
