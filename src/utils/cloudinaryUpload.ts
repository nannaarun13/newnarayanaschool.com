
export interface CloudinaryUploadOptions {
  file: Blob;
  onProgress?: (percent: number) => void;
  uploadPreset: string;
  folder?: string;
  cloudName: string; // e.g. 'dpie6aqzf'
}

export async function uploadToCloudinary({
  file,
  onProgress,
  uploadPreset,
  folder,
  cloudName,
}: CloudinaryUploadOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (err) {
          reject(new Error("Invalid Cloudinary server response."));
        }
      } else {
        reject(new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Cloudinary upload failed (network error)."));
    };

    xhr.send(formData);
  });
}

