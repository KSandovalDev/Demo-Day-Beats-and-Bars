window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("skip").addEventListener("click",swipeLeft)
    document.getElementById("play").addEventListener("click",swipeRight)
    console.log('DOM fully loaded and parsed');
});
console.log("LOADING!")

function swipeLeft() {
    console.log("WORKING!")
    document.querySelector(".stageProfile:last-child").classList.add("swipedLeft")
    let lastProfile = document.querySelector(".stageProfile:last-child");
    lastProfile.ontransitionend = function(event) {
        lastProfile.parentNode.removeChild(lastProfile);
      }

}

function swipeRight() {
    console.log("WORKING222!")
    document.querySelector(".stageProfile:last-child").classList.add("swipedRight");
    let lastProfile = document.querySelector(".stageProfile:last-child");
    lastProfile.ontransitionend = function(event) {
        lastProfile.parentNode.removeChild(lastProfile);
      }

}


// document.getElementById("play").addEventListener("click",likeUser)

// function likeUser(){
//     userEmail = document.getElementById("userEmail").value
//     console.log(userEmail)
// }



// window.addEventListener('DOMContentLoaded', (event) => {

//     var LikeBtn = [...document.querySelectorAll(".play")]
//     LikeBtn.forEach(element =>{
//     element.addEventListener("click", ()=>{
//            const userEmail = this.parentNode.childNodes[0]
//     })})
    


// });