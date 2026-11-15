
import React, { useRef, useEffect, useState } from 'react';

export default function FirstWheel() {

    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const rotationRef = useRef(0);
    const spinningRef = useRef(false);
    const lastTickRef = useRef(0);

    const [result, setResult] = useState("Good Luck! 🍀");

    const options = [
        "Douna",
        "Zain",
        "Zoro",
        "Khalid",
        "Knowledge",
        "Uzair",
        "Ranjodha",
        "Urukodaki",
        "Akaza",
        "Tanjiro"
    ];

    const colors = [
        "#168c85",
        "#e74c3c",
        "#348b49",
        "#263e45",
        "#f5e7df",
        "#168c85",
        "#c0392b",
        "#9b382e",
        "#315d63",
        "#f5e7df"
    ];

    const center = 300;
    const radius = 280;
    const slice = (Math.PI * 2) / options.length;

    // Initialize sound
    function initSound() {
        if (!audioRef.current) {
            audioRef.current = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        if (audioRef.current.state === "suspended") {
            audioRef.current.resume();
        }
    }

    // Tick sound
    function playTick() {
        const audio = audioRef.current;
        if (!audio) return;

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 1100;

        gain.gain.setValueAtTime(0.16, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + 0.05
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start();
        oscillator.stop(audio.currentTime + 0.05);
    }

    // Winner sound
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
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                start + 0.35
            );

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(start);
            oscillator.stop(start + 0.4);
        });
    }

    // Draw wheel
    function drawWheel(rotation) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, 600, 600);

        options.forEach((option, i) => {

            const start = rotation + i * slice;
            const end = start + slice;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, start, end);
            ctx.closePath();

            ctx.fillStyle = colors[i];
            ctx.fill();

            ctx.strokeStyle = "#ffffff66";
            ctx.lineWidth = 3;
            ctx.stroke();

            // Text
            ctx.save();

            ctx.translate(center, center);
            ctx.rotate(start + slice / 2);

            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 23px Arial";

            ctx.fillText(option, radius - 25, 0);

            ctx.restore();
        });

        // Outer border
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 10;
        ctx.stroke();
    }

    // Initial wheel
    useEffect(() => {
        drawWheel(0);
    }, []);

    // Spin wheel
    function spin() {

        if (spinningRef.current) return;

        initSound();

        spinningRef.current = true;
        setResult("Spinning...");

        const startRotation = rotationRef.current;

        lastTickRef.current = Math.floor(startRotation / slice);

        const extraRotation = Math.PI * 2 * (6 + Math.random() * 4);
        const randomAngle = Math.random() * Math.PI * 2;

        const targetRotation =
            startRotation + extraRotation + randomAngle;

        const duration = 5500;
        const startTime = performance.now();

        function animate(now) {

            const progress = Math.min(
                (now - startTime) / duration,
                1
            );

            const ease = 1 - Math.pow(1 - progress, 4);

            const rotation =
                startRotation +
                (targetRotation - startRotation) * ease;

            rotationRef.current = rotation;

            // Tick sound
            const currentTick = Math.floor(rotation / slice);

            if (currentTick > lastTickRef.current) {
                playTick();
                lastTickRef.current = currentTick;
            }

            drawWheel(rotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {

                // Calculate winner
                const normalized =
                    ((Math.PI * 1.5 - rotation) %
                    (Math.PI * 2) + Math.PI * 2) %
                    (Math.PI * 2);

                const selectedIndex =
                    Math.floor(normalized / slice) % options.length;

                setResult(
                    "🏆 Winner: " + options[selectedIndex]
                );

                spinningRef.current = false;

                playWin();
            }
        }

        requestAnimationFrame(animate);
    }

    return (
        <>
            <style>{`
                .wheel-container {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    background: #171717;
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }

                .wheel-box {
                    position: relative;
                    width: min(340px, 85vw);
                    aspect-ratio: 1;
                    margin: 30px auto;
                }

                .wheel-canvas {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    filter: drop-shadow(0 0 12px #000);
                }

                .wheel-pointer {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 17px solid transparent;
                    border-right: 17px solid transparent;
                    border-top: 35px solid white;
                    z-index: 3;
                }

                .wheel-spin-btn {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    border: 5px solid white;
                    background: #111;
                    color: white;
                    font-size: 17px;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 4;
                }

                .wheel-spin-btn:hover {
                    background: #444;
                }

                .wheel-result {
                    font-size: 23px;
                    font-weight: bold;
                    color: #ffd166;
                }
            `}</style>

            <div className="wheel-container">

                <h2>🎯 Lucky Spin Wheel</h2>
                <p>Spin the wheel and find your winner!</p>

                <div className="wheel-box">

                    <div className="wheel-pointer"></div>

                    <canvas
                        ref={canvasRef}
                        className="wheel-canvas"
                        width={600}
                        height={600}
                    />

                    <button
                        className="wheel-spin-btn"
                        onClick={spin}
                    >
                        SPIN
                    </button>

                </div>

                <div className="wheel-result">
                    {result}
                </div>

            </div>
        </>
    );
}
