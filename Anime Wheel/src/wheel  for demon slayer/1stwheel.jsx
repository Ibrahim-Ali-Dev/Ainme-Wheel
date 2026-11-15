import { useRef, useEffect, useState, useCallback, useMemo } from 'react';

export default function FirstWheel() {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const rotationRef = useRef(0);
    const spinningRef = useRef(false);
    const lastSliceRef = useRef(-1);

    const [result, setResult] = useState("Good Luck! 🍀");

    // ✅ 1. NAMES
    const options = useMemo(() => [
        "Demon Slayer",
        "Demon",
        "Reincarnation",
        "Descendant",
        "Hybrid"
    ], []);

    // ✅ 2. PERCENTAGES STATE (Yahan se default values set karein)
    const [percentages, setPercentages] = useState([
        25, // Demon Slayer
        25, // Demon
        28,  // Reincarnation
        8,  // Descendant
        9   // Hybrid
    ]);

    // ✅ 3. SEPARATE LINK FOR EACH NAME
    const links = useMemo(() => [
        "https://example.com",
        "https://example.com",
        "https://example.com",
        "https://example.com",
        "https://example.com"
    ], []);

    // ✅ 4. TEXT SIZE
    const textSizes = useMemo(() => [
        24, // Demon Slayer
        28, // Demon
        16, // Reincarnation
        17, // Descendant
        19  // Hybrid
    ], []);

    // ✅ 5. COLORS (Image jaisa bright red se dark maroon)
    const colors = useMemo(() => [
        "#b50d0d", // Demon Slayer
        "#e60c0c", // Demon
        "#240707", // Reincarnation
        "#380909", // Descendant
        "#540c0c"  // Hybrid
    ], []);

    const center = 300;
    const radius = 280;

    // ✅ PERCENTAGE SE HAR SLICE KA ANGLE CALCULATE KARNA
    const slices = useMemo(() => {
        const total = percentages.reduce((sum, val) => sum + (Number(val) || 0), 0) || 100;
        let currentAngle = 0;

        return percentages.map((pct) => {
            const validPct = Number(pct) || 0;
            const angle = (validPct / total) * Math.PI * 2;
            const start = currentAngle;
            const end = currentAngle + angle;
            currentAngle = end;
            return { start, end, angle };
        });
    }, [percentages]);

    // Top pointer ke niche kaun sa slice hai
    const getSliceIndexAtPointer = useCallback((rotation) => {
        const pointerAngle = ((Math.PI * 1.5 - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

        for (let i = 0; i < slices.length; i++) {
            if (pointerAngle >= slices[i].start && pointerAngle < slices[i].end) {
                return i;
            }
        }
        return slices.length - 1;
    }, [slices]);

    function initSound() {
        if (!audioRef.current) {
            audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioRef.current.state === "suspended") {
            audioRef.current.resume();
        }
    }

    function playTick() {
        const audio = audioRef.current;
        if (!audio) return;

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 1100;

        gain.gain.setValueAtTime(0.16, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05);

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start();
        oscillator.stop(audio.currentTime + 0.05);
    }

    function playWin() {
        const audio = audioRef.current;
        if (!audio) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];

        notes.forEach((frequency, i) => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            const start = audio.currentTime + i * 0.15;

            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(start);
            oscillator.stop(start + 0.4);
        });
    }

    const drawWheel = useCallback((rotation) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 600, 600);

        options.forEach((option, i) => {
            if (slices[i].angle <= 0) return;

            const start = rotation + slices[i].start;
            const end = rotation + slices[i].end;
            const midAngle = start + slices[i].angle / 2;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, start, end);
            ctx.closePath();

            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.strokeStyle = "#ffffff33";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(midAngle);

            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${textSizes[i]}px Arial`;

            ctx.fillText(option, radius - 25, 0);
            ctx.restore();
        });

        // Outer translucent ring
        ctx.beginPath();
        ctx.arc(center, center, radius - 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 10;
        ctx.stroke();
    }, [center, colors, options, radius, slices, textSizes]);

    useEffect(() => {
        drawWheel(rotationRef.current);
    }, [drawWheel]);

    function spin() {
        if (spinningRef.current) return;

        initSound();
        spinningRef.current = true;
        setResult("Spinning...");

        const startRotation = rotationRef.current;
        lastSliceRef.current = getSliceIndexAtPointer(startRotation);

        const extraRotation = Math.PI * 2 * (6 + Math.random() * 4);
        const randomAngle = Math.random() * Math.PI * 2;
        const targetRotation = startRotation + extraRotation + randomAngle;

        const duration = 5500;
        const startTime = performance.now();

        function animate(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            const rotation = startRotation + (targetRotation - startRotation) * ease;

            rotationRef.current = rotation;

            const currentSlice = getSliceIndexAtPointer(rotation);
            if (currentSlice !== lastSliceRef.current) {
                playTick();
                lastSliceRef.current = currentSlice;
            }

            drawWheel(rotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                const selectedIndex = getSliceIndexAtPointer(rotation);
                setResult(options[selectedIndex]);

                spinningRef.current = false;
                playWin();

                setTimeout(() => {
                    window.location.href = links[selectedIndex];
                }, 1200);
            }
        }

        requestAnimationFrame(animate);
    }

    return (
        <>
            <style>{`
                /* ✅ SCROLL COMPLETELY BAND */
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    overflow: hidden; 
                    background: #2b0a0a;
                }

                .wheel-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    background: #2b0a0a;
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    overflow: hidden;
                }

                .wheel-title-small {
                    font-size: 16px;
                    font-weight: 400;
                    color: #ffffff;
                    letter-spacing: 0.5px;
                    margin: 0;
                    margin-top: 10px;
                }

                .wheel-selected-name {
                    font-size: 38px;
                    font-weight: 900;
                    color: #cccccc;
                    letter-spacing: 2px;
                    margin: 5px 0 10px 0;
                    text-transform: capitalize;
                    text-shadow: 0 4px 8px rgba(0,0,0,0.6);
                    min-height: 45px;
                }

                .wheel-box {
                    position: relative;
                    width: min(340px, 85vw);
                    aspect-ratio: 1;
                    margin: 0 auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .wheel-canvas {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    filter: drop-shadow(0 0 15px rgba(0,0,0,0.8));
                }

                .wheel-pointer {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 18px solid transparent;
                    border-right: 18px solid transparent;
                    border-top: 40px solid white;
                    z-index: 3;
                }

                .wheel-spin-btn {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    border: 4px solid white;
                    background: #0a0a0a;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    z-index: 4;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.7);
                }

                .wheel-spin-btn:hover {
                    background: #222;
                }
            `}</style>

            <div className="wheel-container">

                <p className="wheel-title-small">Who are u in Demon Slayer Verse?</p>

                <h1 className="wheel-selected-name">{result}</h1>

                <div className="wheel-box">
                    <div className="wheel-pointer"></div>
                    <canvas
                        ref={canvasRef}
                        className="wheel-canvas"
                        width={600}
                        height={600}
                    />
                    <button className="wheel-spin-btn" onClick={spin}>
                        SPIN
                    </button>
                </div>

            </div>
        </>
    );
}