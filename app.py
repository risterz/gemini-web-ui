"""
Gemini Web Integration - Backend Server
Uses cookie-based authentication with real Gemini API for image generation
"""

from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import os
import time
import base64
import asyncio
import requests
from io import BytesIO
from PIL import Image, ImageEnhance
from dotenv import load_dotenv, set_key
import json
from gemini_webapi import GeminiClient as RealGeminiClient
import io
# from enhancer import ImageEnhancer

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Gemini Cookies from environment
GEMINI_COOKIES = {
    '__Secure-1PSID': os.getenv('GEMINI_COOKIE_1PSID', ''),
    '__Secure-1PSIDTS': os.getenv('GEMINI_COOKIE_1PSIDTS', '')
}


class GeminiClient:
    """
    Real Gemini API client using gemini-webapi library
    Supports actual AI image generation with cookie-based authentication
    """
    
    def __init__(self, cookies):
        self.cookies = cookies
        self.client = None
        self.chat_session = None
        self._initialize_client()
        
    def _initialize_client(self):
        """Initialize the real Gemini client"""
        try:
            # Extract cookie values
            psid = self.cookies.get('__Secure-1PSID', '')
            psidts = self.cookies.get('__Secure-1PSIDTS', '')
            
            if not psid or not psidts:
                print(f"❌ Missing cookies! PSID: {bool(psid)}, PSIDTS: {bool(psidts)}")
                self.client = None
                return
            
            # Create the real Gemini client with cookies as POSITIONAL arguments
            # gemini-webapi expects: GeminiClient(Secure_1PSID, Secure_1PSIDTS)
            # NOT keyword arguments!
            self.client = RealGeminiClient(psid, psidts)
            
            # Verify the session is actually valid
            print("🔄 Verifying session connectivity...")
            try:
                # Minimal test to check if cookies work
                import asyncio
                try:
                    # Using generate_content ("Hello") as handshake
                    asyncio.run(self.client.generate_content("Hello"))
                except RuntimeError:
                    # Fallback for nested loops if necessary
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(self.client.generate_content("Hello"))
                    loop.close()
                    
                print(f"✅ Gemini client initialized and VERIFIED successfully!")
                print(f"   PSID: {psid[:30]}...")
                print(f"   PSIDTS: {psidts[:30]}...")
                
            except Exception as auth_error:
                print(f"❌ Verification Failed: Cookies invalid or expired. {auth_error}")
                self.client = None
                return
        except Exception as e:
            print(f"❌ Failed to initialize Gemini client: {e}")
            import traceback
            traceback.print_exc()
            self.client = None
    
    def validate_cookies(self, cookies=None):
        """Check if cookies are valid"""
        target_cookies = cookies or self.cookies
        
        if not target_cookies.get('__Secure-1PSID'):
            return False, "Missing __Secure-1PSID cookie"
        
        # If using global cookies (no override), check if client is ready
        if not cookies and not self.client:
            return False, "Gemini client not initialized"
        
        return True, "Cookies are valid"
    
    def generate_text(self, prompt):
        """
        Generate text using Gemini
        Used for prompt enhancement
        """
        if not self.client:
            return {"success": False, "error": "Gemini client not initialized"}
            
        try:
            # Send text request using generate_content (standard Gemini API)
            # Since gemini-webapi is async, we must await it.
            # Using asyncio.run to handle the coroutine in this synchronous context.
            response = asyncio.run(self.client.generate_content(prompt))
            
            # Access text attribute safely
            return {"success": True, "text": response.text}
        except Exception as e:
            print(f"❌ Text generation error: {e}")
            # If asyncio.run fails due to existing loop (unlikely in sync Flask), fall back
            if "event loop is already running" in str(e):
                loop = asyncio.get_event_loop()
                response = loop.run_until_complete(self.client.generate_content(prompt))
                return {"success": True, "text": response.text}
                
            return {"success": False, "error": str(e)}

    def generate_images(self, prompt, aspect_ratio='square', quantity=4, reference_image=None, style_preset=None, hd_mode=False, cookies=None):
        """
        Generate images using real Gemini API
        Args:
            cookies: Optional dict override
        """
        # Determine cookies
        current_cookies = cookies or self.cookies
        if not current_cookies or not current_cookies.get('__Secure-1PSID'):
             global GEMINI_COOKIES
             current_cookies = GEMINI_COOKIES
        
        start_time = time.time()
        
        try:
            # Map aspect ratios
            aspect_map = {
                'square': 1.0,      # 1:1
                'landscape': 16/9,  # 16:9
                'portrait': 9/16    # 9:16
            }
            
            # 1. ENHANCED PROMPT ENGINEERING
            # We wrap the prompt in a structured format to encourage high quality and strictly follow instructions.
            # This "code-like" structure can also help with complex prompts.
            
            aspect_desc = aspect_map.get(aspect_ratio, '1:1')
            
            # Base keywords for quality - ONLY if hd_mode is True
            quality_boosters = ""
            if hd_mode:
                quality_boosters = "highly detailed, 8k resolution, photorealistic, cinematic lighting, HDR, professional photography, masterpiece"
            
            # Construct a "System Command" style prompt
            # CRITICAL FIX: Always ask for distinct SINGLE images to prevent grids/collages
            # We rely on the loop or Gemini's natural 'drafts' feature to get multiple images
            # Add dynamic style if provided
            style_instruction = ""
            if style_preset:
                style_instruction = f"> **Style Preset:** {style_preset}"
                # Append style to boosters for reinforcement
                quality_boosters = f"{style_preset}, {quality_boosters}"
            
            # Simplified prompt structure to mimic natural user behavior
            # The previous "System Command" structure was likely confusing the model
            
            # Start with the user's raw prompt
            generation_prompt = prompt
            
            # Add Style
            if style_preset:
                generation_prompt += f", {style_preset} style"
            
            # Add HD Keywords (Optional)
            if hd_mode:
                 generation_prompt += f", {quality_boosters}"
            
            # Add Aspect Ratio (Casual instruction works better than strict commands)
            if aspect_ratio == 'landscape':
                generation_prompt += ", wide view, 16:9 aspect ratio"
            elif aspect_ratio == 'portrait':
                generation_prompt += ", tall view, 9:16 aspect ratio"
                
            # Add Negative Prompt (Subtle)
            generation_prompt += " --no grid, collage, text, watermark, blur"

            print(f"🎨 Generating with simplified prompt: {generation_prompt}")
            
            # Handling Reference Image (Multimodal)
            temp_ref_path = None
            generation_files = []
            
            if reference_image:
                try:
                    import tempfile
                    
                    # Decode base64
                    if "base64," in reference_image:
                        ref_data = base64.b64decode(reference_image.split("base64,")[1])
                    else:
                        ref_data = base64.b64decode(reference_image)
                        
                    # Save to temp file
                    # We use a named temp file but keep it closed so other processes can read it if needed
                    # and we delete it manually later
                    fd, temp_ref_path = tempfile.mkstemp(suffix=".jpg")
                    os.close(fd)
                    
                    with open(temp_ref_path, "wb") as f:
                        f.write(ref_data)
                        
                    generation_files = [temp_ref_path]
                    print(f"📎 Attached reference image: {temp_ref_path}")
                    
                    # For Img2Img, keep it simple too
                    generation_prompt = f"Make a variation of this image: {prompt}"
                    if style_preset:
                        generation_prompt += f" in {style_preset} style"
                        
                except Exception as e:
                    print(f"⚠️ Failed to process reference image: {e}")
            
            # Gemini web interface typically only returns 1-2 images per request
            # So we'll make multiple requests if needed to reach the desired quantity
            all_generated_images = []
            attempts = 0
            max_attempts = quantity * 3  # Increased attempts to ensure we get enough single images
            
            while len(all_generated_images) < quantity and attempts < max_attempts:
                attempts += 1
                print(f"📸 Attempt {attempts}: Requesting images (have {len(all_generated_images)}/{quantity})")
                
                # Run async generation - create new loop each time to avoid conflicts
                async def do_generation():
                    # Create TEMP client with specific cookies for this request
                    temp_client = RealGeminiClient(
                        current_cookies.get('__Secure-1PSID'), 
                        current_cookies.get('__Secure-1PSIDTS')
                    )
                    await temp_client.init(timeout=30, auto_close=False)
                    
                    try:
                        # Generate content with files if present
                        response = await temp_client.generate_content(generation_prompt, files=generation_files)
                        return response
                    except Exception as e:
                        print(f"⚠️ Generation error: {e}")
                        raise e
                
                # Use asyncio.run which handles loop creation and cleanup properly
                try:
                    response = asyncio.run(do_generation())
                except RuntimeError as e:
                    if "Event loop is closed" in str(e):
                        # Fallback: create new event loop
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                        try:
                            response = loop.run_until_complete(do_generation())
                        finally:
                            loop.close()
                    else:
                        raise
                
                # Extract generated images from this response
                if hasattr(response, 'images') and response.images:
                    print(f"✅ Received {len(response.images)} images from Gemini")
                    for image in response.images:
                        if len(all_generated_images) >= quantity:
                            break
                        
                        # Get image URL from Gemini
                        original_url = image.url if hasattr(image, 'url') else str(image)
                        
                        print(f"📐 Enforcing {aspect_ratio} aspect ratio for image...")
                        
                        # Enforce aspect ratio by cropping/resizing
                        processed_image = enforce_aspect_ratio(original_url, aspect_ratio)
                        
                        if processed_image:
                            # Use the processed base64 image
                            image_url = processed_image
                            print(f"✅ Image processed to exact {aspect_ratio} dimensions")
                        else:
                            # Fallback to proxied original if processing fails
                            from urllib.parse import quote
                            image_url = f"/api/proxy-image?url={quote(original_url)}"
                            print(f"⚠️ Using original image (processing failed)")
                        
                        # Avoid duplicates
                        if not any(img['original_url'] == original_url for img in all_generated_images):
                            all_generated_images.append({
                                'url': image_url,  # Use processed or proxied URL
                                'original_url': original_url,  # Keep original for reference
                                'thumbnail': image_url,
                                'index': len(all_generated_images) + 1,
                                'title': getattr(image, 'title', f'Generated Image {len(all_generated_images) + 1}'),
                                'alt': getattr(image, 'alt', prompt[:100])
                            })
                else:
                    print(f"⚠️ No images in this response")
                    # If we got no images, wait a bit before retrying
                    time.sleep(1)
            
            generation_time = time.time() - start_time
            
            
            if not all_generated_images:
                # Fallback if no images generated
                print("⚠️ No images were generated")
                if temp_ref_path and os.path.exists(temp_ref_path):
                    try:
                        os.remove(temp_ref_path)
                    except:
                        pass
                
                return {
                    'success': False,
                    'error': 'No images were generated by Gemini. Try a different prompt.'
                }
            
            # Cleanup temp file
            if temp_ref_path and os.path.exists(temp_ref_path):
                try:
                    os.remove(temp_ref_path)
                    print(f"🧹 Cleaned up temp reference file")
                except:
                    pass
            
            return {
                'success': True, 
                'images': all_generated_images,
                'count': len(all_generated_images),
                'meta': {
                    'prompt': prompt,
                    'time': round(generation_time, 2),
                    'attempts': attempts
                }
            }
            
        except Exception as e:
            print(f"❌ Generation error: {str(e)}")
            
            # Check for auth failure to invalidate session
            error_msg = str(e).lower()
            if "expired" in error_msg or "initialize client" in error_msg or "401" in error_msg:
                print("❌ Auth failure detected. Invalidating client and cookies.")
                self.client = None

            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Failed to generate images: {str(e)}',
                'metadata': {
                    'prompt': prompt,
                    'aspect_ratio': aspect_map.get(aspect_ratio, '1:1'),
                    'quantity': quantity,
                    'generation_time': time.time() - start_time
                }
            }

    def init_chat(self):
        """Initialize or reset the chat session"""
        if not self.client:
            return False
            
        try:
            # Create a new chat session using the properly initialized client
            self.chat_session = self.client.start_chat()
            print("💬 Chat session initialized")
            return True
        except Exception as e:
            print(f"❌ Failed to init chat: {e}")
            return False

    async def send_message(self, message, image=None, cookies=None):
        """Send a message to Gemini (Stateless/No History)"""
        
        # Determine which cookies to use
        # Priority: Method Arg > Instance Cookies > Global Env Vars
        current_cookies = cookies or self.cookies
        
        if not current_cookies or not current_cookies.get('__Secure-1PSID'):
             # Fallback to global if empty
             global GEMINI_COOKIES
             current_cookies = GEMINI_COOKIES
        
        if not current_cookies:
             return {"success": False, "error": "No valid cookies available. Please check .env"}

        try:
            # UNPACK COOKIES! library expects positional args (psid, psidts)
            psid = current_cookies.get('__Secure-1PSID')
            psidts = current_cookies.get('__Secure-1PSIDTS')
            
            if not psid or not psidts:
                return {"success": False, "error": "Missing PSID or PSIDTS in cookies"}
                
            temp_client = RealGeminiClient(psid, psidts)
        except Exception as e:
            return {"success": False, "error": f"Cookie initialization failed: {str(e)}"}
        
        try:
            # Handle image attachment
            generation_files = []
            temp_img_path = None
            
            if image:
                try:
                    import tempfile
                    # Decode base64
                    if "base64," in image:
                        img_data = base64.b64decode(image.split("base64,")[1])
                    else:
                        img_data = base64.b64decode(image)
                        
                    # Save to temp file
                    fd, temp_img_path = tempfile.mkstemp(suffix=".jpg")
                    os.close(fd)
                    
                    with open(temp_img_path, "wb") as f:
                        f.write(img_data)
                        
                    generation_files = [temp_img_path]
                    print(f"📎 Processing image for stateless chat: {temp_img_path}")
                except Exception as e:
                    print(f"⚠️ Failed to process chat image: {e}")

            # Prepare args
            print(f"🚀 Sending stateless request (Image: {bool(generation_files)})")
            
            if generation_files:
                response = await temp_client.generate_content(
                    message, 
                    files=generation_files
                )
            else:
                response = await temp_client.generate_content(message)
            
            # Cleanup
            if temp_img_path and os.path.exists(temp_img_path):
                try:
                    os.remove(temp_img_path)
                except:
                    pass
            
            return {
                "success": True, 
                "text": response.text,
                "history": [] 
            }
        except Exception as e:
            print(f"❌ Chat FATAL error: {e}")
            if temp_img_path and os.path.exists(temp_img_path):
                try:
                    os.remove(temp_img_path)
                except:
                    pass
                
            return {"success": False, "error": str(e)}




