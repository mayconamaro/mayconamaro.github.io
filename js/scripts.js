const toggle = document.querySelector('.toggle input[type="checkbox"]');


function switchMode(toggle) {
    if (toggle.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    else {
        document.documentElement.removeAttribute('data-theme');
    }    
}

toggle.addEventListener('change', switchMode, false);
