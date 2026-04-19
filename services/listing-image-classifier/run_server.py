import os

import uvicorn


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8010"))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("RELOAD", "false").lower() in {"1", "true", "yes", "on"},
    )
