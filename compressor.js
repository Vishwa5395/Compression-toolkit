// compressor.js

function showStatus(elementId, message, type = 'info') {
    const el = document.getElementById(elementId);
    el.className = `status-message status-${type}`;
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
}
function showProgress(id) { document.getElementById(id).style.display = 'block'; }
function hideProgress(id) { document.getElementById(id).style.display = 'none'; }
function showDownload(id) { document.getElementById(id).classList.add('show'); }

// ✅ Readable File Compression
document.getElementById('compress_file').addEventListener('click', () => {
    const input = document.getElementById('file_input');
    const file = input.files[0];
    if (!file) return showStatus('file-status', 'Please select a file.', 'error');

    showProgress('file-progress');
    showStatus('file-status', 'Compressing file...', 'info');

    const reader = new FileReader();
    reader.onload = () => {
        const content = reader.result;
        const level = document.getElementById('file-level').value;

        let minified = content;
        if (level === 'medium') {
            minified = content.replace(/\s{2,}/g, ' ').replace(/\n+/g, '\n').trim();
        } else if (level === 'high') {
            minified = content.replace(/\s+/g, ' ').trim();
        }

        const blob = new Blob([minified], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.getElementById('download_link');
        link.href = url;
        link.download = `compressed_${file.name}`;
        hideProgress('file-progress');
        showStatus('file-status', 'File compressed (readable) successfully.', 'success');
        showDownload('file-download');
    };
    reader.onerror = () => showStatus('file-status', 'Failed to read file.', 'error');
    reader.readAsText(file);
});

// ✅ Image Compression
document.getElementById('processBtn').addEventListener('click', () => {
    const input = document.getElementById('imageUpload');
    const file = input.files[0];
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');

    if (!file) return showStatus('image-status', 'Please select an image.', 'error');

    showProgress('image-progress');
    showStatus('image-status', 'Compressing image...', 'info');

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        const scale = Math.min(800 / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const level = document.getElementById('image-level').value;
        let quality = 0.8;
        if (level === 'medium') quality = 0.6;
        else if (level === 'high') quality = 0.4;

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            downloadBtn.href = url;
            downloadBtn.download = `compressed_${file.name}`;
            hideProgress('image-progress');
            showDownload('image-download');
            showStatus('image-status', 'Image compressed successfully.', 'success');
        }, 'image/jpeg', quality);
    };
    img.onerror = () => showStatus('image-status', 'Failed to load image.', 'error');
});

// ✅ Video Compression (frame-based)
document.getElementById('compressBtn').addEventListener('click', () => {
    const input = document.getElementById('videoInput');
    const file = input.files[0];
    const videoStatus = 'video-status';

    if (!file) return showStatus(videoStatus, 'Please select a video.', 'error');

    showProgress('video-progress');
    showStatus(videoStatus, 'Compressing video frame...', 'info');

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth / 2;
        canvas.height = video.videoHeight / 2;
        const ctx = canvas.getContext('2d');
        video.currentTime = 0;
        video.play();

        video.onplay = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            video.pause();
            const level = document.getElementById('video-level').value;
            let quality = 0.9;
            if (level === 'medium') quality = 0.6;
            else if (level === 'high') quality = 0.4;

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.getElementById('downloadLink');
                link.href = url;
                link.download = `compressed_${file.name}`;
                hideProgress('video-progress');
                showDownload('video-download');
                showStatus(videoStatus, 'Video frame compressed successfully.', 'success');
            }, 'video/webm', quality);
        };
    };
    video.onerror = () => showStatus(videoStatus, 'Could not process video.', 'error');
});

// ✅ Show file name after selection
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function () {
        const wrapper = this.closest('.file-input-wrapper');
        const info = wrapper.querySelector('.file-info span');
        if (this.files[0]) info.textContent = `Selected: ${this.files[0].name}`;
    });
});
