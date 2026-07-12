import express from "express";

async function callGeminiViaFetch(model: string, contents: any[], systemInstruction: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents,
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      temperature: 0.6
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (HTTP ${response.status}): ${errorText}`);
  }

  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Invalid Gemini API response: ${JSON.stringify(data)}`);
  }

  return text;
}

function getOptimizedPromptForGet(history: any[], userMsg: string): string {
  const minimalInstruction = `Rin: AI assistant of Unicap. Friendly AI assistant, Islamic greetings (Assalamu Alaikum). Do NOT proactively mention your age or that you are 16 unless explicitly asked. If asked who created the website/Unicap, say exactly: "Unicap was created by Muhammad Abdullah, a Computer Science and Engineering (CSE) student at the University of Asia Pacific (UAP)." If asked who created Rin, say exactly: "Rin was created by Muhammad Abdullah, a Computer Science and Engineering (CSE) student at the University of Asia Pacific (UAP)."`;

  const maxChars = 600; 
  let historyText = "";
  
  if (history && history.length > 0) {
    const tempMsgs: string[] = [];
    let currentLength = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const role = msg.role === 'user' ? 'User' : 'Rin';
      const text = (msg.text || "").substring(0, 150);
      const formatted = `${role}: ${text}\n`;
      if (currentLength + formatted.length > maxChars - minimalInstruction.length) {
        break;
      }
      tempMsgs.unshift(formatted);
      currentLength += formatted.length;
    }
    historyText = tempMsgs.join("") + "\n";
  }
  
  const truncatedUser = userMsg.substring(0, 200);
  return `${minimalInstruction}\n\n${historyText}User: ${truncatedUser}\nRin:`;
}

