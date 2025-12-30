
import cv2
import os
import requests
from cv2 import dnn_superres

class ImageEnhancer:
    def __init__(self, model_name="edsr", scale=4):
        self.model_name = model_name
        self.scale = scale
        self.models_dir = os.path.join(os.path.dirname(__file__), "models")
        
        # Ensure models directory exists
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)
            
        self.model_filename = f"{model_name.upper()}_x{scale}.pb" # e.g. EDSR_x4.pb
        self.model_path = os.path.join(self.models_dir, self.model_filename)
        
        # Initialize model
        self.sr = dnn_superres.DnnSuperResImpl_create()
        self._ensure_model_file()
        
        try:
            self.sr.readModel(self.model_path)
            self.sr.setModel(model_name, scale)
            print(f"✅ ImageEnhancer initialized with {self.model_filename}")
        except Exception as e:
            print(f"❌ Failed to load upscaling model: {e}")
            # Fallback or re-download logic could go here
            self.sr = None

    def _ensure_model_file(self):
        """Downloads the model file if it doesn't exist."""
        if os.path.exists(self.model_path):
            return
            
        print(f"⬇️ Downloading super-resolution model: {self.model_filename}...")
        
        # URLs for common models
        # EDSR x4 is large (~100MB) but best quality
        url = ""
        if self.model_name == "edsr" and self.scale == 4:
            # Using a reliable mirror or GitHub raw link. 
            # This repo is often used for OpenCV tutorials
            url = "https://github.com/Saafke/EDSR_Tensorflow/raw/master/models/EDSR_x4.pb"
        elif self.model_name == "fsrcnn" and self.scale == 4:
            url = "https://github.com/Saafke/FSRCNN_Tensorflow/raw/master/models/FSRCNN_x4.pb"
            
        if not url:
            print(f"❌ No download URL for {self.model_filename}")
            return
            
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            with open(self.model_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"✅ Model downloaded to {self.model_path}")
        except Exception as e:
            print(f"❌ Failed to download model: {e}")

    def upscale_image(self, input_path, output_path):
        """Upscales the image found at input_path and saves to output_path."""
        if not self.sr:
            raise RuntimeError("Enhancer model not loaded correctly.")
            
        image = cv2.imread(input_path)
        if image is None:
            raise ValueError(f"Could not read image at {input_path}")
            
        # Upscale
        result = self.sr.upsample(image)
        
        # Save
        cv2.imwrite(output_path, result)
        return output_path