# Initialize Gemini client
gemini_client = GeminiClient(GEMINI_COOKIES)
# image_enhancer = ImageEnhancer() # Removed legacy upscaler


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def enforce_aspect_ratio(image_url, target_aspect_ratio):
    """
    Download and crop/resize image to enforce exact aspect ratio
    NOW WITH MAX RESOLUTION PRESERVATION
    
    Args:
        image_url: URL of the image to process
        target_aspect_ratio: 'square', 'landscape', or 'portrait'
    
    Returns:
        Base64 encoded image with correct aspect ratio
    """
    try:
        # Download the image with proper headers and cookies
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gemini.google.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
        
        # Add cookies for Google images
        cookies = {}
        if 'googleusercontent.com' in image_url or 'google.com' in image_url:
            cookies = GEMINI_COOKIES
        
        response = requests.get(image_url, headers=headers, cookies=cookies, timeout=15)
        
        if response.status_code == 403:
            print(f"⚠️ 403 with cookies. Retrying download without cookies/headers...")
            # Retry without cookies AND without restrictive headers (like Referer)
            clean_headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            }
            response = requests.get(image_url, headers=clean_headers, timeout=15)
            
            # 3rd fallback: If still failing and it's googleusercontent, try http instead of https (sometimes helps with varying certs/blocks?)
            # Or just generic retry
            if response.status_code == 403:
                print(f"⚠️ Still 403. Trying generic fallback...")
                response = requests.get(image_url, verify=False, timeout=15) # Last ditch effort

        if response.status_code != 200:
            print(f"❌ Failed to download image: {response.status_code}")
            return None
        
        # Open image with PIL
        img = Image.open(BytesIO(response.content))
        original_width, original_height = img.size
        print(f"📏 Original dimensions: {original_width}x{original_height}")
        
        # Define target aspect ratios
        aspect_ratios = {
            'square': 1.0,      # 1:1
            'landscape': 16/9,  # 16:9
            'portrait': 9/16    # 9:16
        }
        
        target_ratio = aspect_ratios.get(target_aspect_ratio, 1.0)
        current_ratio = original_width / original_height
        
        # Calculate crop dimensions to KEEP MAX RESOLUTION
        if abs(current_ratio - target_ratio) < 0.01:
            # Already correct aspect ratio
            cropped_img = img
            print(f"✓ Image already has correct aspect ratio")
        elif current_ratio > target_ratio:
            # Image is too wide, crop width - Keep full height
            new_width = int(original_height * target_ratio)
            left = (original_width - new_width) // 2
            cropped_img = img.crop((left, 0, left + new_width, original_height))
            print(f"✂️ Cropped width: {original_width} → {new_width} (Height kept: {original_height})")
        else:
            # Image is too tall, crop height - Keep full width
            new_height = int(original_width / target_ratio)
            top = (original_height - new_height) // 2
            cropped_img = img.crop((0, top, original_width, top + new_height))
            print(f"✂️ Cropped height: {original_height} → {new_height} (Width kept: {original_width})")
        
        # --- QUALITY ENHANCEMENT (Safe now that we save to disk) ---
        
        # 1. High-Quality Upscaling (LANCZOS)
        # Target at least 1080p equivalent
        target_min_dim = 1080
        width, height = cropped_img.size
        
        if min(width, height) < target_min_dim:
            scale_factor = target_min_dim / min(width, height)
            # Cap max upscale to avoid blurriness (e.g. max 4x)
            scale_factor = min(scale_factor, 4.0)
            
            new_w = int(width * scale_factor)
            new_h = int(height * scale_factor)
            
            print(f"🔍 Upscaling image: {width}x{height} -> {new_w}x{new_h}")
            cropped_img = cropped_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
        # 2. Smart Sharpening (Makes AI art pop)
        enhancer = ImageEnhance.Sharpness(cropped_img)
        cropped_img = enhancer.enhance(1.3) # 30% sharper
            
        # SAVE TO DISK STRATEGY
        
        # 1. Create directory if not exists
        output_dir = os.path.join(app.root_path, 'static', 'generated')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # 2. Generate unique filename
        import uuid
        filename = f"gen_{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(output_dir, filename)
        
        # 3. Save as HIGH QUALITY JPEG
        # subsampling=0: Best color sampling (4:4:4)
        # quality=98: Near lossless
        cropped_img = cropped_img.convert("RGB")
        cropped_img.save(filepath, format="JPEG", quality=98, subsampling=0)
        print(f"💾 Saved HQ generated image to: {filename}")
        
        # 4. Return URL path
        return f"/static/generated/{filename}"

    except Exception as e:
        print(f"❌ Aspect ratio enforcement failed: {e}")
        import traceback
        traceback.print_exc()
        return None


