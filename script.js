const apologies = [
    "I'm truly sorry.",
    "Please forgive me.",
    "I never wanted to hurt you.",
    "I regret my mistakes.",
    "You deserve better.",
    "I'm sorry from my heart.",
    "I wish I could undo everything.",
    "Please understand my feelings.",
    "I never meant to disappoint you.",
    "I'm genuinely sorry.",
    "I should have listened.",
    "I should have understood you.",
    "I miss your smile.",
    "I regret hurting you.",
    "You mean so much to me.",
    "I made a mistake.",
    "I hope you understand.",
    "I never wanted this distance.",
    "I'm sorry for my words.",
    "I wish things were different.",
    "You didn't deserve that.",
    "I should have been more careful.",
    "I value you deeply.",
    "I'm sorry for everything.",
    "Please don't stay upset.",
    "I wish I could turn back time.",
    "My intentions were never bad.",
    "I know I was wrong.",
    "I want to make things right.",
    "I'm sorry for my behaviour.",
    "I should have treated you better.",
    "Your feelings matter to me.",
    "I never wanted tears.",
    "I regret my actions.",
    "Please give me another chance.",
    "I promise to learn.",
    "I should have thought twice.",
    "I'm sorry for being careless.",
    "You deserve happiness.",
    "I never wanted to lose you.",
    "I hope you can smile again.",
    "I take responsibility.",
    "I should have been patient.",
    "I'm sorry for the misunderstanding.",
    "I care about you.",
    "I wish I could explain better.",
    "I know words aren't enough.",
    "I'll try to do better.",
    "I regret making you sad.",
    "Please accept my sincere apology.",
    "I should have respected your feelings.",
    "I'm sorry for ignoring you.",
    "I never wanted to upset you.",
    "You are important to me.",
    "I wish I had acted differently.",
    "I'm sorry for my silence.",
    "I should have communicated better.",
    "I never meant to be rude.",
    "I want to earn your trust.",
    "I know I hurt you.",
    "I'm sorry for being stubborn.",
    "I should have stayed calm.",
    "I regret that moment.",
    "You deserved my understanding.",
    "I hope we can move forward.",
    "I'm sorry for my attitude.",
    "I should have been kinder.",
    "I never wanted an argument.",
    "I value our bond.",
    "I wish I could fix this.",
    "I'm sorry for disappointing you.",
    "I should have trusted you.",
    "I never wanted to make excuses.",
    "Your happiness matters.",
    "I'm learning from this.",
    "I regret not understanding.",
    "I should have shown more care.",
    "I'm sorry for the pain.",
    "I want to make you smile.",
    "Please forgive my mistakes.",
    "I should have been honest.",
    "I'm sorry for my impatience.",
    "I never wanted to hurt your heart.",
    "I wish I had chosen better words.",
    "I respect your feelings.",
    "I'm sorry for not being there.",
    "I want to make things better.",
    "I know I need to improve.",
    "I regret every hurtful moment.",
    "You deserve my best.",
    "I hope you forgive me someday.",
    "I'm sorry beyond words.",
    "I wish I could take it back.",
    "I'll remember this lesson.",
    "I never take you for granted.",
    "I'm sorry for everything I did.",
    "I want to rebuild our bond.",
    "You matter more than my ego.",
    "I truly mean this apology."
];


const messagesLayer = document.getElementById("messagesLayer");
const centerMessage = document.getElementById("centerMessage");
const counter = document.getElementById("counter");
const wheelContainer = document.getElementById("wheelContainer");
const hint = document.getElementById("hint");
const replayBtn = document.getElementById("replay");

const TOTAL = apologies.length;
const MAX_LEN = Math.max(...apologies.map(a => a.length));
const HOLD_TIME = 2000;   // how long each sentence stays in the centre (ms)

let index = 0;
let playing = false;
let items = [];
let activeItem = null;

/* Work out how big everything can be for the current screen.
   Each message gets its own spoke (like a bicycle wheel), reading outward,
   so neighbouring messages can never touch each other. */
function metrics() {
    const R = wheelContainer.clientWidth;
    const r0 = R * 0.245;                       // where the spokes start
    const L = R * 0.495 - r0;                   // length available to each spoke
    const spacing = 2 * Math.PI * r0 / TOTAL;   // gap between neighbouring spokes
    const font = Math.min(L / (MAX_LEN * 0.54), spacing * 0.95, 14);
    return { R, r0, L, font, textMode: font >= 7 };
}

