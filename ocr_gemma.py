# ocr_and_gemma3n.py

import os
from dotenv import load_dotenv
from paddleocr import PaddleOCR
import torch
from transformers import AutoProcessor, Gemma3nForConditionalGeneration, login

# Load environment variables from .env (must contain HF_TOKEN)
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
assert HF_TOKEN, "Please set HF_TOKEN in your .env file"

# Log in to Hugging Face
login(token=HF_TOKEN)

def run_ocr(image_path: str, device: str = "gpu:0") -> str:
    ocr = PaddleOCR(device=device, lang="en", use_angle_cls=True)
    result = ocr.ocr(image_path, cls=True)
    lines = [text_line[1][0].strip() for text_line in result]
    return "\n".join(lines)

def ask_gemma3n(ocr_text: str, model_id: str = "google/gemma-3n-E4B-it") -> str:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    processor = AutoProcessor.from_pretrained(model_id)
    model = Gemma3nForConditionalGeneration.from_pretrained(model_id).to(device)

    messages = [
        {"role": "system", "content": [{"type": "text", "text": "You are a helpful assistant."}]},
        {"role": "user", "content": [
            {"type": "text", "text": "What am I signing for?"},
            {"type": "text", "text": ocr_text}
        ]}
    ]

    inputs = processor.apply_chat_template(messages, add_generation_prompt=True,
                                           tokenize=True, return_tensors="pt")
    inputs = inputs.to(device, dtype=model.dtype)

    with torch.inference_mode():
        out = model.generate(**inputs, max_new_tokens=256)
    gen = out[:, inputs["input_ids"].shape[-1]:]
    return processor.batch_decode(gen, skip_special_tokens=True)[0]

def main():
    img = "example.jpg"
    print("🔍 OCR processing...")
    text = run_ocr(img)
    print(f"✅ OCR done — extracted {len(text)} chars.")

    print("🤖 Querying Gemma 3n...")
    summary = ask_gemma3n(text)
    print("\n📄 Gemma 3n says:\n", summary)

if __name__ == "__main__":
    main()
