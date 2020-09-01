var myMusic= document.getElementById("music");
var myMusicBtn = document.getElementById("muteBtn");

function mute() {
    if (!myMusic.paused) {
        myMusic.pause(); 
        myMusicBtn.innerHTML = "Unmute";
    } else {
        myMusic.play();
        myMusicBtn.innerHTML = "Mute";
    }
}