function place(item) {
    const m = metrics();
    const el = item.el;
    const a = item.angle;
    const goesRight = Math.cos(a * Math.PI / 180) >= 0;

    wheelContainer.classList.toggle("dots", !m.textMode);

    if (!m.textMode) {
        // Small screens: a glowing dot on the ring; tap it to read it
        el.className = "wheel-message dot" + (item === activeItem ? " active" : "");
        el.style.cssText = `width:9px;height:9px;margin:-4.5px 0 0 -4.5px;transform-origin:50% 50%;`;
        el.style.transform = `rotate(${a}deg) translateX(${m.R * 0.31}px)`;
        el.style.opacity = "1";
        return;
    }

    const h = m.font * 1.4;
    el.className = "wheel-message " + (goesRight ? "right" : "left") + (item === activeItem ? " active" : "");
    el.style.cssText = `width:${m.L}px;height:${h}px;font-size:${m.font}px;margin-top:${-h / 2}px;`;

    if (goesRight) {
        el.style.transformOrigin = "0 50%";
        el.style.transform = `rotate(${a}deg) translateX(${m.r0}px)`;
    } else {
        // flip the left half so the text is never upside down
        el.style.marginLeft = `${-m.L}px`;
        el.style.transformOrigin = "100% 50%";
        el.style.transform = `rotate(${a - 180}deg) translateX(${-m.r0}px)`;
    }
    el.style.opacity = "1";
}

function showInCentre(text) {
    centerMessage.style.opacity = "0";
    setTimeout(() => {
        centerMessage.textContent = text;
        centerMessage.style.opacity = "1";
    }, 200);
}

function setActive(item) {
    if (activeItem) activeItem.el.classList.remove("active");
    activeItem = item;
    if (item) item.el.classList.add("active");
}

function showNextApology() {
    if (index >= TOTAL) { finishWheel(); return; }

    const angle = -90 + index * 360 / TOTAL;

    const el = document.createElement("div");
    el.className = "wheel-message";
    const span = document.createElement("span");
    span.textContent = apologies[index];
    el.appendChild(span);
    messagesLayer.appendChild(el);

    const item = { el, angle, text: apologies[index] };
    items.push(item);
    el.addEventListener("click", () => {
        if (!playing) { setActive(item); showInCentre(item.text); }
    });

    // 1. Say it in the centre
    centerMessage.textContent = item.text;
    centerMessage.style.opacity = "1";

    // 2. Start the new message at the centre, then glide it out to its spoke
    const m = metrics();
    el.style.cssText = "transform:scale(0.2);opacity:0;";
    void el.offsetWidth;
    setActive(item);
    place(item);

    index++;
    counter.textContent = `${index} / ${TOTAL}`;

    // 3. Fade the centre text out, then continue with the next one
    setTimeout(() => {
        centerMessage.style.opacity = "0";
        setTimeout(showNextApology, 400);
    }, HOLD_TIME);
}

function finishWheel() {
    playing = false;
    setActive(null);
    wheelContainer.classList.add("done");
    centerMessage.innerHTML = `
        <div class="final-heart">
            ❤️
            <p>I hope you can forgive me.</p>
        </div>`;
    centerMessage.style.opacity = "1";
    hint.textContent = "Tap any message around the circle to read it again.";
    replayBtn.style.display = "inline-block";
}

function start() {
    playing = true;
    index = 0;
    items = [];
    activeItem = null;
    messagesLayer.innerHTML = "";
    wheelContainer.classList.remove("done");
    replayBtn.style.display = "none";
    hint.textContent = "";
    counter.textContent = `0 / ${TOTAL}`;
    centerMessage.textContent = "I'm truly sorry ❤️";
    centerMessage.style.opacity = "1";
    setTimeout(showNextApology, 1200);
}

replayBtn.addEventListener("click", start);

// Re-fit everything if the screen is resized or rotated
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => items.forEach(place), 150);
});

const bgMusic = document.getElementById("bgMusic");
const enterBtn = document.getElementById("enterBtn");

enterBtn.addEventListener("click", async () => {

    try {
        bgMusic.volume = 0.5;
        await bgMusic.play();

        enterBtn.classList.add("hidden");

        start();

    } catch (error) {
        alert("Music could not start. Please try again.");
    }

});