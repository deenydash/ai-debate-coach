# AI Debate Coach

AI Debate Coach is a web application designed to help users improve their debate skills. The app generates counterarguments, provides scoring, and offers coaching tips to guide the user toward stronger arguments. Users can choose between Coach, Opponent, and Judge modes and optionally enable voice narration for AI responses.

-------------------------------------------------------------------

Features

• Debate Modes: Choose how the AI responds (Coach, Opponent, or Judge).
• Scoring System: Each argument receives a score from 0 to 10.
• Coaching Tips: Personalized suggestions for improving the argument.
• Conversation Memory: AI considers past arguments for continuity.
• Voice Mode: AI can speak responses aloud (can be turned on or off).
• Sidebar Display: Shows current topic, mode, and average score.

-------------------------------------------------------------------

Tech Stack

• React (JavaScript) - Front-end UI  
• Google Gemini API - Text generation  
• Web Speech API - Voice playback  
• CSS - Interface styling  

-------------------------------------------------------------------

Setup Instructions

1. Clone the repository:
   git clone https://github.com/deenydash/ai-debate-coach.git
   cd ai-debate-coach

2. Install dependencies:
   npm install

3. Create a .env file in the project folder and add:
   REACT_APP_GEMINI_API_KEY=AIzaSyCchbG21iEoECKoaVICSfa15zxLKIUYCO4

4. Start the application:
   npm start

The app will run at:
   http://localhost:3000

-------------------------------------------------------------------

Demo Script (for presentation or judges)

1. Introduce the app: "This is AI Debate Coach. It helps users practice forming and defending arguments."
2. Enter a sample argument: for example, "AI should replace teachers."
3. Explain the response: "The AI generates a counterargument, assigns a score, and gives advice on how to strengthen the claim."
4. Show mode switching: "Changing the mode to Opponent will make the AI argue against the position. Judge mode evaluates arguments neutrally."
5. Show voice mode: "Here, voice mode reads the response aloud for accessibility and engagement."
6. End with importance: "This tool helps develop critical thinking, structured reasoning, and persuasive communication skills."

-------------------------------------------------------------------

Why This Project Matters

This project helps users learn how to structure and strengthen arguments. By providing instant feedback and alternative viewpoints, it supports skill building in logical reasoning and persuasive communication.

-------------------------------------------------------------------





