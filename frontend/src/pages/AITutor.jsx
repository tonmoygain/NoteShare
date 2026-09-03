import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    ArrowRight,
    BarChart3,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    FileText,
    GraduationCap,
    Lightbulb,
    Loader2,
    MessageCircleQuestion,
    RotateCcw,
    Send,
    Sparkles,
    Target,
    Trophy,
} from "lucide-react";

import API from "../services/api";
import { createSessionId, recordLearningEvent } from "../utils/learningAnalytics";

function AITutor() {
    const navigate = useNavigate();

    /* =========================================================
       NOTES
    ========================================================= */

    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);

    const [selectedNote, setSelectedNote] = useState(null);
    const [selectedMode, setSelectedMode] = useState("teach");

    /* =========================================================
       SESSION
    ========================================================= */

    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(false);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessionError, setSessionError] = useState("");

    /* =========================================================
       LEARNING STATE
    ========================================================= */

    const [questionNumber, setQuestionNumber] = useState(0);

    const [correctAnswers, setCorrectAnswers] =
        useState(0);

    const [incorrectAnswers, setIncorrectAnswers] =
        useState(0);

    const [currentDifficulty, setCurrentDifficulty] =
        useState("medium");

    const [weakTopics, setWeakTopics] = useState([]);

    const [reinforcedTopics, setReinforcedTopics] =
        useState([]);

    const [lastEvaluation, setLastEvaluation] =
        useState(null);

    const [lastTopic, setLastTopic] =
        useState(null);

    const [learningSessionId, setLearningSessionId] =
        useState(null);

    /* =========================================================
       LOAD NOTES
    ========================================================= */

    useEffect(() => {
        const loadNotes = async () => {
            try {
                setLoadingNotes(true);

                const response = await API.get(
                    "notes/?page=1"
                );

                const availableNotes =
                    response.data?.notes ||
                    response.data?.results ||
                    [];

                setNotes(
                    Array.isArray(availableNotes)
                        ? availableNotes
                        : []
                );
            } catch (error) {
                console.error(
                    "AI Tutor Notes Error:",
                    error
                );

                setNotes([]);
            } finally {
                setLoadingNotes(false);
            }
        };

        loadNotes();
    }, []);

    /* =========================================================
       LEARNING MODES
    ========================================================= */

    const learningModes = [
        {
            id: "teach",
            title: "Teach Me",
            description:
                "Learn step by step with explanations, examples, and understanding checks.",
            icon: FileText,
            tag: "Understand",
        },
        {
            id: "quiz",
            title: "Quiz Me",
            description:
                "Practice with adaptive questions that respond to your answers.",
            icon: BrainCircuit,
            tag: "Practice",
        },
        {
            id: "challenge",
            title: "Challenge Me",
            description:
                "Solve conceptual and application-based problems that test your reasoning.",
            icon: Target,
            tag: "Think",
        },
    ];

    /* =========================================================
       MODE INSTRUCTIONS
    ========================================================= */

    const getModeInstruction = (mode) => {
        if (!selectedNote) {
            return "";
        }

        const noteName = selectedNote.title;

        if (mode === "teach") {
            return `
You are NoteShare AI Tutor in TEACH MODE.

Selected academic note:
"${noteName}"

Your job is to teach the student, not behave like a generic chatbot.

Learning approach:
1. Start with fundamentals.
2. Explain concepts step by step.
3. Use examples when useful.
4. Ask short understanding-check questions.
5. Adapt the explanation according to the student's response.
6. If the student is confused, simplify the explanation.
7. Connect related concepts when the retrieved source supports that connection.
8. Do not invent information outside the retrieved NoteShare material.

Important:
This is a learning session. Do not simply dump the answer.
Guide the student toward understanding.
`;
        }

        if (mode === "quiz") {
            return `
You are NoteShare AI Tutor in ADAPTIVE QUIZ MODE.

Selected academic note:
"${noteName}"

Current difficulty:
${currentDifficulty}

Your job is to test understanding and adapt the next question.

Rules:
1. Ask exactly ONE question at a time.
2. Start at medium difficulty.
3. Prefer conceptual understanding over pure memorization.
4. Do not reveal the answer before the student responds.
5. After the student answers, evaluate the response.
6. Clearly explain whether the response is correct, partially correct, or incorrect.
7. If correct, increase difficulty gradually.
8. If incorrect, reduce difficulty and provide a short repair explanation.
9. Identify the concept involved in the student's mistake.
10. If the same concept causes repeated mistakes, recommend targeted review.
11. Keep all academic claims grounded in the retrieved NoteShare content.

Do not create fake statistics.
Do not claim mastery from a single correct answer.
`;
        }

        return `
You are NoteShare AI Tutor in ADAPTIVE CHALLENGE MODE.

Selected academic note:
"${noteName}"

Current difficulty:
${currentDifficulty}

Your job is to test reasoning, application, and conceptual understanding.

Rules:
1. Ask ONE conceptual or application-based problem at a time.
2. Prefer reasoning over memorized definitions.
3. Ask the student to explain why they reached their conclusion.
4. Evaluate both reasoning and final answer.
5. Identify the concept involved in an incorrect response.
6. If the student succeeds, increase conceptual difficulty.
7. If the student struggles, temporarily move to a simpler supporting problem.
8. Keep every question grounded in the retrieved NoteShare material.

Do not create unsupported facts.
Do not claim mastery from one successful response.
`;
    };

    /* =========================================================
       STRUCTURED AI MARKERS
    ========================================================= */

    const buildMarkerInstruction = () => {
        return `
At the very end of your response, include this internal evaluation block exactly:

[TUTOR_EVAL:CORRECT|PARTIAL|INCORRECT|NONE]
[TUTOR_TOPIC:short topic name]

Rules:
- For a teaching response without a student answer, use TUTOR_EVAL:NONE.
- For a question being asked before the student's answer, use TUTOR_EVAL:NONE.
- Use CORRECT when the student's latest response is clearly correct.
- Use PARTIAL when the response has some correct reasoning but is incomplete.
- Use INCORRECT when the response is materially wrong.
- TUTOR_TOPIC should identify the main concept being taught or evaluated.
- TUTOR_NEXT_DIFFICULTY should recommend the next level.

The student-selected difficulty is fixed for this session.
Do not change the difficulty level automatically.
Do not recommend a different difficulty level.

Do not put any explanation outside those three marker lines inside the marker block.
`;
    };

    /* =========================================================
       PARSE AI MARKERS
    ========================================================= */

    const parseTutorMarkers = (reply) => {
        const evaluationMatch =
            reply.match(
                /\[TUTOR_EVAL:(CORRECT|PARTIAL|INCORRECT|NONE)\]/i
            );

        const topicMatch =
            reply.match(
                /\[TUTOR_TOPIC:(.*?)\]/i
            );

        const difficultyMatch =
            reply.match(
                /\[TUTOR_NEXT_DIFFICULTY:(EASY|MEDIUM|HARD)\]/i
            );

        const evaluation =
            evaluationMatch?.[1]
                ?.toLowerCase() || null;

        const topic =
            topicMatch?.[1]?.trim() ||
            "General topic";

        const nextDifficulty =
            difficultyMatch?.[1]
                ?.toLowerCase() || null;

        let cleanReply = reply
            .replace(
                /\[TUTOR_EVAL:(CORRECT|PARTIAL|INCORRECT|NONE)\]/gi,
                ""
            )
            .replace(
                /\[TUTOR_TOPIC:.*?\]/gi,
                ""
            )
            .replace(
                /\[TUTOR_NEXT_DIFFICULTY:(EASY|MEDIUM|HARD)\]/gi,
                ""
            )
            .trim();

        return {
            evaluation,
            topic,
            nextDifficulty,
            cleanReply,
        };
    };

    /* =========================================================
       FALLBACK EVALUATION
    ========================================================= */

    const detectEvaluationFallback = (reply) => {
        const text = reply.toLowerCase();

        if (
            text.includes("partially correct") ||
            text.includes("partly correct")
        ) {
            return "partial";
        }

        if (
            text.includes("incorrect") ||
            text.includes("not correct") ||
            text.includes("not quite") ||
            text.includes("wrong answer")
        ) {
            return "incorrect";
        }

        if (
            text.includes("correct") ||
            text.includes("well done") ||
            text.includes("that's right") ||
            text.includes("that is correct")
        ) {
            return "correct";
        }

        return "none";
    };

    /* =========================================================
       BUILD TUTOR PROMPT
    ========================================================= */

    const buildTutorPrompt = ({
        mode,
        userMessage = "",
        previousTutorMessage = "",
    }) => {
        const instruction =
            getModeInstruction(mode);

        const stateSummary = `
CURRENT LEARNING STATE

Question / interaction count:
${questionNumber}

Correct responses:
${correctAnswers}

Incorrect responses:
${incorrectAnswers}

Current difficulty:
${currentDifficulty}

Previously identified weak topics:
${
    weakTopics.length
        ? weakTopics.join(", ")
        : "None identified yet"
}

Previously reinforced topics:
${
    reinforcedTopics.length
        ? reinforcedTopics.join(", ")
        : "None identified yet"
}
`;

        if (!userMessage) {
            return `
${instruction}

${buildMarkerInstruction()}

${stateSummary}

Start the learning session now.

For TEACH MODE:
Begin teaching the selected note and finish with one short understanding-check question.

For QUIZ MODE:
Ask the first question.

For CHALLENGE MODE:
Ask the first conceptual/application challenge.

Do not reveal answers before the student responds.
`;
        }

        return `
${instruction}

${buildMarkerInstruction()}

${stateSummary}

Previous Tutor message:
"""
${previousTutorMessage || "No previous Tutor message available."}
"""

The student has now responded:
"""
${userMessage}
"""

Evaluate the student's latest response.

Then:
1. Give useful feedback.
2. Explain the reasoning briefly.
3. Identify the main concept involved.
4. Decide whether the next task should become easier, remain similar, or become harder.
5. Continue the learning session with the NEXT appropriate task.

Do not restart the entire lesson.
`;
    };

    /* =========================================================
       SEND TUTOR REQUEST
    ========================================================= */

    const sendTutorRequest = async ({
        mode,
        userMessage = "",
        previousTutorMessage = "",
        firstMessage = false,
    }) => {
        if (!selectedNote) {
            return;
        }

        try {
            setSessionLoading(true);
            setSessionError("");

            const prompt =
                buildTutorPrompt({
                    mode,
                    userMessage,
                    previousTutorMessage,
                });

            const response = await API.post(
                "ai/chat/",
                {
                    message: prompt,
                }
            );

            const rawReply =
                response.data?.reply ||
                "The AI Tutor could not generate a response.";

            const sources =
                response.data?.sources || [];

            const parsed =
                parseTutorMarkers(
                    rawReply
                );

            let evaluation =
                parsed.evaluation;

            if (
                !evaluation ||
                evaluation === "none"
            ) {
                evaluation =
                    detectEvaluationFallback(
                        parsed.cleanReply
                    );
            }

            /* =========================================
               UPDATE LEARNING STATE
            ========================================= */

            if (!firstMessage) {
                recordLearningEvent({
                    sessionId: learningSessionId || createSessionId(),
                    noteId: selectedNote?.id ?? null,
                    noteTitle: selectedNote?.title || "Unknown note",
                    mode,
                    evaluation,
                    topic: parsed.topic || "General topic",
                    difficulty: currentDifficulty,
                });

                if (
                    evaluation ===
                    "correct"
                ) {
                    setCorrectAnswers(
                        (previous) =>
                            previous + 1
                    );

                    if (
                        parsed.topic &&
                        parsed.topic !==
                            "General topic"
                    ) {
                        setReinforcedTopics(
                            (previous) =>
                                previous.includes(
                                    parsed.topic
                                )
                                    ? previous
                                    : [
                                          ...previous,
                                          parsed.topic,
                                      ]
                        );
                    }
                }

                if (
                    evaluation ===
                    "incorrect"
                ) {
                    setIncorrectAnswers(
                        (previous) =>
                            previous + 1
                    );

                    if (
                        parsed.topic &&
                        parsed.topic !==
                            "General topic"
                    ) {
                        setWeakTopics(
                            (previous) =>
                                previous.includes(
                                    parsed.topic
                                )
                                    ? previous
                                    : [
                                          ...previous,
                                          parsed.topic,
                                      ]
                        );
                    }
                }

                setQuestionNumber(
                    (previous) =>
                        previous + 1
                );
            }


            setLastEvaluation(
                evaluation
            );

            setLastTopic(
                parsed.topic
            );

            setMessages(
                (previous) => [
                    ...previous,
                    {
                        role: "assistant",
                        content:
                            parsed.cleanReply,
                        sources,
                        evaluation,
                        topic:
                            parsed.topic,
                    },
                ]
            );

            if (firstMessage) {
                setSessionStarted(
                    true
                );
            }
        } catch (error) {
            console.error(
                "AI Tutor Error:",
                error
            );

            setSessionError(
                error.response?.data
                    ?.error ||
                    "The AI Tutor could not process this session."
            );
        } finally {
            setSessionLoading(
                false
            );
        }
    };


    /* =========================================================
       START SESSION
    ========================================================= */

    const startLearning =
        async () => {
            if (
                !selectedNote ||
                sessionLoading
            ) {
                return;
            }

            setMessages([]);
            setQuestionNumber(0);
            setCorrectAnswers(0);
            setIncorrectAnswers(0);
            
            setWeakTopics([]);
            setReinforcedTopics([]);
            setLastEvaluation(null);
            setLastTopic(null);
            setSessionError("");
            const newSessionId = createSessionId();
            setLearningSessionId(newSessionId);
            recordLearningEvent({
                sessionId: newSessionId,
                noteId: selectedNote?.id ?? null,
                noteTitle: selectedNote?.title || "Unknown note",
                mode: selectedMode,
                eventType: "session_started",
                evaluation: "none",
                topic: "General topic",
                difficulty: currentDifficulty,
            });

            await sendTutorRequest(
                {
                    mode: selectedMode,
                    firstMessage: true,
                }
            );
        };

    /* =========================================================
       CONTINUE SESSION
    ========================================================= */

    const continueSession =
        async () => {
            const trimmed =
                input.trim();

            if (
                !trimmed ||
                !selectedNote ||
                sessionLoading
            ) {
                return;
            }

            const previousTutorMessage =
                [...messages]
                    .reverse()
                    .find(
                        (item) =>
                            item.role ===
                            "assistant"
                    )?.content || "";

            setMessages(
                (previous) => [
                    ...previous,
                    {
                        role: "user",
                        content:
                            trimmed,
                    },
                ]
            );

            setInput("");

            await sendTutorRequest(
                {
                    mode: selectedMode,
                    userMessage:
                        trimmed,
                    previousTutorMessage,
                }
            );
        };

    /* =========================================================
       KEYBOARD
    ========================================================= */

    const handleKeyDown =
        (event) => {
            if (
                event.key ===
                    "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                continueSession();
            }
        };

    /* =========================================================
       RESET SESSION
    ========================================================= */

    const resetSession = () => {
        setSessionStarted(false);
        setMessages([]);
        setInput("");
        setSessionError("");

        setQuestionNumber(0);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);


        setWeakTopics([]);
        setReinforcedTopics([]);

        setLastEvaluation(null);
        setLastTopic(null);
    };

    /* =========================================================
       MODE LABEL
    ========================================================= */

    const getModeTitle = () => {
        if (
            selectedMode ===
            "teach"
        ) {
            return "Teach Me";
        }

        if (
            selectedMode ===
            "quiz"
        ) {
            return "Quiz Me";
        }

        return "Challenge Me";
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <section className="
            ai-tutor-page
            mx-auto
            max-w-7xl
            px-4
            py-6
            sm:px-6
            sm:py-10
        ">

            {/* =====================================================
                HERO
            ====================================================== */}

            <motion.section
                initial={{
                    opacity: 0,
                    y: 16,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.45,
                }}
                className="
                    ai-tutor-hero
                    relative
                    overflow-hidden
                    rounded-[34px]
                    bg-gradient-to-br
                    from-slate-950
                    via-blue-950
                    to-cyan-900
                    px-6
                    py-8
                    text-white
                    shadow-[0_25px_70px_rgba(15,23,42,0.18)]
                    sm:px-9
                    sm:py-10
                    lg:px-12
                    lg:py-12
                "
            >
                <div className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-72
                    w-72
                    rounded-full
                    bg-cyan-400/15
                    blur-3xl
                " />

                <div className="
                    pointer-events-none
                    absolute
                    -bottom-28
                    -left-20
                    h-72
                    w-72
                    rounded-full
                    bg-blue-500/15
                    blur-3xl
                " />

                <div className="
                    relative
                    grid
                    gap-10
                    lg:grid-cols-[1fr_320px]
                    lg:items-center
                ">
                    <div>

                        <div className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-white/10
                            bg-white/10
                            px-4
                            py-2
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.14em]
                            text-blue-100
                            backdrop-blur-md
                        ">
                            <Sparkles size={14} />
                            NoteShare AI Learning · Powered by your learning data
                        </div>

                        <h1 className="
                            mt-6
                            max-w-3xl
                            text-4xl
                            font-black
                            leading-[1.08]
                            tracking-tight
                            sm:text-5xl
                            lg:text-6xl
                        ">
                            Don't just read.
                            <span className="
                                mt-1
                                block
                                bg-gradient-to-r
                                from-cyan-300
                                via-blue-200
                                to-white
                                bg-clip-text
                                text-transparent
                            ">
                                Learn actively.
                            </span>
                        </h1>

                        <p className="
                            mt-5
                            max-w-2xl
                            text-sm
                            leading-7
                            text-blue-100
                            sm:text-base
                        ">
                            Learn from your own NoteShare
                            materials through guided teaching,
                            adaptive practice, and reasoning-based
                            challenges.
                        </p>

                        <div className="
                            mt-7
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        ">
                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/10
                                px-4
                                py-3
                                text-xs
                                font-bold
                                shadow-sm
                                text-slate-200
                                backdrop-blur-md
                            ">
                                <FileText size={15} />
                                Source grounded
                            </span>

                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/10
                                px-4
                                py-3
                                text-xs
                                font-bold
                                shadow-sm
                                text-slate-200
                                backdrop-blur-md
                            ">
                                <BrainCircuit size={15} />
                                Adaptive learning
                            </span>
                        </div>

                    </div>

                    <motion.div
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            hidden
                            justify-center
                            lg:flex
                        "
                    >
                        <div className="
                            relative
                            flex
                            h-64
                            w-64
                            items-center
                            justify-center
                            rounded-[38px]
                            border
                            border-white/10
                            bg-white/5
                            shadow-2xl
                            backdrop-blur-xl
                        ">
                            <div className="
                                flex
                                h-28
                                w-28
                                items-center
                                justify-center
                                rounded-[30px]
                                bg-gradient-to-br
                                from-blue-500
                                to-cyan-400
                                shadow-[0_20px_50px_rgba(6,182,212,0.25)]
                            ">
                                <GraduationCap
                                    size={54}
                                />
                            </div>

                            <span className="
                                absolute
                                right-8
                                top-8
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/10
                                text-cyan-200
                                backdrop-blur-md
                            ">
                                <Lightbulb
                                    size={18}
                                />
                            </span>

                            <span className="
                                absolute
                                bottom-8
                                left-8
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/10
                                text-blue-200
                                backdrop-blur-md
                            ">
                                <Target size={18} />
                            </span>

                            <span className="
                                absolute
                                bottom-7
                                right-7
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/10
                                text-emerald-200
                                backdrop-blur-md
                            ">
                                <Trophy size={17} />
                            </span>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {!sessionStarted ? (
                <>
                    {/* =================================================
                        NOTE SELECTOR
                    ================================================== */}

                    <section className="mt-10">

                        <div className="mb-6">
                            <p className="
                                text-[11px]
                                font-black
                                uppercase
                                tracking-[0.18em]
                                text-blue-600
                            ">
                                Step 01 · Choose your source
                            </p>

                            <h2 className="
                                mt-2
                                text-2xl
                                font-black
                                tracking-tight
                                text-slate-800
                                sm:text-3xl
                            ">
                                What do you want to learn?
                            </h2>

                            <p className="
                                mt-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-slate-500
                            ">
                                Select one of your uploaded notes.
                                The Tutor will use the relevant
                                NoteShare content as the learning source.
                            </p>
                        </div>

                        <div className="
                            ai-tutor-note-panel
                            rounded-[30px]
                            border
                            border-slate-200/80
                            bg-white
                            p-5
                            shadow-[0_15px_45px_rgba(15,23,42,0.06)]
                            sm:p-6
                        ">

                            <div className="
                                flex
                                flex-col
                                gap-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            ">
                                <div>
                                    <h3 className="
                                        text-lg
                                        font-black
                                        text-slate-800
                                    ">
                                        Your study notes
                                    </h3>

                                    <p className="
                                        mt-1
                                        text-xs
                                        font-medium
                                        text-slate-400
                                    ">
                                        Choose the material you want
                                        the Tutor to work with.
                                    </p>
                                </div>

                                <div className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    self-start
                                    rounded-full
                                    border
                                    border-blue-100
                                    bg-blue-50
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-blue-600
                                    sm:self-auto
                                ">
                                    <FileText size={12} />
                                    Your Notes
                                </div>
                            </div>

                            <div className="mt-5">

                                {loadingNotes ? (
                                    <div className="
                                        grid
                                        gap-3
                                        md:grid-cols-2
                                    ">
                                        {[1, 2].map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item
                                                    }
                                                    className="
                                                        h-20
                                                        animate-pulse
                                                        rounded-2xl
                                                        bg-slate-100
                                                    "
                                                />
                                            )
                                        )}
                                    </div>
                                ) : notes.length === 0 ? (
                                    <div className="
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-slate-200
                                        bg-slate-50/70
                                        px-5
                                        py-8
                                        text-center
                                    ">
                                        <FileText
                                            size={26}
                                            className="
                                                mx-auto
                                                text-slate-400
                                            "
                                        />

                                        <h4 className="
                                            mt-3
                                            font-black
                                            text-slate-700
                                        ">
                                            No notes available
                                        </h4>

                                        <p className="
                                            mt-1
                                            text-sm
                                            text-slate-400
                                        ">
                                            Upload a study note first.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    "/upload"
                                                )
                                            }
                                            className="
                                                mt-5
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                bg-gradient-to-r
                                                from-blue-600
                                                to-cyan-500
                                                px-5
                                                py-2.5
                                                text-sm
                                                font-bold
                                                text-white
                                                shadow-lg
                                                shadow-blue-500/15
                                                transition
                                                hover:-translate-y-0.5
                                            "
                                        >
                                            Upload Note
                                            <ChevronRight
                                                size={15}
                                            />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="
                                        grid
                                        gap-3
                                        md:grid-cols-2
                                    ">
                                        {notes.map(
                                            (note) => {
                                                const active =
                                                    selectedNote?.id ===
                                                    note.id;

                                                return (
                                                    <button
                                                        key={
                                                            note.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedNote(
                                                                note
                                                            )
                                                        }
                                                        className={`
                                                            ai-tutor-note-option
                                                            group
                                                            flex
                                                            items-center
                                                            justify-between
                                                            gap-4
                                                            rounded-2xl
                                                            border
                                                            px-4
                                                            py-4
                                                            text-left
                                                            transition-all
                                                            ${
                                                                active
                                                                    ? "border-blue-300 bg-blue-50 shadow-sm"
                                                                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                                                            }
                                                        `}
                                                    >
                                                        <div className="
                                                            flex
                                                            min-w-0
                                                            items-center
                                                            gap-3
                                                        ">
                                                            <span className="
                                                                flex
                                                                h-11
                                                                w-11
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-xl
                                                                bg-gradient-to-br
                                                                from-blue-50
                                                                to-cyan-50
                                                                text-blue-600
                                                            ">
                                                                <FileText
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </span>

                                                            <span className="
                                                                min-w-0
                                                            ">
                                                                <span className="
                                                                    block
                                                                    truncate
                                                                    text-sm
                                                                    font-black
                                                                    text-slate-800
                                                                ">
                                                                    {
                                                                        note.title
                                                                    }
                                                                </span>

                                                                <span className="
                                                                    mt-1
                                                                    block
                                                                    truncate
                                                                    text-[11px]
                                                                    font-semibold
                                                                    text-slate-400
                                                                ">
                                                                    {note.department ||
                                                                        "Academic Note"}
                                                                </span>
                                                            </span>
                                                        </div>

                                                        {active ? (
                                                            <CheckCircle2
                                                                size={
                                                                    21
                                                                }
                                                                className="
                                                                    shrink-0
                                                                    text-blue-600
                                                                "
                                                            />
                                                        ) : (
                                                            <ChevronRight
                                                                size={
                                                                    18
                                                                }
                                                                className="
                                                                    shrink-0
                                                                    text-slate-300
                                                                    transition
                                                                    group-hover:translate-x-0.5
                                                                    group-hover:text-blue-500
                                                                "
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        LEARNING LAB
                    ================================================== */}

                    <section className="mt-10">

                        <div className="mb-6">
                            <p className="
                                text-[11px]
                                font-black
                                uppercase
                                tracking-[0.18em]
                                text-blue-600
                            ">
                                Step 02 · AI Learning Lab
                            </p>

                            <h2 className="
                                mt-2
                                text-2xl
                                font-black
                                tracking-tight
                                text-slate-800
                                sm:text-3xl
                            ">
                                Choose how you want to learn
                            </h2>

                            <p className="
                                mt-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-slate-500
                            ">
                                These are different learning strategies,
                                not separate chatbots.
                            </p>
                        </div>

                        <div className="
                            grid
                            gap-5
                            lg:grid-cols-3
                        ">
                            {learningModes.map(
                                (mode) => {
                                    const Icon =
                                        mode.icon;

                                    const active =
                                        selectedMode ===
                                        mode.id;

                                    return (
                                        <motion.button
                                            key={
                                                mode.id
                                            }
                                            type="button"
                                            whileHover={{
                                                y: -5,
                                            }}
                                            whileTap={{
                                                scale: 0.985,
                                            }}
                                            onClick={() =>
                                                setSelectedMode(
                                                    mode.id
                                                )
                                            }
                                            className={`
                                                ai-tutor-mode-card
                                                group
                                                relative
                                                overflow-hidden
                                                rounded-[30px]
                                                border
                                                p-6
                                                text-left
                                                transition-all
                                                ${
                                                    active
                                                        ? "border-blue-300 bg-white shadow-[0_22px_55px_rgba(37,99,235,0.13)]"
                                                        : "border-slate-200/80 bg-white hover:border-blue-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.07)]"
                                                }
                                            `}
                                        >
                                            <div className="
                                                pointer-events-none
                                                absolute
                                                -right-10
                                                -top-10
                                                h-28
                                                w-28
                                                rounded-full
                                                bg-blue-50
                                                blur-2xl
                                                transition
                                                group-hover:scale-125
                                            " />

                                            <div className="
                                                relative
                                                flex
                                                items-start
                                                justify-between
                                                gap-4
                                            ">
                                                <div className="
                                                    flex
                                                    h-14
                                                    w-14
                                                    items-center
                                                    justify-center
                                                    rounded-2xl
                                                    bg-gradient-to-br
                                                    from-blue-600
                                                    to-cyan-500
                                                    text-white
                                                    shadow-lg
                                                    shadow-blue-500/15
                                                ">
                                                    <Icon
                                                        size={
                                                            23
                                                        }
                                                    />
                                                </div>

                                                <span className="
                                                    rounded-full
                                                    bg-slate-100
                                                    px-2.5
                                                    py-1
                                                    text-[9px]
                                                    font-black
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-500
                                                ">
                                                    {
                                                        mode.tag
                                                    }
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <h3 className="
                                                    mt-5
                                                    text-xl
                                                    font-black
                                                    tracking-tight
                                                    text-slate-800
                                                ">
                                                    {
                                                        mode.title
                                                    }
                                                </h3>

                                                <p className="
                                                    mt-2
                                                    text-sm
                                                    leading-6
                                                    text-slate-500
                                                ">
                                                    {
                                                        mode.description
                                                    }
                                                </p>
                                            </div>

                                            <div className="
                                                relative
                                                mt-6
                                                flex
                                                items-center
                                                justify-between
                                                text-xs
                                                font-black
                                                text-blue-600
                                            ">
                                                <span>
                                                    {active
                                                        ? "Selected"
                                                        : "Select strategy"}
                                                </span>

                                                <ChevronRight
                                                    size={
                                                        16
                                                    }
                                                    className="
                                                        transition
                                                        group-hover:translate-x-1
                                                    "
                                                />
                                            </div>
                                        </motion.button>
                                    );
                                }
                            )}
                        </div>
                    </section>

                        {/* =================================================
                            DIFFICULTY SELECTOR
                        ================================================== */}

                        <section className="mt-8">

                            <div className="mb-4">
                                <p className="
                                    text-[11px]
                                    font-black
                                    uppercase
                                    tracking-[0.18em]
                                    text-blue-600
                                ">
                                    Step 03 · Choose difficulty
                                </p>

                                <h3 className="
                                    mt-2
                                    text-xl
                                    font-black
                                    tracking-tight
                                    text-slate-800
                                ">
                                    How challenging should it be?
                                </h3>

                                <p className="
                                    mt-1
                                    text-sm
                                    leading-6
                                    text-slate-500
                                ">
                                    Choose the difficulty level for this learning session.
                                </p>
                            </div>

                            <div className="
                                grid
                                gap-3
                                sm:grid-cols-3
                            ">
                                {[
                                    {
                                        id: "easy",
                                        title: "Easy",
                                        description:
                                            "Fundamentals, simple examples, and guided questions.",
                                    },
                                    {
                                        id: "medium",
                                        title: "Medium",
                                        description:
                                            "Conceptual understanding with moderate reasoning.",
                                    },
                                    {
                                        id: "hard",
                                        title: "Hard",
                                        description:
                                            "Deeper reasoning and application-based problems.",
                                    },
                                ].map((level) => {
                                    const active =
                                        currentDifficulty ===
                                        level.id;

                                    return (
                                        <motion.button
                                            key={level.id}
                                            type="button"
                                            whileHover={{
                                                y: -3,
                                            }}
                                            whileTap={{
                                                scale: 0.985,
                                            }}
                                            onClick={() =>
                                                setCurrentDifficulty(
                                                    level.id
                                                )
                                            }
                                            className={`
                                                rounded-[24px]
                                                border
                                                p-5
                                                text-left
                                                transition-all
                                                ${
                                                    active
                                                        ? "border-blue-300 bg-blue-50 shadow-[0_18px_40px_rgba(37,99,235,0.10)]"
                                                        : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                                                } 
                                            `}
                                        >    
                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                            ">
                                                <h4 className="
                                                    text-lg
                                                    font-black
                                                    text-slate-800
                                                ">
                                                    {level.title}
                                                </h4>

                                                {active && (
                                                    <CheckCircle2
                                                        size={20}
                                                        className="
                                                            text-blue-600
                                                        "
                                                    />
                                                )}
                                            </div>

                                            <p className="
                                                mt-2
                                                text-xs
                                                leading-5
                                                text-slate-500
                                            ">
                                                {level.description}
                                            </p>

                                            <span className="
                                                mt-4
                                                inline-flex
                                                rounded-full
                                                bg-slate-100
                                                px-2.5
                                                py-1
                                                text-[9px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-500
                                            ">
                                                {active
                                                    ? "Selected"
                                                    : "Choose"}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </section>

                    {/* =================================================
                        START SESSION
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="
                            ai-tutor-session-card
                            mt-8
                            rounded-[30px]
                            border
                            border-slate-200/80
                            bg-gradient-to-br
                            from-white
                            to-slate-50
                            p-6
                            shadow-[0_15px_45px_rgba(15,23,42,0.05)]
                        "
                    >
                        <div className="
                            flex
                            flex-col
                            gap-5
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        ">
                            <div>
                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    text-blue-600
                                ">
                                    <Sparkles size={16} />

                                    <span className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.16em]
                                    ">
                                        Step 04 · Start Session
                                    </span>
                                </div>

                                <h3 className="
                                    mt-2
                                    text-xl
                                    font-black
                                    text-slate-800
                                ">
                                    Ready to begin?
                                </h3>

                                <p className="
                                    mt-1
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-slate-500
                                ">
                                    {selectedNote
                                        ? `${selectedNote.title} · ${getModeTitle()}`
                                        : "Select a note and learning strategy first."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    startLearning
                                }
                                disabled={
                                    !selectedNote ||
                                    sessionLoading
                                }
                                className="
                                    inline-flex
                                    shrink-0
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-cyan-500
                                    min-w-[190px]
                                    px-7
                                    py-3.5
                                    font-black
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/15
                                    transition
                                    hover:-translate-y-0.5
                                    hover:shadow-xl
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                {sessionLoading ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles
                                            size={17}
                                        />
                                        Start Learning
                                    </>
                                )}
                            </button>

                            {/* NEW Learning Intelligence button */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/learning-intelligence")
                                }
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    min-w-[210px]
                                    px-5
                                    py-3
                                    text-xs
                                    font-black
                                    text-blue-700
                                    shadow-sm
                                    shadow-blue-500/10
                                    transition
                                    hover:-translate-y-0.5
                                    hover:border-blue-300
                                    hover:bg-blue-100
                                    hover:shadow-md
                                "
                            >
                                <BarChart3 size={15} />
                                View Learning Intelligence
                            </button>
                        </div>
                    </motion.div>
                </>
            ) : (
                /* =====================================================
                   ACTIVE SESSION
                ====================================================== */

                <section className="mt-10">

                    {/* =================================================
                        SESSION HEADER
                    ================================================== */}

                    <div className="
                        ai-tutor-session-header
                        rounded-[30px]
                        border
                        border-slate-200/80
                        bg-white
                        p-5
                        shadow-sm
                        sm:p-6
                    ">

                        <div className="
                            flex
                            flex-col
                            gap-5
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        ">

                            <div className="
                                flex
                                min-w-0
                                items-center
                                gap-4
                            ">
                                <div className="
                                    flex
                                    h-14
                                    w-14
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-blue-600
                                    to-cyan-500
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/15
                                ">
                                    <GraduationCap
                                        size={
                                            25
                                        }
                                    />
                                </div>

                                <div className="min-w-0">

                                    <div className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    ">
                                        <span className="
                                            rounded-full
                                            bg-blue-50
                                            px-2.5
                                            py-1
                                            text-[9px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-blue-600
                                        ">
                                            {getModeTitle()}
                                        </span>

                                        <span className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            text-[10px]
                                            font-bold
                                            text-emerald-500
                                        ">
                                            <span className="
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                bg-emerald-400
                                            " />
                                            Adaptive session active
                                        </span>
                                    </div>

                                    <h2 className="
                                        mt-1
                                        truncate
                                        text-xl
                                        font-black
                                        text-slate-800
                                    ">
                                        {selectedNote?.title}
                                    </h2>

                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    resetSession
                                }
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    self-start
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-bold
                                    text-slate-600
                                    transition
                                    hover:border-blue-200
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                    lg:self-auto
                                "
                            >
                                <RotateCcw
                                    size={15}
                                />
                                New Session
                            </button>

                        </div>

                        {/* =================================================
                            LEARNING INTELLIGENCE
                        ================================================== */}

                        <div className="
                            mt-6
                            grid
                            gap-3
                            sm:grid-cols-4
                        ">

                            <div className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/70
                                px-4
                                py-3
                            ">
                                <p className="
                                    text-[9px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-slate-400
                                ">
                                    Interactions
                                </p>

                                <p className="
                                    mt-1
                                    text-xl
                                    font-black
                                    text-slate-800
                                ">
                                    {questionNumber}
                                </p>
                            </div>

                            <div className="
                                rounded-2xl
                                border
                                border-emerald-100
                                bg-emerald-50/60
                                px-4
                                py-3
                            ">
                                <p className="
                                    text-[9px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-emerald-600
                                ">
                                    Correct
                                </p>

                                <p className="
                                    mt-1
                                    text-xl
                                    font-black
                                    text-emerald-700
                                ">
                                    {correctAnswers}
                                </p>
                            </div>

                            <div className="
                                rounded-2xl
                                border
                                border-amber-100
                                bg-amber-50/60
                                px-4
                                py-3
                            ">
                                <p className="
                                    text-[9px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-amber-600
                                ">
                                    Focus Areas
                                </p>

                                <p className="
                                    mt-1
                                    text-xl
                                    font-black
                                    text-amber-700
                                ">
                                    {weakTopics.length}
                                </p>
                            </div>

                            <div className="
                                rounded-2xl
                                border
                                border-blue-100
                                bg-blue-50/60
                                px-4
                                py-3
                            ">
                                <p className="
                                    text-[9px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-blue-600
                                ">
                                    Difficulty
                                </p>

                                <p className="
                                    mt-1
                                    text-xl
                                    font-black
                                    capitalize
                                    text-blue-700
                                ">
                                    {currentDifficulty}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        SESSION BODY
                    ================================================== */}

                    <div className="
                        mt-6
                        grid
                        gap-6
                        lg:grid-cols-[1fr_300px]
                    ">

                        {/* =================================================
                            CONVERSATION
                        ================================================== */}

                        <div className="
                            ai-tutor-chat-panel
                            overflow-hidden
                            rounded-[30px]
                            border
                            border-slate-200/80
                            bg-white
                            shadow-[0_18px_50px_rgba(15,23,42,0.06)]
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                                border-b
                                border-slate-100
                                px-5
                                py-4
                            ">
                                <div className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                ">
                                    <MessageCircleQuestion
                                        size={18}
                                    />
                                </div>

                                <div>
                                    <h3 className="
                                        text-sm
                                        font-black
                                        text-slate-800
                                    ">
                                        Learning Session
                                    </h3>

                                    <p className="
                                        text-[10px]
                                        font-semibold
                                        text-slate-400
                                    ">
                                        The Tutor adapts as you respond.
                                    </p>
                                </div>
                            </div>

                            <div className="
                                ai-tutor-messages
                                min-h-[500px]
                                max-h-[620px]
                                space-y-4
                                overflow-y-auto
                                bg-slate-50/60
                                p-5
                            ">

                                <AnimatePresence>
                                    {messages.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const isUser =
                                                item.role ===
                                                "user";

                                            return (
                                                <motion.div
                                                    key={`${item.role}-${index}`}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className={
                                                        isUser
                                                            ? "flex justify-end"
                                                            : "flex justify-start"
                                                    }
                                                >

                                                    {!isUser && (
                                                        <div className="
                                                            mr-2
                                                            mt-1
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-gradient-to-br
                                                            from-blue-600
                                                            to-cyan-500
                                                            text-white
                                                        ">
                                                            <BrainCircuit
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                    <div
                                                        className={
                                                            isUser
                                                                ? `
                                                                    max-w-[84%]
                                                                    rounded-2xl
                                                                    rounded-br-md
                                                                    bg-gradient-to-br
                                                                    from-blue-600
                                                                    to-cyan-500
                                                                    px-4
                                                                    py-3
                                                                    text-sm
                                                                    leading-6
                                                                    text-white
                                                                    shadow-sm
                                                                `
                                                                : `
                                                                    max-w-[88%]
                                                                    rounded-2xl
                                                                    rounded-bl-md
                                                                    border
                                                                    border-slate-200
                                                                    bg-white
                                                                    px-4
                                                                    py-3
                                                                    text-sm
                                                                    leading-6
                                                                    text-slate-700
                                                                    shadow-sm
                                                                `
                                                        }
                                                    >

                                                        <p className="
                                                            whitespace-pre-wrap
                                                            break-words
                                                        ">
                                                            {
                                                                item.content
                                                            }
                                                        </p>

                                                        {!isUser &&
                                                            item.evaluation &&
                                                            item.evaluation !==
                                                                "none" && (
                                                                <div className="
                                                                    mt-3
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    border-t
                                                                    border-slate-100
                                                                    pt-3
                                                                ">
                                                                    {item.evaluation ===
                                                                    "correct" ? (
                                                                        <>
                                                                            <CheckCircle2
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="
                                                                                    text-emerald-500
                                                                                "
                                                                            />

                                                                            <span className="
                                                                                text-[10px]
                                                                                font-black
                                                                                uppercase
                                                                                tracking-wider
                                                                                text-emerald-600
                                                                            ">
                                                                                Correct response
                                                                            </span>
                                                                        </>
                                                                    ) : item.evaluation ===
                                                                      "incorrect" ? (
                                                                        <>
                                                                            <Target
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="
                                                                                    text-amber-500
                                                                                "
                                                                            />

                                                                            <span className="
                                                                                text-[10px]
                                                                                font-black
                                                                                uppercase
                                                                                tracking-wider
                                                                                text-amber-600
                                                                            ">
                                                                                Focus
                                                                                area
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="
                                                                            text-[10px]
                                                                            font-black
                                                                            uppercase
                                                                            tracking-wider
                                                                            text-blue-600
                                                                        ">
                                                                            Partial understanding
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                        {item.topic &&
                                                            !isUser && (
                                                                <div className="
                                                                    mt-2
                                                                    text-[9px]
                                                                    font-bold
                                                                    text-slate-400
                                                                ">
                                                                    Topic:{" "}
                                                                    {
                                                                        item.topic
                                                                    }
                                                                </div>
                                                            )}

                                                        {item.sources
                                                            ?.length >
                                                            0 && (
                                                            <div className="
                                                                mt-3
                                                                border-t
                                                                border-slate-200
                                                                pt-3
                                                            ">
                                                                <p className="
                                                                    mb-2
                                                                    text-[9px]
                                                                    font-black
                                                                    uppercase
                                                                    tracking-wider
                                                                    text-slate-400
                                                                ">
                                                                    Source notes
                                                                </p>

                                                                <div className="
                                                                    space-y-1.5
                                                                ">
                                                                    {item.sources.map(
                                                                        (
                                                                            source
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    source.id
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>{
                                                                                    window.open(
                                                                                        `${window.location.origin}/note/${source.id}`,
                                                                                        "_blank",
                                                                                        "noopener,noreferrer"
                                                                                    );
                                                                                }}
                                                                                className="
                                                                                    flex
                                                                                    w-full
                                                                                    items-center
                                                                                    justify-between
                                                                                    gap-2
                                                                                    rounded-xl
                                                                                    border
                                                                                    border-blue-100
                                                                                    bg-blue-50
                                                                                    px-3
                                                                                    py-2
                                                                                    text-left
                                                                                    transition
                                                                                    hover:-translate-y-0.5
                                                                                    hover:border-blue-200
                                                                                    hover:bg-blue-100
                                                                                    focus:outline-none
                                                                                    focus-visible:ring-2
                                                                                    focus-visible:ring-blue-400
                                                                                    focus-visible:ring-offset-2
                                                                                "
                                                                            >
                                                                                <span className="
                                                                                    line-clamp-2
                                                                                    text-[10px]
                                                                                    font-bold
                                                                                    text-blue-700
                                                                                ">
                                                                                    {
                                                                                        source.title
                                                                                    }
                                                                                </span>

                                                                                <ArrowRight
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                    className="
                                                                                        shrink-0
                                                                                        text-blue-400
                                                                                    "
                                                                                />
                                                                            </button>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </motion.div>
                                            );
                                        }
                                    )}
                                </AnimatePresence>

                                {sessionLoading && (
                                    <div className="
                                        flex
                                        items-end
                                        gap-2
                                    ">
                                        <div className="
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-gradient-to-br
                                            from-blue-600
                                            to-cyan-500
                                            text-white
                                        ">
                                            <BrainCircuit
                                                size={15}
                                            />
                                        </div>

                                        <div className="
                                            flex
                                            items-center
                                            gap-1
                                            rounded-2xl
                                            rounded-bl-md
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            shadow-sm
                                        ">
                                            <span className="
                                                h-2
                                                w-2
                                                animate-bounce
                                                rounded-full
                                                bg-blue-500
                                                [animation-delay:-0.3s]
                                            " />

                                            <span className="
                                                h-2
                                                w-2
                                                animate-bounce
                                                rounded-full
                                                bg-blue-400
                                                [animation-delay:-0.15s]
                                            " />

                                            <span className="
                                                h-2
                                                w-2
                                                animate-bounce
                                                rounded-full
                                                bg-cyan-400
                                            " />
                                        </div>
                                    </div>
                                )}

                            </div>

                            {sessionError && (
                                <div className="
                                    border-t
                                    border-red-100
                                    bg-red-50
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-red-600
                                ">
                                    {sessionError}
                                </div>
                            )}

                            <div className="
                                border-t
                                border-slate-200
                                bg-white
                                p-3
                            ">

                                <div className="
                                    flex
                                    items-end
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-2
                                    focus-within:border-blue-300
                                    focus-within:bg-white
                                    focus-within:ring-4
                                    focus-within:ring-blue-100
                                ">

                                    <textarea
                                        value={input}
                                        onChange={(
                                            event
                                        ) =>
                                            setInput(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        onKeyDown={
                                            handleKeyDown
                                        }
                                        placeholder={
                                            selectedMode ===
                                            "quiz"
                                                ? "Type your answer..."
                                                : selectedMode ===
                                                  "challenge"
                                                ? "Explain your reasoning..."
                                                : "Respond to your Tutor..."
                                        }
                                        rows={1}
                                        disabled={
                                            sessionLoading
                                        }
                                        className="
                                            max-h-32
                                            min-h-[40px]
                                            flex-1
                                            resize-none
                                            bg-transparent
                                            px-2
                                            py-2
                                            text-sm
                                            leading-6
                                            text-slate-700
                                            outline-none
                                            placeholder:text-slate-400
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            continueSession
                                        }
                                        disabled={
                                            sessionLoading ||
                                            !input.trim()
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-gradient-to-br
                                            from-blue-600
                                            to-cyan-500
                                            text-white
                                            shadow-md
                                            shadow-blue-500/15
                                            transition
                                            hover:scale-[1.03]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        {sessionLoading ? (
                                            <Loader2
                                                size={
                                                    18
                                                }
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Send
                                                size={
                                                    18
                                                }
                                            />
                                        )}
                                    </button>

                                </div>

                                <p className="
                                    mt-2
                                    text-center
                                    text-[10px]
                                    font-semibold
                                    text-slate-400
                                ">
                                    Enter to send · Shift + Enter
                                    for a new line
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            SESSION SIDEBAR
                        ================================================== */}

                        <aside className="space-y-5">

                            {/* Current mode */}

                            <div className="
                                ai-tutor-info-card
                                rounded-[26px]
                                border
                                border-slate-200/80
                                bg-white
                                p-5
                                shadow-sm
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    text-blue-600
                                ">
                                    <Trophy
                                        size={17}
                                    />

                                    <span className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-wider
                                    ">
                                        Learning Strategy
                                    </span>
                                </div>

                                <h3 className="
                                    mt-3
                                    text-lg
                                    font-black
                                    text-slate-800
                                ">
                                    {getModeTitle()}
                                </h3>

                                <p className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-slate-500
                                ">
                                    {selectedMode ===
                                        "teach" &&
                                        "Build understanding through explanation, examples, and guided checks."}

                                    {selectedMode ===
                                        "quiz" &&
                                        "Practice one question at a time while the session adjusts difficulty."}

                                    {selectedMode ===
                                        "challenge" &&
                                        "Test reasoning and application rather than simple recall."}
                                </p>

                            </div>

                            {/* Current focus */}

                            {lastTopic && (
                                <div className="
                                    ai-tutor-info-card
                                    rounded-[26px]
                                    border
                                    border-blue-100
                                    bg-blue-50/60
                                    p-5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                        text-blue-600
                                    ">
                                        <Target
                                            size={17}
                                        />

                                        <span className="
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                        ">
                                            Current Focus
                                        </span>
                                    </div>

                                    <h3 className="
                                        mt-3
                                        text-lg
                                        font-black
                                        text-slate-800
                                    ">
                                        {lastTopic}
                                    </h3>

                                    <p className="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-slate-500
                                    ">
                                        The Tutor is currently
                                        using this concept as
                                        the learning focus.
                                    </p>
                                </div>
                            )}

                            {/* Weak topics */}

                            {weakTopics.length >
                                0 && (
                                <div className="
                                    ai-tutor-info-card
                                    rounded-[26px]
                                    border
                                    border-amber-200
                                    bg-amber-50/60
                                    p-5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                        text-amber-600
                                    ">
                                        <Target
                                            size={17}
                                        />

                                        <span className="
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                        ">
                                            Focus Areas
                                        </span>
                                    </div>

                                    <h3 className="
                                        mt-3
                                        text-lg
                                        font-black
                                        text-slate-800
                                    ">
                                        Topics to review
                                    </h3>

                                    <div className="
                                        mt-3
                                        space-y-2
                                    ">
                                        {weakTopics.map(
                                            (topic) => (
                                                <div
                                                    key={
                                                        topic
                                                    }
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-amber-100
                                                        bg-white
                                                        px-3
                                                        py-2
                                                        text-xs
                                                        font-bold
                                                        text-slate-600
                                                    "
                                                >
                                                    <span className="
                                                        h-2
                                                        w-2
                                                        shrink-0
                                                        rounded-full
                                                        bg-amber-400
                                                    " />

                                                    {topic}
                                                </div>
                                            )
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* Reinforced topics */}

                            {reinforcedTopics.length >
                                0 && (
                                <div className="
                                    ai-tutor-info-card
                                    rounded-[26px]
                                    border
                                    border-emerald-100
                                    bg-emerald-50/60
                                    p-5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                        text-emerald-600
                                    ">
                                        <CheckCircle2
                                            size={17}
                                        />

                                        <span className="
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                        ">
                                            Reinforced
                                        </span>
                                    </div>

                                    <div className="
                                        mt-3
                                        space-y-2
                                    ">
                                        {reinforcedTopics.map(
                                            (topic) => (
                                                <div
                                                    key={
                                                        topic
                                                    }
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-emerald-100
                                                        bg-white
                                                        px-3
                                                        py-2
                                                        text-xs
                                                        font-bold
                                                        text-slate-600
                                                    "
                                                >
                                                    <CheckCircle2
                                                        size={
                                                            13
                                                        }
                                                        className="
                                                            shrink-0
                                                            text-emerald-500
                                                        "
                                                    />

                                                    {topic}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <p className="
                                        mt-3
                                        text-[10px]
                                        font-semibold
                                        leading-5
                                        text-emerald-700
                                    ">
                                        These concepts have been
                                        answered successfully during
                                        this session. This is not a
                                        mastery guarantee.
                                    </p>

                                </div>
                            )}

                            {/* Learn from source */}

                            <div className="
                                ai-tutor-info-card
                                rounded-[26px]
                                bg-gradient-to-br
                                from-blue-600
                                to-cyan-500
                                p-6
                                text-white
                                shadow-lg
                                shadow-blue-500/15
                            ">
                                <Lightbulb
                                    size={22}
                                />

                                <h3 className="
                                    mt-4
                                    text-xl
                                    font-black
                                ">
                                    Learn from the source
                                </h3>

                                <p className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-blue-50
                                ">
                                    The Tutor works around
                                    the selected NoteShare
                                    academic material and can
                                    bring you back to the source
                                    notes used in the session.
                                </p>
                            </div>

                        </aside>

                    </div>
                </section>
            )}
        </section>
    );
}

export default AITutor;