class AnimationService {
  shake(element: HTMLElement, duration: number = 500) {
    element.classList.add('error-shake');
    setTimeout(() => {
      element.classList.remove('error-shake');
    }, duration);
  }

  flash(element: HTMLElement, duration: number = 300) {
    element.classList.add('error-flash');
    setTimeout(() => {
      element.classList.remove('error-flash');
    }, duration);
  }

  glitch(element: HTMLElement, duration: number = 300) {
    element.classList.add('glitch-text');
    setTimeout(() => {
      element.classList.remove('glitch-text');
    }, duration);
  }

  typeWriter(element: HTMLElement, text: string, speed: number = 50) {
    element.textContent = '';
    let i = 0;
    
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, speed);

    return typeInterval;
  }

  matrixRain(container: HTMLElement, columns: number = 20) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?กขคงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
    
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${(i / columns) * 100}%`;
      column.style.animationDuration = `${10 + Math.random() * 20}s`;
      column.style.animationDelay = `${Math.random() * 5}s`;
      
      let columnText = '';
      const columnHeight = Math.floor(Math.random() * 20) + 10;
      
      for (let j = 0; j < columnHeight; j++) {
        columnText += characters.charAt(Math.floor(Math.random() * characters.length)) + '<br>';
      }
      
      column.innerHTML = columnText;
      container.appendChild(column);
    }
  }

  clearMatrixRain(container: HTMLElement) {
    const columns = container.querySelectorAll('.matrix-column');
    columns.forEach(column => column.remove());
  }

  scanEffect(element: HTMLElement, duration: number = 2000) {
    const scanLine = document.createElement('div');
    scanLine.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00ff00, transparent);
      animation: scan ${duration}ms linear;
      pointer-events: none;
      z-index: 1000;
    `;

    // Add scan animation keyframes if not exists
    if (!document.querySelector('#scan-keyframes')) {
      const style = document.createElement('style');
      style.id = 'scan-keyframes';
      style.textContent = `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(${element.offsetHeight}px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    element.style.position = 'relative';
    element.appendChild(scanLine);

    setTimeout(() => {
      scanLine.remove();
    }, duration);
  }
}

export const animationService = new AnimationService();