document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const imageUpload = document.getElementById('imageUpload');
    const preview = document.getElementById('preview');
    const createGIFButton = document.getElementById('createGIF');
    const speedRange = document.getElementById('speedRange');
    const speedValueDisplay = document.createElement('span');
    const maxFramesDisplay = document.createElement('div');
    const recommendedSpeedDisplay = document.createElement('div');
  
    const MAX_FRAMES = 20; // 최대 20장까지 허용
  
    // 속도 표시 초기화
    speedValueDisplay.id = 'speedValue';
    speedValueDisplay.textContent = `${speedRange.value} ms`;
    speedRange.insertAdjacentElement('afterend', speedValueDisplay);
  
    // 최대 프레임 수 표시
    maxFramesDisplay.id = 'maxFrames';
    maxFramesDisplay.textContent = `최대 업로드 가능 이미지 수: ${MAX_FRAMES}장`;
    speedRange.insertAdjacentElement('beforebegin', maxFramesDisplay);
  
    // 추천 속도 표시
    recommendedSpeedDisplay.id = 'recommendedSpeed';
    recommendedSpeedDisplay.style.marginTop = '10px';
    speedRange.insertAdjacentElement('afterend', recommendedSpeedDisplay);
  
    speedRange.addEventListener('input', () => {
      speedValueDisplay.textContent = `${speedRange.value} ms`;
      updateRecommendedSpeed();
    });
  
    let images = [];
  
    dropZone.addEventListener('click', () => imageUpload.click());
  
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.backgroundColor = '#e0e0e0';
    });
  
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.backgroundColor = '#fafafa';
    });
  
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.backgroundColor = '#fafafa';
      handleFiles(e.dataTransfer.files);
    });
  
    imageUpload.addEventListener('change', (e) => handleFiles(e.target.files));
  
    function handleFiles(files) {
      if (images.length + files.length > MAX_FRAMES) {
        alert(`최대 ${MAX_FRAMES}장의 이미지만 업로드할 수 있습니다.`);
        return;
      }
  
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.draggable = true;
  
          img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', images.indexOf(img));
          });
  
          img.addEventListener('dragover', (e) => e.preventDefault());
  
          img.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text'), 10);
            const toIndex = images.indexOf(img);
  
            if (fromIndex !== toIndex) {
              const temp = images[fromIndex];
              images[fromIndex] = images[toIndex];
              images[toIndex] = temp;
              renderPreview();
            }
          });
  
          img.onload = () => {
            images.push(img);
            renderPreview();
            updateRecommendedSpeed();
          };
        };
        reader.readAsDataURL(file);
      });
    }
  
    function renderPreview() {
      preview.innerHTML = '';
      images.forEach(img => preview.appendChild(img));
    }
  
    function updateRecommendedSpeed() {
      let recommendedSpeed;
      const frameCount = images.length;
  
      if (frameCount <= 5) {
        recommendedSpeed = '800~1000ms (느린 움직임)';
      } else if (frameCount <= 10) {
        recommendedSpeed = '400~600ms (보통 움직임)';
      } else {
        recommendedSpeed = '100~300ms (자연스러운 빠른 움직임)';
      }
  
      if (frameCount > 1) {
        recommendedSpeedDisplay.textContent = `추천 속도: ${recommendedSpeed}`;
      } else {
        recommendedSpeedDisplay.textContent = '';
      }
    }
  
    createGIFButton.addEventListener('click', () => {
      if (images.length < 2) {
        alert('GIF를 생성하려면 최소 2장의 이미지를 업로드하세요.');
        return;
      }
  
      const imageSrcs = images.map(img => img.src);
  
      gifshot.createGIF({
        images: imageSrcs,
        interval: speedRange.value / 1000, // ms 단위를 초로 변환
        gifWidth: images[0].width,
        gifHeight: images[0].height,
      }, function (obj) {
        if (!obj.error) {
          const gifImage = new Image();
          gifImage.src = obj.image;
  
          const downloadLink = document.createElement('a');
          downloadLink.href = obj.image;
          downloadLink.download = 'generated.gif';
          downloadLink.textContent = 'GIF 다운로드';
          downloadLink.style.display = 'block';
          downloadLink.style.marginTop = '10px';
  
          preview.innerHTML = '';
          preview.appendChild(gifImage);
          preview.appendChild(downloadLink);
        } else {
          console.error('GIF 생성 오류:', obj.error);
          alert('GIF 생성 중 오류가 발생했습니다.');
        }
      });
    });
  });
  