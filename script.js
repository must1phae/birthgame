document.addEventListener('DOMContentLoaded', () => {
    const startAnimationBtn = document.getElementById('startAnimationBtn');
    const initialStateContainer = document.querySelector('.container.initial-state');
    const cakeContainer = document.querySelector('.cake-container');
    const cakeScene = document.querySelector('.cake-scene');
    const happyBirthdayText = document.querySelector('.happy-birthday-text');
    const recipientName = document.querySelector('.recipient-name');
    const confettiContainer = document.querySelector('.confetti-container');

    // Get all individual cake elements for animation
    const cakeElements = [
        document.querySelector('.plate'),
        document.querySelector('.layer-3'),
        document.querySelector('.layer-2'),
        document.querySelector('.layer-1'),
        document.querySelector('.icing'),
        document.querySelector('.candle-stem'),
        document.querySelector('.flame')
    ];

    // Function to calculate and apply scaling factor
    function adjustCakeScale() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Base dimensions of the cake scene (at scale 1)
        const baseCakeWidth = 280; // from CSS .cake-scene width
        const baseCakeHeight = 300; // from CSS .cake-scene height + space for text

        // Target maximum width/height for the cake container (allowing space for text above)
        const maxContentWidth = viewportWidth * 0.8; // 80% of viewport width
        const maxContentHeight = viewportHeight * 0.7; // 70% of viewport height (leave space for text and margins)

        // Calculate scale based on width and height
        let scaleFactorWidth = maxContentWidth / baseCakeWidth;
        let scaleFactorHeight = maxContentHeight / baseCakeHeight;

        // Use the smaller scale factor to ensure it fits both width and height
        let scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight, 1); // Max scale is 1 (original size)

        // Apply scale factor as a CSS variable
        document.documentElement.style.setProperty('--scale-factor', scaleFactor);
    }

    // Call on load and resize
    adjustCakeScale();
    window.addEventListener('resize', adjustCakeScale);


    startAnimationBtn.addEventListener('click', () => {
        // Read recipient name from input and update display
        const recipientInput = document.getElementById('recipientInput');
        const name = recipientInput && recipientInput.value.trim() ? recipientInput.value.trim() : 'Lovie';
        recipientName.textContent = name;

        // Play a short melody to set the mood
        try {
            playMelody();
        } catch (e) {
            // if WebAudio not allowed or blocked, ignore
            console.warn('Audio play failed', e);
        }

        // Spawn a few floating hearts for extra romance
        spawnHearts(document.querySelector('.hearts-container'), 14);
        // Start fold animation of the card (3D open effect)
        const card = document.querySelector('.card');
        if (card) card.classList.add('open');

        // Prevent further clicks
        initialStateContainer.style.pointerEvents = 'none';

        // Wait for the fold animation to mostly complete before revealing cake
        setTimeout(() => {
            // Hide initial state after fold
            initialStateContainer.style.display = 'none';
            // Reveal cake
            cakeContainer.classList.remove('hidden');
            cakeContainer.classList.add('animate');

            // Trigger individual cake element animations
            cakeElements.forEach(element => {
                if (element) {
                    element.classList.add('animated');
                }
            });

            // After a delay, trigger confetti and individual letter animation
            setTimeout(() => {
                createConfetti(confettiContainer, 80); // 80 confetti pieces

                // Animate Happy Birthday text
                const hbLetters = happyBirthdayText.querySelectorAll('.hb-letter');
                hbLetters.forEach((letter, index) => {
                    letter.style.animationDelay = `${3.5 + index * 0.08}s`; // Staggered delay for each letter
                    letter.classList.add('animated'); // Add class to trigger CSS animation
                });
                happyBirthdayText.classList.add('animated'); // Also apply main text animation

                // Animate Recipient Name
                recipientName.style.animationDelay = `${3.8 + (hbLetters.length * 0.08)}s`; // After all letters
                recipientName.classList.add('animated');

                // When the recipient name animation ends, show the paper with the prewritten message
                const onNameAnimEnd = (ev) => {
                    // only trigger for the main animation end
                    if (ev && ev.animationName) {
                        showPaperNow();
                        recipientName.removeEventListener('animationend', onNameAnimEnd);
                    }
                };
                recipientName.addEventListener('animationend', onNameAnimEnd);

            }, 3000); // Start confetti and text animation after cake is mostly built (adjust timing)

        }, 500); // Delay hiding initial state for smooth transition
    });


    function createConfetti(container, numConfetti) {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ffa500', '#8a2be2'];

        for (let i = 0; i < numConfetti; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.style.setProperty('--x-start', `${(Math.random() - 0.5) * 200}px`);
            confetti.style.setProperty('--x-end', `${(Math.random() - 0.5) * 400}px`);

            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;
            confetti.style.animationDelay = `${Math.random() * 0.8}s`;
            container.appendChild(confetti);
        }
    }

    // After whole animation completes, show the paper for the personal message
    function showPaperAfterDelay() {
        // Total approximate time: cake build (≈2.7s) + confetti/text (≈3s) + letter animation (hbLetters.length * 0.08)
        const totalDelay = 3000 + 3800; // rough safety buffer in ms
        setTimeout(() => {
            const paperContainer = document.querySelector('.paper-container');
            const paper = document.querySelector('.paper');
            if (!paperContainer) return;
            // Load saved message if any
            const saved = localStorage.getItem('loveMessage');
            const textarea = document.getElementById('loveMessage');
            if (saved && textarea) textarea.value = saved;

            paperContainer.classList.remove('hidden');
            paperContainer.setAttribute('aria-hidden', 'false');

            // Wire buttons
            const saveBtn = document.getElementById('saveMessageBtn');
            const printBtn = document.getElementById('printMessageBtn');
            const closeBtn = document.getElementById('closePaperBtn');
            if (saveBtn) saveBtn.onclick = () => {
                const text = textarea.value;
                localStorage.setItem('loveMessage', text);
                saveBtn.textContent = 'Enregistré ✓';
                setTimeout(() => saveBtn.textContent = 'Enregistrer', 2000);
            };
            if (printBtn) printBtn.onclick = () => {
                // open a printable view
                const win = window.open('', '_blank');
                const content = `<html><head><title>Message</title></head><body><pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:18px">${(textarea.value||'').replace(/</g,'&lt;')}</pre></body></html>`;
                win.document.write(content);
                win.document.close();
                win.focus();
                win.print();
            };
            if (closeBtn) closeBtn.onclick = () => {
                paperContainer.classList.add('hidden');
                paperContainer.setAttribute('aria-hidden', 'true');
            };
        }, totalDelay);
    }

    // Reusable AudioContext for melody and pen sounds
    let audioCtx = null;

    function ensureAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        if (!audioCtx) audioCtx = new AudioContext();
        return audioCtx;
    }
    // Immediate show of the paper modal (used after animations complete)
    function showPaperNow() {
        const paperContainer = document.querySelector('.paper-container');
        const paper = document.querySelector('.paper');
        if (!paperContainer) return;
    // Use the prewritten message inside the view (readonly)
    const view = document.getElementById('loveMessageView');

        paperContainer.classList.remove('hidden');
        paperContainer.setAttribute('aria-hidden', 'false');

        const closeBtn = document.getElementById('closePaperBtn');

        // Display the handwritten view immediately with the recipient's name
        if (view) {
            const raw = view.textContent || '';
            const recipientName = document.getElementById('recipientInput').value.trim() || 'amie';
            // Replace the placeholder with the actual name
            const personalizedMessage = raw.replace('${name}', recipientName);
            // Put the full text directly into the view and mark revealed
            view.innerHTML = '';
            // Use textContent to preserve line breaks
            view.textContent = personalizedMessage;
            view.classList.add('revealed');
            // Trigger signature shortly after (300ms) so the user can see the message
            setTimeout(() => animateSignature(), 300);
        }
        // Close button handler
        if (closeBtn) closeBtn.onclick = () => {
            paperContainer.classList.add('hidden');
            paperContainer.setAttribute('aria-hidden', 'true');
        };
    }

    // Animate pen to trace the SVG signature path and reveal it
    function animateSignature() {
        const pen = document.querySelector('.pen');
        const path = document.getElementById('signaturePath');
        if (!pen || !path) return;

        const length = path.getTotalLength();
        // Ensure dasharray matches length for smooth reveal
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        pen.classList.add('visible');

        const duration = 1200; // ms
        const start = performance.now();

        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const draw = t * length;
            path.style.strokeDashoffset = Math.max(0, Math.round(length - draw));

            // position pen at current point
            const pt = path.getPointAtLength(draw);
            // compute a nearby point to estimate tangent (use small delta)
            const delta = Math.min(8, length - draw);
            const pt2 = path.getPointAtLength(Math.min(length, draw + delta));
            // transform pen to (pt.x, pt.y) relative to SVG and paper
            // compute offsets from svg bounding box
            const svg = path.ownerSVGElement;
            const bbox = svg.getBoundingClientRect();
            // map SVG point to CSS coordinates inside the paper
            const svgPointX = (pt.x / svg.viewBox.baseVal.width) * bbox.width + bbox.left;
            const svgPointY = (pt.y / svg.viewBox.baseVal.height) * bbox.height + bbox.top;

            // compute angle (tangent) in SVG coordinate space
            const angleRad = Math.atan2(pt2.y - pt.y, pt2.x - pt.x);
            const angleDeg = angleRad * 180 / Math.PI;

            // Position pen centered on the nib
            const paperRect = document.querySelector('.paper').getBoundingClientRect();
            const left = svgPointX - paperRect.left - 18; // adjust for pen width
            const top = svgPointY - paperRect.top - 8;   // adjust for pen height
            // rotate pen to follow tangent; subtract 90deg so nib points along the path
            const rotateDeg = angleDeg - 90;
            pen.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${rotateDeg}deg) scale(0.9)`;

            // play small pen ticks occasionally
            if (Math.random() > 0.7) playPenTick();

            if (t < 1) requestAnimationFrame(step);
            else {
                // finished
                setTimeout(() => { pen.style.opacity = '0'; }, 400);
            }
        }

        requestAnimationFrame(step);
    }


    /* Simple floating hearts generator */
    function spawnHearts(container, count) {
        if (!container) return;
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            // size variation
            if (Math.random() > 0.8) heart.classList.add('big');
            if (Math.random() < 0.2) heart.classList.add('small');

            const left = Math.random() * 100;
            heart.style.left = `${left}%`;
            heart.style.bottom = `-10vh`;
            const duration = 3 + Math.random() * 4;
            const delay = Math.random() * 1.2;
            heart.style.animation = `floatUp ${duration}s ${delay}s ease-in forwards`;
            // color variation
            const hue = Math.floor(330 + Math.random() * 40);
            heart.style.background = `linear-gradient(45deg, hsl(${hue} 90% 65%), hsl(${hue - 30} 90% 55%))`;

            container.appendChild(heart);

            // Remove after animation
            setTimeout(() => heart.remove(), (delay + duration) * 1000 + 500);
        }
    }

    /* Happy Birthday melody synchronized with cake animation */
    function playMelody() {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Happy Birthday notes frequencies
        const notes = [
            // Happy
            [392.00], // G4
            [392.00], // G4
            [440.00], // A4
            [392.00], // G4
            [523.25], // C5
            [493.88], // B4
            
            // Birth
            [392.00], // G4
            [392.00], // G4
            [440.00], // A4
            [392.00], // G4
            [587.33], // D5
            [523.25], // C5

            // day
            [392.00], // G4
            [392.00], // G4
            [783.99], // G5
            [659.26], // E5
            [523.25], // C5
            [493.88], // B4
            [440.00], // A4

            // to
            [698.46], // F5
            [698.46], // F5
            [659.26], // E5
            [523.25], // C5
            [587.33], // D5
            [523.25]  // C5
        ];

        const noteTimings = [
            0, 0.5, 1, 1.5, 2, 3,      // Happy
            4, 4.5, 5, 5.5, 6, 7,      // Birth
            8, 8.5, 9, 9.5, 10, 10.5, 11, // day
            12, 12.5, 13, 13.5, 14, 15    // to you
        ];

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(ctx.destination);

            const start = now + noteTimings[i];
            const dur = 0.4;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
            gain.gain.linearRampToValueAtTime(0, start + dur);

            osc.start(start);
            osc.stop(start + dur + 0.02);
        });

        // Start a new loop of the melody after it finishes
        setTimeout(() => playMelody(), noteTimings[noteTimings.length - 1] * 1000 + 1000);
    }

    // Small pen tick sound to simulate writing
    function playPenTick() {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 1800 + Math.random() * 800;
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.14);
    }
});