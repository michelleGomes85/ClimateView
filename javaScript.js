const KEY_API = KEY_API_HEAR;

let control = 0;

window.onload = function() {

    const current_time = document.querySelector('#current-time');
    const current_date = document.querySelector('#current-date');

    function updateTime() {
        
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('pt-BR');

        current_time.textContent = `${formattedTime} `;
    }

    const formattedDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const daysOfWeek = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const currentWeekDay = new Date().getDay();

    current_date.textContent = `${daysOfWeek[currentWeekDay]}, ${formattedDate}` ;

    setInterval(updateTime, 1000);

    fetchCityCoordinates('Barbacena');
};

const temperatures = { current: null, min: null, max: null };
const city_name = document.getElementById('name_city');


const btn_request = document.querySelector('#request');
const btn_celsius = document.getElementById('btn-celsius');
const btn_kelvin = document.getElementById('btn-kelvin');
const next_page = document.querySelector('.next-page');
const previous_page = document.querySelector('.previous-page');

const content = document.querySelector('.content');
const content_initial = document.querySelector('.content-initial');
const content_initial_active = document.querySelector('.content-initial-active');
const content_active = document.querySelector('.content-active');

btn_request.onclick = function () {
    fetchCityCoordinates(city_name.value);
    city_name.value = '';
}

function next_page_func() {

    if (control != 0) {
        content_initial.style.display = 'none';
        content.style.display = 'flex';
        previous_page.style.display = 'block';
        next_page.style.display = 'none';
        content_initial_active.style.backgroundColor = "transparent";
        content_active.style.backgroundColor = "#FFF";    
    } else {
        previous_page_func();
        control = 1;
    }
}

function previous_page_func() {
    content_initial.style.display = 'block';
    content.style.display = 'none';
    content_initial_active.style.backgroundColor = "#FFF";
    content_active.style.backgroundColor = "transparent";
    previous_page.style.display = 'none';
    next_page.style.display = 'block';

    city_name.focus();
}

next_page.onclick = next_page_func;
previous_page.onclick = previous_page_func;

content_initial_active.onclick = previous_page_func;
content_active.onclick = next_page_func;

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') 
        next_page_func();

    if (event.key === 'ArrowLeft')
        previous_page_func();
});

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {

    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance)
    
        next_page_func();
    
    if (swipeDistance < -minSwipeDistance)
        previous_page_func();
}

city_name.addEventListener("keypress", function(event) {

    if (event.key === "Enter") { 
        event.preventDefault(); 
        document.getElementById("request").click(); 
    }
});

// Função que busca coordenadas da cidade
function fetchCityCoordinates(city) {

    var request = new XMLHttpRequest();

    request.onloadend = function() {
        if (request.status === 200) { 
            let response_obj = JSON.parse(request.responseText);
            console.log(response_obj);
            fetchWeatherInfo(response_obj[0]['lat'], response_obj[0]['lon']);
        } else {
            console.error("Erro ao buscar coordenadas da cidade.");
        }
    };

    request.open('GET', "https://api.openweathermap.org/geo/1.0/direct?q=" + encodeURIComponent(city) + "&appid=" + KEY_API);
    request.send(null);
}

// Função que busca informações climáticas usando as coordenadas
function fetchWeatherInfo(latitude, longitude) {

    var request = new XMLHttpRequest();

    request.onloadend = function() {
        if (request.status === 200) { 
            let response_obj = JSON.parse(request.responseText);
            storeTemperatures(response_obj);
            showInformations(response_obj);
        } else {
            console.error("Erro ao buscar informações do tempo.");
        }
    };

    request.open('GET', "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=" + KEY_API);

    request.send(null);
}

// Armazena as temperaturas
function storeTemperatures(response_obj) {
    temperatures.current = response_obj.main.temp;
    temperatures.min = response_obj.main.temp_min;
    temperatures.max = response_obj.main.temp_max;

    temperatures.kelvin = {
        current: convertCelsiusToKelvin(temperatures.current),
        min: convertCelsiusToKelvin(temperatures.min),
        max: convertCelsiusToKelvin(temperatures.max)
    };

    updateBackgroundByTemperature(temperatures.current);
}

// Atualiza o fundo com base na temperatura
function updateBackgroundByTemperature(tempCelsius) {
    let backgroundClass;

    if (tempCelsius >= 40)
        backgroundClass = '--very-hot-gradient';
    else if (tempCelsius >= 30)
        backgroundClass = '--hot-gradient';
    else if (tempCelsius >= 25)
        backgroundClass = '--warm-gradient';
    else if (tempCelsius >= 20)
        backgroundClass = '--mild-warm-gradient';
    else if (tempCelsius >= 15)
        backgroundClass = '--mild-gradient';
    else if (tempCelsius >= 10)
        backgroundClass = '--cool-mild-gradient';
    else if (tempCelsius >= 5)
        backgroundClass = '--cool-gradient';
    else if (tempCelsius >= 0)
        backgroundClass = '--cold-gradient';
    else if (tempCelsius >= -10)
        backgroundClass = '--very-cold-gradient';
    else
        backgroundClass = '--freezing-gradient';

    document.documentElement.style.setProperty('--current-gradient', `var(${backgroundClass})`);
}


function showInformations(response_obj) {

    document.getElementById('name_city_info').innerHTML = `${response_obj.name} - `;
    document.getElementById('name_country_info').innerHTML = `${response_obj.sys.country}`;
    document.getElementById('icon-time').innerHTML = `<img id="imagem_icone" src="https://openweathermap.org/img/wn/${response_obj.weather[0].icon}@2x.png">`
    document.getElementById('description-time').innerHTML = `${response_obj.weather[0].description}`;
    document.getElementById('wind-speed').innerText = `${response_obj.wind.speed} km/h`;
    document.getElementById('sunrise-time').innerText = new Date(response_obj.sys.sunrise * 1000).toLocaleTimeString();
    document.getElementById('sunset-time').innerText = new Date(response_obj.sys.sunset * 1000).toLocaleTimeString();

    showTemperatures('C');
    next_page.click();
}

// Mostra as temperaturas na tela
function showTemperatures(unit) {
    if (unit === 'C') {
        document.getElementById('current-temperature').innerText = `${temperatures.current.toFixed(1)}°`;
        document.getElementById('min-temperature').innerText = `${temperatures.min.toFixed(1)}°C`;
        document.getElementById('max-temperature').innerText = `${temperatures.max.toFixed(1)}°C`;

        btn_celsius.style.color = '#daf1f8';
        btn_celsius.style.fontWeight = 'bolder';

        btn_kelvin.style.color = '#E0E0E0';
        btn_kelvin.style.fontWeight = 'normal';
    } else {
        document.getElementById('current-temperature').innerText = `${temperatures.kelvin.current} `;
        document.getElementById('min-temperature').innerText = `${temperatures.kelvin.min} K`;
        document.getElementById('max-temperature').innerText = `${temperatures.kelvin.max} K`;

        btn_celsius.style.color = '#E0E0E0';
        btn_celsius.style.fontWeight = 'normal';

        btn_kelvin.style.fontWeight = 'bolder';
        btn_kelvin.style.color = '#daf1f8';
    }
}

btn_celsius.onclick = function() {
    showTemperatures('C'); 
}

btn_kelvin.onclick = function() {
    showTemperatures('K'); 
}

function convertCelsiusToKelvin(celsius) {
    return (celsius + 273.15).toFixed(1);
}