@app.route('/')
def home():
    """Serve the main interface"""
    return render_template('index.html')


@app.route('/settings')
def settings():
    """Serve the settings page for cookie management"""
    return render_template('settings.html')



@app.route('/api/health', methods=['GET'])
def health_check():
    """Check system health and cookie validity"""
    is_valid, message = gemini_client.validate_cookies()
    
    return jsonify({
        'status': 'healthy' if is_valid else 'unhealthy',
        'cookie_valid': is_valid,
        'message': message,
        'timestamp': time.time()
    })


@app.route('/api/enhance', methods=['POST'])
def enhance_prompt():
    """Enhance a prompt using Gemini"""
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({'success': False, 'error': 'Prompt is required'}), 400
            
        # Construct meta-prompt
        meta_prompt = (
            f"Act as an expert prompt engineer for AI image generation. "
            f"Rewrite the following simple idea into a detailed, high-quality image prompt. "
            f"Focus on visual descriptions, lighting, texture, and style. "
            f"Keep it under 3 sentences. "
            f"Input: '{prompt}' "
            f"Output:"
        )
        
        result = gemini_client.generate_text(meta_prompt)
        
        if result['success']:
            return jsonify({'success': True, 'enhanced_prompt': result['text']})
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/generate', methods=['POST'])
def generate_images():
    """
    Generate images using Gemini
    
    Expected JSON payload:
    {
        "prompt": "A beautiful sunset over mountains",
        "aspect_ratio": "landscape",  # square, landscape, or portrait
        "quantity": 4,  # 1-4
        "reference_image": "base64_encoded_image"  # optional
    }
    """
    
    try:
        data = request.json
        
        # Validate input
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        prompt = data.get('prompt', '').strip()
        if not prompt:
            return jsonify({'success': False, 'error': 'Prompt is required'}), 400
        
        if len(prompt) < 3:
            return jsonify({'success': False, 'error': 'Prompt too short (minimum 3 characters)'}), 400
        
        # Get parameters with defaults
        aspect_ratio = data.get('aspect_ratio', 'square')
        quantity = int(data.get('quantity', 4))
        reference_image = data.get('reference_image')
        selected_style = data.get('style') # New optional parameter
        hd_mode = data.get('hd_mode', False) # New toggle parameter
        
        # Validate aspect ratio
        if aspect_ratio not in ['square', 'landscape', 'portrait']:
            return jsonify({'success': False, 'error': 'Invalid aspect ratio'}), 400
        
        # Validate quantity
        if quantity < 1 or quantity > 4:
            return jsonify({'success': False, 'error': 'Quantity must be between 1 and 4'}), 400
        
        # Extract user cookies if provided
        user_cookies_data = data.get('cookies')
        user_cookies = None
        
        if user_cookies_data and user_cookies_data.get('psid'):
            user_cookies = {
                '__Secure-1PSID': user_cookies_data.get('psid'),
                '__Secure-1PSIDTS': user_cookies_data.get('psidts')
            }

        # Check cookies
        is_valid, message = gemini_client.validate_cookies(cookies=user_cookies)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': 'Cookie authentication failed',
                'details': message,
                'action': 'Please update your cookies in Settings'
            }), 401
        
        # Generate images
        result = gemini_client.generate_images(
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            quantity=quantity,
            reference_image=reference_image,
            style_preset=selected_style, # Pass the style
            hd_mode=hd_mode, # Pass the toggle state
            cookies=user_cookies # Pass user cookies
        )
        
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'success': False, 'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        app.logger.error(f"Generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate images',
            'details': str(e)
        }), 500