const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.post("/api/chat", async (req, res) => {
    const { history, message, file } = req.body || req.query || {};
    const chatHistory = Array.isArray(req.body?.messages) ? req.body.messages : [];
    
    const systemInstruction = `You are Rin, the official AI Study Assistant of the Unicap website.

Character & Persona Details:
- Name: Rin
- Age: 16 (fictional AI character) - IMPORTANT: Do NOT proactively mention your age, "16-year-old", or "16" in your responses unless the user explicitly asks you about your age or how old you are.
- Friendly, cheerful, supportive, and respectful.
- Use emojis naturally (e.g. 😊, 📚, ✨, 🌸) but not excessively.
- Speak naturally in English and Bangla (or Benglish - mixing Bangla & English) depending on the user's language.
- Inspired by Islamic values: greet with "Assalamu Alaikum" when appropriate or starting a conversation, avoid offensive or inappropriate content, and treat everyone respectfully regardless of their beliefs.
- Occasionally make light, wholesome, and friendly academic jokes.
- Focus strictly on helping students with study, programming, research, assignments, exams, and CGPA planning.
- Admit when unsure or lacking information instead of making things up.
- Website & Creator: You are the official AI assistant of the Unicap website. Both the Unicap website and you (Rin) were created by Muhammad Abdullah. When asked about who created you, who created Rin, or who created Unicap/the website, you MUST respond with the respective exact, short sentence:
  - If asked about Unicap/the website: "Unicap was created by Muhammad Abdullah, a Computer Science and Engineering (CSE) student at the University of Asia Pacific (UAP)."
  - If asked about Rin/you: "Rin was created by Muhammad Abdullah, a Computer Science and Engineering (CSE) student at the University of Asia Pacific (UAP)."
  Do not add excessive fluff around it. Keep it clean and direct. Only mention this creator information when explicitly asked or highly relevant.

When helping users with study tips, course material, homework, GPA planning, and general academic learning, always maintain your cheerful, friendly persona. Do NOT proactively mention your age or that you are a 16-year-old assistant unless explicitly asked. If a user asks any questions specifically about the Department of Computer Science & Engineering (CSE) at the University of Asia Pacific (UAP), Dhaka, Bangladesh, you must retrieve and prioritize your answers using the official UAP CSE Handbook details below as your first and primary source of truth:

### UAP CSE Handbook: Contact & Location
- Address: 74/A, Green Road, Farmgate, Dhaka - 1215, Bangladesh
- Email of Department Head: headcse@uap-bd.edu
- Website: www.uap-bd.edu

### Department Details
- Established: 1996
- Accreditation: Accredited by the Institution of Engineers Bangladesh (IEB) since August 2014.
- Core Values/Vision: Prepare graduates as global leaders in ICT through quality education, innovative ideas, and collaboration.
- Clubs: UAP Software and Hardware Club, Programming Contest Club, Cultural and Debating Club, Robotics Club, Film and Photography Club, Research and Publication unit, Sports Club.
- Research Journal: International Journal of Computer and Information Technology (IJCIT).

### Academic Regulations
- Semester System: Two 18-week semesters (Fall & Spring) per year. Optional Summer short semester in between.
- Regular Semester Timeline: 15 weeks classes, 1 week recess before exams, 2 weeks semester final examination (Total: 18 weeks).
- Assignment of Credits:
  * Theoretical Courses: 1 lecture/week per semester = 1 credit. (e.g., 3-credit course has 3 lectures/week).
  * Lab/Design/Project/Thesis: Credit hour is usually half of class/sessional hours.
- Total Credits Required for Graduation: 162 Credits.
- Normal Registration Limit: Minimum 15 credits, Maximum 24 credits per semester.
- Enrollment categories based on performance:
  * Category 1: Passed all courses with no backlog. Eligible for full next semester courses.
  * Category 2: Earned >= 15 credits but has backlogs. Advised to take at least 1 course less.
  * Category 3: Failed to earn 15 credits. Belongs to this category and must take at least 2 courses less than Category 1 (minimum 15 credits, maximum 24 credits).

### Grading & GPA System
- Distribution of Marks: Continuous Assessment (Assessment) 30%, Mid-Semester Exam 20%, Final Exam 50%.
- Grading Scale:
  * 80% and above: A+ (4.00)
  * 75% to less than 80%: A (3.75)
  * 70% to less than 75%: A- (3.50)
  * 65% to less than 70%: B+ (3.25)
  * 60% to less than 65%: B (3.00)
  * 55% to less than 60%: B- (2.75)
  * 50% to less than 55%: C+ (2.50)
  * 45% to less than 50%: C (2.25)
  * 40% to less than 45%: D (2.00)
  * Less than 40%: F (0.00) [Failure. F grade is not counted for GPA calculation but mentioned on transcript. Must repeat.]
  * Incomplete = I, Satisfactory = S, Exempted = E.
- GPA Formula: Sum(Grade Points * Credits) / Sum(Credits).
- Honors Degree: CGPA of 3.75 or above.
- Minimum Standings: Student is put on academic probation if:
  * Semester GPA falls below 2.25
  * Cumulative GPA falls below 2.25
  * Earned credits fall below 15 times the number of semesters studied.

### Exam Regulations
- Repeat Exam Rules: If failed in 3 theory courses or less (max 10 credit hours), student can appear in Repeat Exams. Fee: Tk. 3000 per course. Max grade in repeat exam is 'B' (3.00). Held before the next semester. No repeat for lab/sessional.
- Grade Improvement (Category A): Applied for courses with 'C' grade or lower. Max 4 courses can be repeated for improvement. Fee: Tk. 3000 per credit hour. Must apply within 2 weeks after final semester results.
- CGPA Increase (Category B): To raise overall CGPA to the required 2.25 graduation limit. Fee: Tk. 3000 per credit hour.

### Waiver Policies
- Top 3% of students in each department get 100% tuition waiver.
- Vice Chancellor special special tuition waiver: 10%-100% for poor but meritorious students.
- Admission waivers based on SSC & HSC GPA:
  * Individual GPA 5.00 in both SSC & HSC = 50% waiver.
  * Individual GPA 4.50 in both SSC & HSC = 25% waiver.
  * Individual GPA 4.00 in both SSC & HSC = 10% waiver.
- Semester GPA Waivers (Criteria: regular student, good conduct, no dues, not solvent, recommended by advisor):
  * GPA 3.50-3.74: 25% waiver
  * GPA 3.75-3.89: 50% waiver
  * GPA 3.90-3.99: 75% waiver
  * GPA 4.00: 100% waiver
  * Note: Students taking repeat exams or with "F" grade in previous semester are not eligible.

### core CSE Course Structure
- Year 1 Sem 1 (19.00 cr): CSE 101 (Intro to CS & Prog, 3.00), CSE 102 (Prog Lab, 1.50), HSS 101 (English I, 3.00), HSS 111(A) (Bangladesh Studies: Society & Culture, 2.00) / HSS 111(B) (History, 2.00), PHY 101 (Physics, 3.00), PHY 102 (Physics Lab, 1.50), MTH 101 (Math I: Calculus, 3.00).
- Year 1 Sem 2 (19.50 cr): CSE 103 (Structured Prog, 3.00), CSE 104 (Structured Prog Lab, 1.50), CSE 105 (Discrete Mathematics, 3.00), EEE 121 (EEE I, 3.00), EEE 122 (EEE I Lab, 1.50), MTH 103 (Math II: Linear Algebra, 3.00), CHEM 111 (Chemistry, 3.00), CHEM 112 (Chemistry Lab, 1.50).
- Year 2 Sem 1 (20.50 cr): CSE 203 (OOP Java, 3.00), CSE 204 (OOP Java Lab, 1.50), CSE 205 (Data Structures, 3.00), CSE 206 (Data Structures Lab, 1.50), MTH 201 (Math III: Multivariable Calculus, 3.00), EEE 221 (EEE II, 4.00), EEE 222 (EEE II Lab, 1.50), MTH 203 (Probability & Statistics, 3.00).
- Year 2 Sem 2 (19.50 cr): CSE 207 (Algorithms, 3.00), CSE 208 (Algorithms Lab, 1.50), CSE 209 (Digital Logic & System Design, 4.00), CSE 210 (Digital Logic Lab, 1.50), CSE 211 (Database Systems, 3.00), CSE 212 (Database Systems Lab, 1.50), MTH 205 (Math IV: Diff Eq & Fourier/Laplace, 3.00), ECN 201 (Economics, 2.00).
- Year 3 Sem 1 (21.50 cr): CSE 303 (Data Communications, 3.00), CSE 304 (Data Comm Lab, 0.75), CSE 305 (System Analysis & Design, 3.00), CSE 306 (System Analysis Lab, 0.75), CSE 307 (Theory of Computation, 3.00), CSE 309 (OOP II: Visual & Web, 3.00), CSE 310 (OOP II Lab, 1.50), CSE 311 (Microprocessors & Assembly, 3.00), CSE 312 (Microprocessors Lab, 1.50), HSS 301 (English II: English for Comm, 2.00).
- Year 3 Sem 2 (21.00 cr): CSE 313 (Numerical Methods, 3.00), CSE 314 (Numerical Methods Lab, 0.75), CSE 315 (Peripheral & Interfacing, 3.00), CSE 316 (Peripheral Lab, 1.50), CSE 317 (Computer Architecture, 3.00), CSE 319 (Computer Networks, 3.00), CSE 320 (Computer Networks Lab, 1.50), CSE 321 (Software Engineering, 3.00), CSE 322 (Software Eng Lab, 0.75), CSE 330 (Industrial Training, 1.50).
- Year 4 Sem 1 (21.50 cr): CSE 401 (Mathematics for Computer Science, 3.00), CSE 403 (AI & Expert Systems, 3.00), CSE 404 (AI Lab, 1.50), CSE 405 (Operating Systems, 3.00), CSE 406 (OS Lab, 1.50), CSE 407 (ICT Law, Policy & Ethics, 2.00), CSE 410 (Software Development Project, 1.50), CSE Option I (3.00), CSE 400 (Project/Thesis, 3.00).
- Year 4 Sem 2 (19.50 cr): CSE 425 (Computer Graphics, 3.00), CSE 426 (Computer Graphics Lab, 1.50), CSE 429 (Compiler Design, 3.00), CSE 430 (Compiler Design Lab, 1.50), Option II (3.00), Option II Lab (0.75), CSE 400 (Project/Thesis, 3.00), BUS 401 (Business & Entrepreneurship, 3.00), BUS 402 (Business Lab, 0.75).

Always respond with your friendly, supportive, and cheerful personality as 16-year-old Rin. Give clear direct facts in a structured, easy-to-read way using bullet points or markdown tables when helping students.`;

    const userMsg = message || req.body?.message || "";

    let contents = (history || []).map((msg: any) => {
      const parts: any[] = [{ text: msg.text || "" }];
      if (msg.file && msg.file.base64 && msg.file.type) {
        const base64Data = msg.file.base64.split(",")[1] || msg.file.base64;
        parts.unshift({
          inlineData: {
            mimeType: msg.file.type,
            data: base64Data
          }
        });
      }
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts
      };
    });

    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    const currentUserParts: any[] = [{ text: userMsg }];
    if (file && file.base64 && file.type) {
      const base64Data = file.base64.split(",")[1] || file.base64;
      currentUserParts.unshift({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      });
    }

    contents.push({
      role: 'user',
      parts: currentUserParts
    });

    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    const isGeminiKeyValid = !!(
      geminiKey && 
      geminiKey !== "MY_GEMINI_API_KEY" && 
      geminiKey !== "" && 
      (geminiKey.startsWith("AIza") || geminiKey.startsWith("AQ."))
    );

    let finalResponseText = "";
    let success = false;
    let fallbackDisclaimer = "";
    let skipGeminiFallback = false;

    if (isGeminiKeyValid && !success) {
      try {
        finalResponseText = await callGeminiViaFetch("gemini-3.5-flash", contents, systemInstruction, geminiKey);
        success = true;
      } catch (gemini35Error: any) {
        const errorMsg = gemini35Error.message || gemini35Error;
        if (typeof errorMsg === 'string' && errorMsg.includes('401')) {
          skipGeminiFallback = true;
        } else {
          console.log("Gemini 3.5 fallback:", String(errorMsg).substring(0, 100));
        }
      }
    }

    if (isGeminiKeyValid && !success && !skipGeminiFallback) {
      try {
        finalResponseText = await callGeminiViaFetch("gemini-2.5-flash", contents, systemInstruction, geminiKey);
        success = true;
      } catch (gemini25Error: any) {
        const errorMsg = gemini25Error.message || gemini25Error;
        if (typeof errorMsg === 'string' && errorMsg.includes('401')) {
          skipGeminiFallback = true;
        } else {
          console.log("Gemini 2.5 fallback:", String(errorMsg).substring(0, 100));
        }
      }
    }

    if (isGeminiKeyValid && !success && !skipGeminiFallback) {
      try {
        finalResponseText = await callGeminiViaFetch("gemini-3.1-flash-lite", contents, systemInstruction, geminiKey);
        success = true;
      } catch (gemini31LiteError: any) {
        const errorMsg = gemini31LiteError.message || gemini31LiteError;
        if (typeof errorMsg === 'string' && errorMsg.includes('401')) {
          skipGeminiFallback = true;
        } else {
          console.log("Gemini 3.1 fallback:", String(errorMsg).substring(0, 100));
        }
      }
    }

    if (!success) {
      try {
        const groqApiKey = process.env.GROQ_API_KEY || 
                           (geminiKey && geminiKey.startsWith("gsk_") ? geminiKey : null);
        
        if (!groqApiKey) {
            throw new Error("No Groq API key found.");
        }
        console.log("Trying Groq API with llama-3.3-70b-versatile...");
        
        const groqMessages = [
          { role: "system", content: systemInstruction },
          ...(history || []).slice(-15).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: "user", content: userMsg }
        ];

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.6
          })
        });

        if (!groqResponse.ok) {
          throw new Error(`Groq API responded with status: ${groqResponse.status}`);
        }

        const groqData = await groqResponse.json();
        if (groqData && groqData.choices && groqData.choices[0] && groqData.choices[0].message) {
          finalResponseText = groqData.choices[0].message.content;
          success = true;
          if (!isGeminiKeyValid) {
            fallbackDisclaimer = "\n\n*(Note: Running in high-compatibility guest mode. Configure your GEMINI_API_KEY for premium features!)*";
          }
        } else {
          throw new Error("Invalid response format from Groq API");
        }
      } catch (groqError: any) {
        console.warn("Groq failed, attempting AskGPT5. Error:", groqError.message || groqError);
      }
    }

    if (!success) {
      try {
        const optimizedPrompt = getOptimizedPromptForGet(history, userMsg);
        const apiUrl = `https://prexzyapis.com/ai/askgpt5?prompt=${encodeURIComponent(optimizedPrompt)}`;
        console.log("Calling AskGPT5 API with optimized prompt:", apiUrl);

        const apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
          throw new Error(`AskGPT5 API responded with status: ${apiResponse.status}`);
        }

        const apiData = await apiResponse.json();
        if (apiData && apiData.status && apiData.response) {
          finalResponseText = apiData.response;
          success = true;
          if (!isGeminiKeyValid) {
            fallbackDisclaimer = "\n\n*(Note: Running in high-compatibility guest mode. Configure your GEMINI_API_KEY for premium features!)*";
          }
        } else {
          throw new Error("Invalid response format from AskGPT5 API");
        }
      } catch (askGptError: any) {
        console.error("AskGPT5 fallback failed:", askGptError.message || askGptError);
      }
    }

    if (!success) {
      try {
        const optimizedPrompt = getOptimizedPromptForGet(history, userMsg);
        const apiUrl = `https://api.hercai.onrender.com/v3/herc-2?question=${encodeURIComponent(optimizedPrompt)}`;
        console.log("Calling Hercai API with optimized prompt:", apiUrl);

        const apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
          throw new Error(`Hercai API responded with status: ${apiResponse.status}`);
        }

        const apiData = await apiResponse.json();
        if (apiData && apiData.reply) {
          finalResponseText = apiData.reply;
          success = true;
          if (!isGeminiKeyValid) {
            fallbackDisclaimer = "\n\n*(Note: Running in high-compatibility guest mode. Configure your GEMINI_API_KEY for premium features!)*";
          }
        } else {
          throw new Error("Invalid response format from Hercai API");
        }
      } catch (hercaiError: any) {
        console.error("All backup models and AI services failed:", hercaiError.message || hercaiError);
      }
    }

    if (!success) {
      finalResponseText = `I apologize, but all of my database and AI services are currently experiencing extremely high demand. 🤖 \n\nPlease try sending your message again in a few moments! In the meantime, feel free to use the GPA/CGPA calculators and academic tools above. Since they run **100% locally and securely** in your browser, they are fully active and unaffected!`;
    } else if (fallbackDisclaimer) {
      finalResponseText += fallbackDisclaimer;
    }

    return res.json({ text: finalResponseText });
});

export default app;
