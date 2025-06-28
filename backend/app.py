from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, re, requests
from newspaper import Article
from dotenv import load_dotenv

from langchain.schema import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
import nltk
import spacy

# Load environment variables
load_dotenv()

# Setup FastAPI app
app = FastAPI()

# Download required nltk tokenizer
nltk.download('punkt')

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
NEWS_DATA_API = os.getenv("NEWS_DATA_API")

# Load models
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17", google_api_key=GOOGLE_API_KEY)

# Prompt template
prompt_template = PromptTemplate.from_template("""
You are a professional fact-checking assistant. Your task is to analyze a claim and assess its truthfulness using the provided context from multiple news sources.

---

Claim:
"{question}"

Context:
{context}

---

Respond in exactly the following structured format **without adding extra text or labels**. Each field must be on a new line, and no field should contain information from other fields.

---

Verdict: [True or False]

Explanation: A clear, neutral, 7-8 line explanation of why the claim is true or false. Do NOT mention specific sources, percentages, or URLs here. Do NOT include the Credibility Score here.

Source: A single direct link to the most relevant article (only the URL, no title or description).

Credibility_Score: A number from 0 to 100 representing your confidence in the credibility of the source (just the number, no % sign, no explanation).
""")

# Request models
class FactCheckRequest(BaseModel):
    url: str

class ExtensionFactCheckRequest(BaseModel):
    text: str

# Helpers
def top_4_keywords_string(sentence):
    sentence = re.sub(r"[’‘“”]", "'", sentence)
    doc = nlp(sentence)

    keywords = [
        token.lemma_.lower()
        for token in doc
        if token.pos_ in {"PROPN", "NOUN", "ADJ"} and not token.is_stop and token.is_alpha
    ]
    seen = set()
    unique_keywords = []
    for word in keywords:
        if word not in seen:
            seen.add(word)
            unique_keywords.append(word)
    return " ".join(unique_keywords[:4])

def url_to_news_text(news_url):
    article = Article(news_url)
    article.download()
    article.parse()
    return article.title

def get_new_data(query):
    url = f"https://newsdata.io/api/1/latest?apikey={NEWS_DATA_API}&q={query}"
    return requests.get(url).json()

def json_to_documents(json_data):
    documents = []
    for article in json_data.get("results", []):
        if not isinstance(article, dict):
            continue
        if article.get("language", "").lower() != "english":
            continue
        content = f"Title: {article.get('title', '')}\nDescription: {article.get('description', '')}\nSource: {article.get('link', '')}"
        documents.append(Document(page_content=content, metadata={"source": article.get("link")}))
    return documents

def parse_response(text: str):
    lines = text.strip().splitlines()
    verdict, explanation, source, credibility_score = "Uncertain", "", "", 0
    collecting_explanation = False
    for line in lines:
        lower = line.lower().strip()
        if lower.startswith("verdict:"):
            verdict = line.split(":", 1)[1].strip()
            collecting_explanation = False
        elif lower.startswith("explanation:"):
            explanation = line.split(":", 1)[1].strip()
            collecting_explanation = True
        elif lower.startswith("source:"):
            source = line.split(":", 1)[1].strip()
            collecting_explanation = False
        elif lower.startswith("credibility_score:"):
            try:
                credibility_score = int(line.split(":", 1)[1].strip())
            except:
                credibility_score = 0
            collecting_explanation = False
        elif collecting_explanation:
            explanation += " " + line.strip()
    return {
        "verdict": verdict,
        "explanation": explanation.strip(),
        "source": source,
        "credibility_score": credibility_score
    }

# Endpoints
@app.post("/factcheck")
async def fact_check(request: FactCheckRequest):
    try:
        if not request.url:
            return {"error": "No URL provided"}
        news_text = url_to_news_text(request.url)
        query = top_4_keywords_string(news_text)
        raw_news = get_new_data(query)
        docs = json_to_documents(raw_news)
        if not docs:
            return {"error": "No relevant news articles found"}
        vectorstore = FAISS.from_documents(docs, embeddings)
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=vectorstore.as_retriever(),
            return_source_documents=True,
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt_template}
        )
        response = qa_chain.invoke({"query": news_text})
        result = parse_response(response["result"])
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/extension")
async def extension(request: ExtensionFactCheckRequest):
    try:
        query = top_4_keywords_string(request.text)
        raw_news = get_new_data(query)
        docs = json_to_documents(raw_news)
        if not docs:
            return {"error": "No relevant news articles found"}
        vectorstore = FAISS.from_documents(docs, embeddings)
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=vectorstore.as_retriever(),
            return_source_documents=True,
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt_template}
        )
        response = qa_chain.invoke({"query": request.text})
        result = parse_response(response["result"])
        return result
    except Exception as e:
        return {"error": str(e)}
