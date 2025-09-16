document.addEventListener("DOMContentLoaded", () => {
    const speech = new SpeechSynthesisUtterance();
    let voices = [];
    const voiceSelect = document.getElementById("voiceSelect");
    const textarea = document.getElementById("textInput");
    const listenButton = document.getElementById("Listen");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playPauseIcon = document.getElementById("playPauseIcon");
    const sendBtn = document.getElementById("sendBtn");
    const chatArea = document.getElementById("chat_area");
    let isPlaying = false;

    window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        voices.forEach((voice, i) => {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = voice.name;
            voiceSelect.appendChild(option);
        });
        speech.voice = voices[0];
    };

    voiceSelect.addEventListener("change", () => {
        speech.voice = voices[voiceSelect.value];
    });

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    listenButton.addEventListener("click", () => {
        recognition.start();
    });

    playPauseBtn.addEventListener("click", () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            playPauseIcon.classList.remove("fa-pause");
            playPauseIcon.classList.add("fa-play");
            isPlaying = false;
        } else {
            if (textarea.value.trim() !== "") {
                speech.text = textarea.value;
                window.speechSynthesis.speak(speech);
                playPauseIcon.classList.remove("fa-play");
                playPauseIcon.classList.add("fa-pause");
                isPlaying = true;
            }
        }
    });

    sendBtn.addEventListener("click", async () => {
        const text = textarea.value.trim();
        if (!text) return;

        // Show user message
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'user_msg';
        userMsgDiv.textContent = text;
        chatArea.appendChild(userMsgDiv);
        chatArea.scrollTop = chatArea.scrollHeight;

        textarea.value = "";

        try {
            const response = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            const reply = data.reply || data.error;

            const aiMsgDiv = document.createElement('div');
            aiMsgDiv.className = 'ai_msg';
            aiMsgDiv.textContent = reply;
            chatArea.appendChild(aiMsgDiv);
            chatArea.scrollTop = chatArea.scrollHeight;

            speech.text = reply;
            window.speechSynthesis.speak(speech);
            playPauseIcon.classList.remove("fa-play");
            playPauseIcon.classList.add("fa-pause");
            isPlaying = true;

        } catch (error) {
            console.error("Send error:", error);
            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.className = 'ai_msg';
            errorMsgDiv.textContent = "Error occurred while contacting AI.";
            chatArea.appendChild(errorMsgDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    });

    recognition.onresult = async function (event) {
        const speechResult = event.results[0][0].transcript;
        textarea.value = speechResult;

        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'user_msg';
        userMsgDiv.textContent = speechResult;
        chatArea.appendChild(userMsgDiv);
        chatArea.scrollTop = chatArea.scrollHeight;

        try {
            const response = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: speechResult })
            });

            const data = await response.json();
            const reply = data.reply || data.error;

            const aiMsgDiv = document.createElement('div');
            aiMsgDiv.className = 'ai_msg';
            aiMsgDiv.textContent = reply;
            chatArea.appendChild(aiMsgDiv);
            chatArea.scrollTop = chatArea.scrollHeight;

            speech.text = reply;
            window.speechSynthesis.speak(speech);
            playPauseIcon.classList.remove("fa-play");
            playPauseIcon.classList.add("fa-pause");
            isPlaying = true;

        } catch (error) {
            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.className = 'ai_msg';
            errorMsgDiv.textContent = "Error occurred while contacting AI.";
            chatArea.appendChild(errorMsgDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    };

    recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        textarea.value = "Speech recognition failed. Try again.";
    };

    speech.onend = () => {
        playPauseIcon.classList.remove("fa-pause");
        playPauseIcon.classList.add("fa-play");
        isPlaying = false;
    };
});