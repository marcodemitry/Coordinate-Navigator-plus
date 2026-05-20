let lastVoiceTime = 0;

let lastDirection = "";

/* --------------------------
   Speak Function
---------------------------*/

function speak(text){

    const now = Date.now();

    /* Prevent Spam */

    if(now - lastVoiceTime < 4000){

        return;

    }

    lastVoiceTime = now;

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang = "en-US";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    speechSynthesis.speak(
        utterance
    );

}

/* --------------------------
   Voice Navigation
---------------------------*/

function voiceDirection(angle){

    let direction = "";

    if(angle > -20 && angle < 20){

        direction =
            "Move forward";

    }

    else if(angle >= 20 && angle < 60){

        direction =
            "Move slightly right";

    }

    else if(angle >= 60 && angle < 120){

        direction =
            "Turn right";

    }

    else if(angle >= 120){

        direction =
            "Turn around";

    }

    else if(angle <= -20 && angle > -60){

        direction =
            "Move slightly left";

    }

    else if(angle <= -60 && angle > -120){

        direction =
            "Turn left";

    }

    else if(angle <= -120){

        direction =
            "Turn around";

    }

    /* Prevent Repeat */

    if(direction !== lastDirection){

        lastDirection = direction;

        speak(direction);

    }

}