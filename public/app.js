// function usernameErr(){
//     let username = document.querySelector("#username");
//     if(!(username.value))
//         username.nextElementSibling.innerText = "enter a username";
    
//     if(username.value)
//         username.nextElementSibling.innerText = "invalid username";
// }

// function passErr(){
//     let pass = document.querySelector("#pass");
//     if(!(pass.value))
//         pass.nextElementSibling.innerText = "enter a password";
    
//     if(pass.value)
//         pass.nextElementSibling.innerText = "invalid pass";
// }

function showHidePass(){
    let input = document.querySelector("#pass");
    let pass = document.querySelector(".pass");
    pass.addEventListener("click", () => {
        if(pass.getAttribute("class") === "bi bi-eye-slash pass"){
            pass.setAttribute("class", "bi bi-eye-fill pass");
            input.setAttribute("type", "password")
        }else{
            pass.setAttribute("class", "bi bi-eye-slash pass");
            input.setAttribute("type", "text");
        }
    })
}

function directToAPI(){
    let options = document.querySelector("#selectOddType");
    let form = document.querySelector(".upload_form");
    form.setAttribute("action", `/${options.value}`);
}



directToAPI()

let select = document.querySelectorAll(".option");

select.forEach(elem => {
    elem.addEventListener("mouseover", ()=> {
        elem.classList.add("hov");
    })
})

select.forEach(elem => {
    elem.addEventListener("mouseleave", ()=> {
        elem.classList.remove("hov");
    })
})

let options = document.querySelector("#selectOddType");
options.addEventListener("change",()=> {
    directToAPI()
})

function openModal(){
    let dropdown = document.querySelector(".drop_down");
    dropdown.classList.toggle("show")
}
let hamburger = document.querySelector(".hamburger");
hamburger.addEventListener("click",openModal)



