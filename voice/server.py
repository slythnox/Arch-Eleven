import os
import shutil
import tempfile
import uuid
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import asyncio

app = FastAPI(title="AI Core Voice Server")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Voice server ready! (TTS only - STT disabled)")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    raise HTTPException(
        status_code=501, 
        detail="STT is temporarily disabled. Install openai-whisper manually if needed: pip install openai-whisper"
    )

@app.post("/synthesize")
async def synthesize(
    text: str = Body(..., embed=True),
    voice: str = Body("en-US-AriaNeural", embed=True),
    speed: str = Body("+0%", embed=True)
):
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
        
    try:
        communicate = edge_tts.Communicate(text, voice, rate=speed)
        
        # Create temp file for output
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, f"{uuid.uuid4()}.mp3")
        
        await communicate.save(temp_file)
        
        # Read back bytes
        with open(temp_file, "rb") as f:
            audio_data = f.read()
            
        # Cleanup
        os.remove(temp_file)
        
        from fastapi.responses import Response
        return Response(content=audio_data, media_type="audio/mpeg")
        
    except Exception as e:
        print(f"Synthesis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
