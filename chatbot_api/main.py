from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os, requests
from dotenv import load_dotenv
import google.generativeai as genai

# Load env vars
load_dotenv("keys.env")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
NEWS_DATA_API = os.getenv("NEWS_DATA_API")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)
GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17"

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Chatbot backend is live."}

@app.get("/start")
def start_chat():
    try:
        url = f"https://newsdata.io/api/1/latest?apikey={NEWS_DATA_API}&country=in&language=en"
        res = requests.get(url).json()
        articles = res.get("results", [])[:5]
        if not articles:
            return {"reply": "⚠ Sorry, couldn't fetch news right now."}

        headlines = [f"• {a.get('title')} \n  👉 {a.get('link')}" for a in articles]
        news_list = "\n\n".join(headlines)

        message = (
            "👋 Hey there! Would you like to see the latest headlines?\n\n"
            f"{news_list}\n\n"
            "You can also ask:\n"
            "• How does this website work?\n"
            "• What is fake news detection?\n"
            "• How do you analyze emotion?"
        )
        return {"reply": message}
    except Exception as e:
        return {"reply": f"⚠ Error: {str(e)}"}

EXPLAIN_PROMPT = (
    """You are an AI assistant on a fake news detection website.

Explain clearly and simply how the website works to a non-technical user.

Here is what you should explain:
1. That fake news detection is done using keyword extraction from the article or claim.
2. These keywords are used to search real-time news using the NewsData API.
3. The LangChain RetrievalQA pipeline uses the Google Gemini model to compare the claim with trusted sources.
4. The Gemini AI outputs:
   - Verdict (True or False)
   - A short explanation
   - One most relevant article link
   - Credibility score (0 to 100)
5. Emotion detection is done using a DistilBERT model to classify emotions like joy, anger, sadness, etc.

Speak in a friendly tone, and assume the user is curious, not technical."""
)

@app.get("/explain")
def explain_site():
    try:
        response = genai.generate_content(EXPLAIN_PROMPT, model=GEMINI_MODEL_NAME)
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": f"⚠ Gemini error: {str(e)}"}

@app.post("/chat")
async def chat_with_bot(request: Request):
    data = await request.json()
    user_message = data.get("message", "").lower().strip()

    if not user_message:
        return {"reply": "⚠ Please send a message."}

    try:
        if any(kw in user_message for kw in ["latest", "headlines", "today", "breaking", "news update"]):
            url = f"https://newsdata.io/api/1/latest?apikey={NEWS_DATA_API}&country=in&language=en"
            res = requests.get(url).json()
            articles = res.get("results", [])[:5]

            if not articles:
                return {"reply": "⚠ Sorry, couldn't fetch news right now."}

            summary = "\n\n".join([
                f"📰 {a.get('title')}\n🔗 {a.get('link')}"
                for a in articles
            ])
            return {"reply": f"🗞️ Top Headlines Today:\n\n{summary}"}

        elif any(kw in user_message for kw in ["explain", "how this works", "about website", "how to use"]):
            menu = (
                "ℹ️ What do you want to know?\n"
                "1️⃣ Fact-check\n"
                "2️⃣ Sentiment analysis\n"
                "3️⃣ How to use this site\n"
                "4️⃣ Something else (coming soon!)"
            )
            return {"reply": menu}

        elif user_message in ["1", "2", "3"]:
            if user_message == "1":
                text = (
                    "🔍 **Fact-checking** works by extracting keywords from your claim "
                    "and searching for related news via the NewsData API. We use Gemini to compare "
                    "your input with real news articles and decide whether it's true or false.\n\n"
                    "➡️ Should I redirect you to the **Fact-check** page?"
                )
            elif user_message == "2":
                text = (
                    "😊 **Sentiment analysis** tells you whether a news article feels joyful, angry, sad, etc., "
                    "using a trained DistilBERT model.\n\n"
                    "➡️ Should I redirect you to the **Sentiment analysis** page?"
                )
            else:  # "3"
                text = (
                    "🧭 To use this site:\n"
                    "• Enter or paste a news claim or article.\n"
                    "• Choose whether you want a fact-check or sentiment analysis.\n"
                    "• Review the result with verdicts, emotion labels, and sources.\n\n"
                    "➡️ Want me to guide you to the homepage or start?"
                )
            return {"reply": text}

        # Default: Let Gemini handle it
        # Default: Let Gemini handle it
        model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        response = model.generate_content(user_message)
        return {"reply": response.text.strip()}


    except Exception as e:
        return {"reply": f"⚠ Gemini error: {str(e)}"}