@app.route('/api/upscale', methods=['POST'])
def upscale_image():
    """Upscale an image by 2x"""
    try:
        data = request.json
        image_url = data.get('image')
        
        if not image_url:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Handle base64 or URL
        # Handle base64, local file, or URL
        if image_url.startswith('data:image'):
            # Base64
            img_data = base64.b64decode(image_url.split(',')[1])
            img = Image.open(BytesIO(img_data))
        elif image_url.startswith('/static/'):
            # Local static file
            # Remove leading slash and join with root path
            local_path = os.path.join(app.root_path, image_url.lstrip('/'))
            if not os.path.exists(local_path):
                return jsonify({'success': False, 'error': f'File not found: {image_url}'}), 404
            img = Image.open(local_path)
        else:
            # URL download
            response = requests.get(image_url, timeout=15)
            img = Image.open(BytesIO(response.content))
            
        # Get current size
        width, height = img.size
        
        # Limit max size to avoid crashes (e.g., max 4K-8K)
        max_dim = 4096
        if max(width, height) >= max_dim:
             return jsonify({'success': False, 'error': 'Image is already at maximum resolution'}), 400
             
        # Upscale 2x
        new_size = (width * 2, height * 2)
        upscaled_img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Apply Sharpening to make the upscale look "higher quality"
        # 1.0 is original, 1.5 is sharper
        enhancer = ImageEnhance.Sharpness(upscaled_img)
        upscaled_img = enhancer.enhance(1.5)
        
        # Convert back to base64
        buffered = BytesIO()
        upscaled_img.save(buffered, format="PNG", optimize=True)
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image_url': f"data:image/png;base64,{img_base64}",
            'new_size': new_size
        })

    except Exception as e:
        app.logger.error(f"Upscale error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Handle reference image uploads"""
    
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, WebP'
            }), 400
        
        # Read and validate image
        img_data = file.read()
        
        if len(img_data) > MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'error': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB'
            }), 400
        
        # Open with PIL to validate and potentially resize
        img = Image.open(BytesIO(img_data))
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        
        # Resize if too large (max 2048px on longest side)
        max_dimension = 2048
        if max(img.size) > max_dimension:
            ratio = max_dimension / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format='JPEG', quality=85)
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image_data': f'data:image/jpeg;base64,{img_base64}',
            'size': len(img_base64),
            'dimensions': img.size
        })
        
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process image',
            'details': str(e)
        }), 500


