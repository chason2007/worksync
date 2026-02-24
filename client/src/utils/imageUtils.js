const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
        img.src = src;
    });
};

const getResizedDimensions = (width, height, maxWidth, maxHeight) => {
    let newWidth = width;
    let newHeight = height;

    if (width > height) {
        if (width > maxWidth) {
            newHeight *= maxWidth / width;
            newWidth = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            newWidth *= maxHeight / height;
            newHeight = maxHeight;
        }
    }
    return { width: newWidth, height: newHeight };
};

const createBlobFromCanvas = (canvas, fileType) => {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, fileType, 0.7);
    });
};

export const resizeImage = async (file, maxWidth = 500, maxHeight = 500) => {
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);

    const { width, height } = getResizedDimensions(img.width, img.height, maxWidth, maxHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await createBlobFromCanvas(canvas, file.type);

    return new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
    });
};
