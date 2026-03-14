from transformers import MobileNetV2ForImageClassification, MobileNetV2ImageProcessor
from PIL import Image
import io
import torch

# We will load the model here
disease_classifier = None
image_processor = None

def load_model():
    global disease_classifier, image_processor
    try:
        model_name = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
        image_processor = MobileNetV2ImageProcessor.from_pretrained(model_name)
        disease_classifier = MobileNetV2ForImageClassification.from_pretrained(model_name)
        disease_classifier.eval()
        print("Plant disease classifier loaded.")
    except Exception as e:
        print(f"Failed to load plant disease classifier: {e}")

def analyze_crop_photo(image_bytes: bytes):
    global disease_classifier, image_processor
    
    if not disease_classifier:
        load_model()
    
    if not disease_classifier:
        return {"error": "Model could not be loaded"}
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        inputs = image_processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = disease_classifier(**inputs)
        
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        top_prob, top_idx = probabilities.topk(1)
        
        label = disease_classifier.config.id2label[top_idx.item()]
        score = top_prob.item()
        
        # Map to our stress categories
        stress_mapping = {
            'Yellow_Rust': 'nutrient_deficiency',
            'Leaf_Blight': 'pest_risk',
            'Powdery_Mildew': 'pest_risk',
            'Healthy': 'none',
            'Early_Blight': 'pest_risk',
            'Bacterial_Spot': 'pest_risk',
            'Late_Blight': 'pest_risk',
            'Leaf_Mold': 'pest_risk',
            'Target_Spot': 'pest_risk',
            'Spider_mites Two-spotted_spider_mite': 'pest_risk',
            'Black Rot': 'pest_risk',
            'Cedar Apple Rust': 'pest_risk',
            'Scab': 'pest_risk',
            'Mosaic Virus': 'pest_risk',
            'Leaf Curl Virus': 'pest_risk',
        }
        
        # Labels from this model look like: "Tomato with Early Blight", "Healthy Apple" etc.
        is_healthy = 'healthy' in label.lower()
        
        # Extract crop name and condition
        condition = label
        crop = label.split(' ')[0] if label else 'Unknown'
        
        # Try to find matching stress type
        stress_type = 'none' if is_healthy else 'unknown'
        if not is_healthy:
            label_lower = label.lower()
            if any(term in label_lower for term in ['blight', 'rot', 'spot', 'mold', 'mildew', 'rust', 'scab', 'mite', 'spider']):
                stress_type = 'pest_risk'
            elif any(term in label_lower for term in ['yellow', 'curl', 'mosaic', 'virus']):
                stress_type = 'nutrient_deficiency'
            else:
                stress_type = 'pest_risk'
            
        return {
            'detected_condition': condition,
            'confidence': round(score * 100),
            'stress_type': stress_type,
            'crop_detected': crop,
            'is_healthy': is_healthy
        }
    except Exception as e:
        print(f"Error classifying image: {e}")
        return {"error": str(e)}