@app.route('/api/proxy-image')
def proxy_image():
    """
    Proxy endpoint to download and serve Google-hosted images
    This bypasses CORS/SameSite security restrictions
    """
    image_url = request.args.get('url')
    
    if not image_url:
        return jsonify({'error': 'No URL provided'}), 400
    
    try:
        # Download the image from Google with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gemini.google.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
        
        # Add cookies if the URL is from Google
        cookies = {}
        if 'googleusercontent.com' in image_url or 'google.com' in image_url:
            cookies = GEMINI_COOKIES
        
        response = requests.get(image_url, headers=headers, cookies=cookies, timeout=15)
        
        # Retry logic: If 403 Forbidden, try WITHOUT cookies
        if response.status_code == 403:
             print(f"Proxy: 403 with cookies. Retrying {image_url[:30]}... without cookies/headers")
             clean_headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
             }
             response = requests.get(image_url, headers=clean_headers, timeout=15)
             
             if response.status_code == 403:
                 # Last ditch
                 response = requests.get(image_url, verify=False, timeout=15)
        
        if response.status_code != 200:
            app.logger.error(f"Failed to fetch image: {response.status_code}")
            return jsonify({'error': f'Failed to fetch image: {response.status_code}'}), 500
        
        # Determine content type
        content_type = response.headers.get('Content-Type', 'image/png')
        
        # Return the image with proper headers
        return Response(
            response.content,
            mimetype=content_type,
            headers={
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*'
            }
        )
        
    except Exception as e:
        app.logger.error(f"Proxy error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# Endpoint removed - deprecated/legacy code
# @app.route('/api/upscale', methods=['POST'])
# def upscale_image_endpoint():
#     return jsonify({'error': 'Deprecated'}), 410


@app.route('/static/<path:path>')
def send_static(path):
    """Serve static files"""
    return send_from_directory('static', path)


@app.route('/api/update_cookies', methods=['POST'])
def update_cookies():
    """Updates the Gemini cookies in .env and re-initializes the client."""
    try:
        data = request.json
        psid = data.get('psid')
        psidts = data.get('psidts')
        
        if not psid or not psidts:
            return jsonify({'success': False, 'error': 'Both cookies are required'})
            
        # 1. Update .env file (Persistent)
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        set_key(env_path, "GEMINI_COOKIE_1PSID", psid)
        set_key(env_path, "GEMINI_COOKIE_1PSIDTS", psidts)
        
        # 2. Update current environment (Hot Swap)
        os.environ["GEMINI_COOKIE_1PSID"] = psid
        os.environ["GEMINI_COOKIE_1PSIDTS"] = psidts
        
        # Update global dictionary used by proxy/downloader
        GEMINI_COOKIES['__Secure-1PSID'] = psid
        GEMINI_COOKIES['__Secure-1PSIDTS'] = psidts
        
        # 3. Reload Gemini Client
        gemini_client.cookies['__Secure-1PSID'] = psid
        gemini_client.cookies['__Secure-1PSIDTS'] = psidts
        gemini_client._initialize_client()
             
        print("✅ Cookies updated via Web Interface. Client re-initialized.")
        
        return jsonify({'success': True, 'message': 'Cookies updated successfully!'})
        
    except Exception as e:
        print(f"❌ Error updating cookies: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/chat/send', methods=['POST'])
def send_chat_message():
    """Handle chat messages"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        image = data.get('image')
        
        if not message and not image:
            return jsonify({'success': False, 'error': 'Message or image is required'}), 400
            
        # Extract user cookies if provided
        user_cookies_data = data.get('cookies')
        user_cookies = None
        
        if user_cookies_data and user_cookies_data.get('psid'):
            user_cookies = {
                '__Secure-1PSID': user_cookies_data.get('psid'),
                '__Secure-1PSIDTS': user_cookies_data.get('psidts')
            }
        
        # Run async method in sync context
        # If user_cookies contains PSID/PSIDTS, temporary client will use them
        if user_cookies:
            # Better approach: Pass cookies to send_message
            result = asyncio.run(gemini_client.send_message(message, image, cookies=user_cookies))
        else:
            result = asyncio.run(gemini_client.send_message(message, image))
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        app.logger.error(f"Chat API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500





if __name__ == '__main__':
    # Check if cookies are configured
    if not GEMINI_COOKIES.get('__Secure-1PSID'):
        print("\n" + "="*60)
        print("⚠️  WARNING: Gemini cookies not configured!")
        print("="*60)
        print("\nPlease follow these steps:")
        print("1. Copy .env.example to .env")
        print("2. Follow COOKIE_GUIDE.md to extract your cookies")
        print("3. Update the .env file with your cookie values")
        print("\nThe server will start, but image generation won't work")
        print("until you configure your cookies.\n")
    
    # Run the Flask app
    print("\n🚀 Starting Gemini Web Integration Server...")
    print("📍 Access the app at: http://127.0.0.1:5000")
    print("\nPress Ctrl+C to stop the server\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
