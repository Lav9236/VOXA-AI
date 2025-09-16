from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from openai import OpenAI
import os

# Load environment variables from .env
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)


app = Flask(__name__)

@app.route('/login', methods=['GET', 'POST'])
def loginpage():
    msg = ""
    if request.method == 'POST':
        u = request.form.get('txtusername')
        p = request.form.get('txtpassword')

        if u == 'Lavakush' and p == '#Lav@9236':
            return render_template('vpro.html')
        else:
            msg = "*Invalid username or password"
    return render_template('login.html', msg=msg)

@app.route("/")
def home():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("/signup.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    user_input = data.get("message", "")
      

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ]
        )
        reply = response.choices[0].message.content

        return jsonify({
            "user": user_input,
            "reply": reply
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
    
    
    
