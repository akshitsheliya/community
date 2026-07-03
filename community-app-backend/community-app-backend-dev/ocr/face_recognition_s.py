import face_recognition
import json
import sys
import numpy as np
import os

def process_photo(photo_path):
    """Process a photo and return all face embeddings."""
    try:
        sys.stderr.write(f"Attempting to access file: {photo_path}\n")  # Debug to stderr
        if not os.path.exists(photo_path):
            return {"error": f"File not found: {photo_path}", "faces": []}
        image = face_recognition.load_image_file(photo_path)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return {"error": "No faces detected", "faces": []}
        
        faces = [{"embedding": encoding.tolist(), "distance": 0.0} for encoding in encodings]
        return {"error": None, "faces": faces}
    except Exception as e:
        return {"error": str(e), "faces": []}

def process_selfie(selfie_path):
    """Process a selfie and return its embedding."""
    try:
        sys.stderr.write(f"Attempting to access file: {selfie_path}\n")  # Debug to stderr
        if not os.path.exists(selfie_path):
            return {"error": f"File not found: {selfie_path}", "embedding": None}
        image = face_recognition.load_image_file(selfie_path)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return {"error": "No faces detected", "embedding": None}
        
        return {"error": None, "embedding": encodings[0].tolist()}
    except Exception as e:
        return {"error": str(e), "embedding": None}

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments: path and mode required"}))
        return

    photo_path = sys.argv[1]
    mode = sys.argv[2]

    if mode == "process":
        result = process_photo(photo_path)
    elif mode == "selfie":
        result = process_selfie(photo_path)
    else:
        result = {"error": "Invalid mode"}

    print(json.dumps(result))

if __name__ == "__main__":
    main()

# import json
# import sys
# import numpy as np
# import os
# import logging
# from deepface import DeepFace

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     handlers=[logging.StreamHandler(sys.stderr)]
# )
# logger = logging.getLogger(__name__)

# def normalize_embedding(embedding):
#     """Normalize embedding to unit length for consistent clustering."""
#     norm = np.linalg.norm(embedding)
#     if norm == 0:
#         logger.warning("Zero-norm embedding detected")
#         return embedding
#     return embedding / norm

# def filter_low_quality_embedding(embedding, min_norm=0.1):
#     """Filter out low-quality embeddings based on norm."""
#     norm = np.linalg.norm(embedding)
#     if norm < min_norm:
#         logger.warning(f"Low-quality embedding (norm={norm:.3f})")
#         return False
#     return True

# def deduplicate_embeddings(embeddings, threshold=0.3):
#     """Remove near-identical embeddings within a photo."""
#     if not embeddings:
#         return embeddings
    
#     logger.info(f"Deduplicating {len(embeddings)} embeddings")
#     deduped = []
#     for i, emb in enumerate(embeddings):
#         is_unique = True
#         for existing in deduped:
#             distance = np.sqrt(np.sum((np.array(emb) - np.array(existing)) ** 2))
#             if distance < threshold:
#                 logger.debug(f"Skipping duplicate embedding {i}, distance={distance:.3f}")
#                 is_unique = False
#                 break
#         if is_unique:
#             deduped.append(emb)
    
#     logger.info(f"After deduplication: {len(deduped)} embeddings")
#     return deduped

# def process_photo(photo_path):
#     """Process a photo and return all unique, normalized face embeddings."""
#     try:
#         logger.info(f"Processing photo: {photo_path}")
#         if not os.path.exists(photo_path):
#             logger.error(f"File not found: {photo_path}")
#             return {"error": f"File not found: {photo_path}", "faces": []}
        
#         # Use DeepFace to detect and embed all faces
#         results = DeepFace.represent(
#             img_path=photo_path,
#             model_name="Facenet512",
#             detector_backend="retinaface",
#             align=True,
#             enforce_detection=False
#         )
        
#         if not results:
#             logger.info("No faces detected")
#             return {"error": "No faces detected", "faces": []}
        
#         logger.info(f"Detected {len(results)} faces")
        
#         # Filter and normalize embeddings
#         embeddings = []
#         for result in results:
#             embedding = result["embedding"]
#             if filter_low_quality_embedding(embedding):
#                 normalized = normalize_embedding(embedding).tolist()
#                 embeddings.append(normalized)
#             else:
#                 logger.warning("Skipped low-quality embedding")
        
#         if not embeddings:
#             logger.info("No high-quality embeddings after filtering")
#             return {"error": "No high-quality embeddings", "faces": []}
        
#         # Deduplicate embeddings
#         deduped_embeddings = deduplicate_embeddings(embeddings, threshold=0.3)
        
#         result = [
#             {"embedding": emb, "distance": 0.0} for emb in deduped_embeddings
#         ]
#         logger.info(f"Returning {len(result)} unique faces")
#         return {"error": None, "faces": result}
    
#     except Exception as e:
#         logger.error(f"Error processing photo: {str(e)}")
#         return {"error": str(e), "faces": []}

# def process_selfie(selfie_path):
#     """Process a selfie and return a single normalized embedding."""
#     try:
#         logger.info(f"Processing selfie: {selfie_path}")
#         if not os.path.exists(selfie_path):
#             logger.error(f"File not found: {selfie_path}")
#             return {"error": f"File not found: {selfie_path}", "embedding": None}
        
#         # Use DeepFace for selfie
#         result = DeepFace.represent(
#             img_path=selfie_path,
#             model_name="Facenet512",
#             detector_backend="retinaface",
#             align=True,
#             enforce_detection=True
#         )
        
#         if not result:
#             logger.info("No faces detected in selfie")
#             return {"error": "No faces detected", "embedding": None}
        
#         embedding = result[0]["embedding"]
#         if not filter_low_quality_embedding(embedding):
#             logger.warning("Low-quality selfie embedding")
#             return {"error": "Low-quality embedding", "embedding": None}
        
#         normalized = normalize_embedding(embedding).tolist()
#         logger.info("Selfie processed successfully")
#         return {"error": None, "embedding": normalized}
    
#     except Exception as e:
#         logger.error(f"Error processing selfie: {str(e)}")
#         return {"error": str(e), "embedding": None}

# def main():
#     if len(sys.argv) != 3:
#         logger.error("Invalid arguments: path and mode required")
#         print(json.dumps({"error": "Invalid arguments: path and mode required"}))
#         return

#     photo_path = sys.argv[1]
#     mode = sys.argv[2]

#     if mode == "process":
#         result = process_photo(photo_path)
#     elif mode == "selfie":
#         result = process_selfie(photo_path)
#     else:
#         logger.error(f"Invalid mode: {mode}")
#         result = {"error": "Invalid mode"}

#     print(json.dumps(result))

# if __name__ == "__main__":
#     main()    